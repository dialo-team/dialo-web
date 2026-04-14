import "./styles/global.css";
import { RouterProvider } from "react-router-dom";
import { routes } from "./configs/router";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";

const App = () => {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="w-screen h-screen">
      <RouterProvider router={routes} />
    </div>
  );
};

export { App };
