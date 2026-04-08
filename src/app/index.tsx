import "./styles/global.css";
import { RouterProvider } from "react-router-dom";
import { routes } from "./configs/router";

const App = () => {
  return (
    <div className="w-screen h-screen">
      <RouterProvider router={routes} />
    </div>
  );
};

export { App };
