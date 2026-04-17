import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

type TopicMessageHandler = (payload: unknown, message: IMessage) => void;

type ManagedSubscription = {
  destination: string;
  onMessage: TopicMessageHandler;
  stompSubscription: StompSubscription | null;
};

const DEFAULT_SOCKET_BASE_URL = "http://14.225.254.174:8085";
const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_BASE_URL?.trim() || DEFAULT_SOCKET_BASE_URL;
const SOCKET_HTTP_ENDPOINT = `${SOCKET_BASE_URL.replace(/\/+$/, "")}/ws-chat`;
const DEBUG_SOCKET = import.meta.env.VITE_CHAT_DEBUG_SOCKET === "true";

let stompClient: Client | null = null;
let activationPromise: Promise<Client> | null = null;
const managedSubscriptions = new Map<string, ManagedSubscription>();
let subscriptionCounter = 0;

const normalizeUserId = (value: unknown): string | null => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

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
      const userId = normalizeUserId(parsedUser?.id);
      if (userId) {
        headers["X-User-Id"] = userId;
      }
    }
  } catch {
    // Ignore malformed persisted user payloads.
  }

  return headers;
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

const createClient = () => {
  const client = new Client({
    reconnectDelay: 3000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    connectHeaders: {},
    webSocketFactory: () => new SockJS(SOCKET_HTTP_ENDPOINT),
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
      resolve(client);
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
