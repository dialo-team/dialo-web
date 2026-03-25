import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { LoginPage } from "../modules/auth/LoginPage";
import { HomePage } from "../modules/HomePage";
import { ChatPage } from "../modules/social/chatPage/chatPage";
import { FriendsPage } from "../modules/social/friendPage/FriendsPage";
import { FriendListPage } from "../modules/social/friendPage/listFriend/FriendListPage";
import { GroupListPage } from "../modules/social/friendPage/groupList/GroupListPage";
import { FriendSearchPage } from "../modules/social/friendPage/searchAndAddFriend/FriendSearchPage";
import { FriendInvite } from "@/app/modules/social/friendPage/friendInvite/FriendInvite";
import { GroupInvite } from "@/app/modules/social/friendPage/groupInvite/GroupInvite";

const adminRoute: RouteObject[] = [];

const userRoute: RouteObject[] = [];

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
  {
    path: "/home",
    element: <HomePage />,
    children: [
      {
        path: "chat",
        element: <ChatPage />,
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
];

export const routes = createBrowserRouter([
  ...guestRoute,
  ...userRoute,
  ...adminRoute,
]);
