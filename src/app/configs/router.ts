import { createBrowserRouter } from "react-router-dom";

const adminRoute = [{}];

const userRoute = [{}];

const guestRoute = [{}];

export const routes = createBrowserRouter([
  ...guestRoute,
  ...userRoute,
  ...adminRoute,
]);
