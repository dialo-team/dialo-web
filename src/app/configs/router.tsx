import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { LoginPage } from "../modules/auth/LoginPage";

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
];

export const routes = createBrowserRouter([
  ...guestRoute,
  ...userRoute,
  ...adminRoute,
]);
