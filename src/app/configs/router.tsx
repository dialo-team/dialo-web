import { createBrowserRouter } from "react-router-dom";
// 1. Import trang Login (Nhớ kiểm tra đúng đường dẫn nhé)
import { LoginPage } from "../modules/auth/LoginPage";

const adminRoute = [];

const userRoute = [];

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
