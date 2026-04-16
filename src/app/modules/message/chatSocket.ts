import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type TopicMessageHandler = (payload: unknown, message: IMessage) => void;
type ManagedSubscription = {
  destination: string;
  onMessage: TopicMessageHandler;
  stompSubscription: StompSubscription | null;
};

const SOCKET_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://14.225.254.174:9000";
const SOCKET_HTTP_ENDPOINT = `${SOCKET_BASE_URL}/ws-chat`;
const USE_NATIVE_WS = import.meta.env.VITE_CHAT_USE_NATIVE_WS === "true";
const DEBUG_SOCKET = import.meta.env.VITE_CHAT_DEBUG_SOCKET === "true";

const toWebSocketUrl = (httpUrl: string) => {
  if (httpUrl.startsWith("https://")) {
    return `wss://${httpUrl.slice("https://".length)}`;
  }
  if (httpUrl.startsWith("http://")) {
    return `ws://${httpUrl.slice("http://".length)}`;
  }
  return httpUrl;
};

const SOCKET_WS_ENDPOINT = toWebSocketUrl(SOCKET_HTTP_ENDPOINT);

let stompClient: Client | null = null;
let activationPromise: Promise<Client> | null = null;
const managedSubscriptions = new Map<string, ManagedSubscription>();
let subscriptionCounter = 0;

const getConnectHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (typeof parsedUser?.id === "string") {
        headers["X-User-Id"] = parsedUser.id;
      }
    }
  } catch {
    // ignore invalid localStorage user payload
  }

  return headers;
};

const createClient = () => {
  const client = new Client({
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectHeaders: {},
    ...(USE_NATIVE_WS
      ? {
          brokerURL: SOCKET_WS_ENDPOINT,
        }
      : {
          webSocketFactory: () =>
            new SockJS(SOCKET_HTTP_ENDPOINT, null, {
              transports: ["websocket"],
            }),
        }),
  });

  client.beforeConnect = async () => {
    client.connectHeaders = getConnectHeaders();
  };

  client.onConnect = () => {
    managedSubscriptions.forEach((subscription) => {
      if (subscription.stompSubscription) {
        return;
      }

      subscription.stompSubscription = client.subscribe(
        subscription.destination,
        (message) => {
          subscription.onMessage(tryParseBody(message.body), message);
        },
      );
    });
  };

  client.onWebSocketClose = () => {
    activationPromise = null;
    managedSubscriptions.forEach((subscription) => {
      subscription.stompSubscription = null;
    });
  };

  client.onStompError = (frame) => {
    if (DEBUG_SOCKET) {
      console.error("STOMP error:", frame.headers["message"], frame.body);
    }
  };

  client.onWebSocketError = (event) => {
    if (DEBUG_SOCKET) {
      console.error("WebSocket error:", event);
    }
  };

  return client;
};

const ensureConnected = async (): Promise<Client> => {
  if (stompClient?.connected) {
    return stompClient;
  }

  if (activationPromise) {
    return activationPromise;
  }

  if (!stompClient) {
    stompClient = createClient();
  }

  activationPromise = new Promise<Client>((resolve, reject) => {
    if (!stompClient) {
      reject(new Error("Unable to initialize STOMP client"));
      return;
    }

    const client = stompClient;
    const originalConnect = client.onConnect;
    const originalWebSocketError = client.onWebSocketError;

    client.onConnect = (frame) => {
      originalConnect(frame);
      resolve(stompClient as Client);
      activationPromise = null;
      client.onWebSocketError = originalWebSocketError;
    };

    client.onWebSocketError = (event) => {
      originalWebSocketError(event);
      if (DEBUG_SOCKET) {
        console.error("WebSocket error:", event);
      }
      reject(new Error("WebSocket connection failed"));
      activationPromise = null;
      client.onWebSocketError = originalWebSocketError;
    };

    if (!client.active) {
      client.activate();
    }
  });

  return activationPromise;
};

const tryParseBody = (body: string): unknown => {
  if (!body) {
    return null;
  }

  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
};

export const subscribeChatTopic = (
  destination: string,
  onMessage: TopicMessageHandler,
): (() => void) => {
  const subscriptionId = `sub-${subscriptionCounter}`;
  subscriptionCounter += 1;

  managedSubscriptions.set(subscriptionId, {
    destination,
    onMessage,
    stompSubscription: null,
  });

  void ensureConnected()
    .then((client) => {
      const managed = managedSubscriptions.get(subscriptionId);
      if (!managed || managed.stompSubscription) {
        return;
      }

      managed.stompSubscription = client.subscribe(destination, (message) => {
        managed.onMessage(tryParseBody(message.body), message);
      });
    })
    .catch((error) => {
      if (DEBUG_SOCKET) {
        console.error(`Subscribe failed for ${destination}:`, error);
      }
    });

  return () => {
    const managed = managedSubscriptions.get(subscriptionId);

    if (managed?.stompSubscription) {
      managed.stompSubscription.unsubscribe();
    }

    managedSubscriptions.delete(subscriptionId);
  };
};
