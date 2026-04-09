import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { LoginPage } from "../modules/auth/LoginPage";
import { HomePage } from "../modules/HomePage";
import { FriendsPage } from "../modules/social/friendPage/FriendsPage";
import { FriendListPage } from "../modules/social/friendPage/listFriend/FriendListPage";
import { GroupListPage } from "../modules/social/friendPage/groupList/GroupListPage";
import { FriendSearchPage } from "../modules/social/friendPage/searchAndAddFriend/FriendSearchPage";
import { FriendInvite } from "@/app/modules/social/friendPage/friendInvite/FriendInvite";
import { GroupInvite } from "@/app/modules/social/friendPage/groupInvite/GroupInvite";
import { ChatPage } from "../modules/message/ChatPage";
import { ChatWindow } from "../modules/message/ChatWindow";
import { PrivateRoute } from "../modules/auth/PrivateRoute";


const adminRoute: RouteObject[] = [];

const userRoute: RouteObject[] = [];

const protectedRoute = [
  {
    path: "/home",
    element: <PrivateRoute><HomePage /></PrivateRoute>,
    // element: <HomePage />,
    children: [
      {
        path: "chat",
        element: <ChatPage />,
        children: [
          {
            index: true,
            element: <ChatWindow />,
          },
        ],
      },
      {
        path: "friendHome",
        element: <FriendsPage />,
        children: [
          {
            index: true,
            element: <FriendListPage />,
          },
          {
            path: "groups",
            element: <GroupListPage />,
          },
          {
            path: "friendInvite",
            element: <FriendInvite />,
          },
          {
            path: "groupInvite",
            element: <GroupInvite />,
          },
          {
            path: "search",
            element: <FriendSearchPage />,
          },
        ],
      },
    ],
  },
]

const guestRoute = [
  {
    path: "/login", // Đường dẫn trên trình duyệt
    element: <LoginPage />, // Component sẽ hiện ra
  },

  // Nếu muốn vào trang chủ (/) cũng hiện Login luôn thì thêm cái này:
  {
    path: "/",
    element: <LoginPage />,
  },

];

export const routes = createBrowserRouter([
  ...guestRoute,
  ...userRoute,
  ...adminRoute,
  ...protectedRoute
]);
