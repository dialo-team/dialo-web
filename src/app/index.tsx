import "./styles/global.css";
import { RouterProvider } from "react-router-dom";
import { routes } from "./configs/router";
import { useAuthStore } from "../../store/authStore";
import { useEffect } from "react";
import { getMeApi } from "../../api/social/me/meApi";

const App = () => {
  const hydrate = useAuthStore((state) => state.hydrate);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Load user data from API after hydrate
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const meRes = await getMeApi();
          if (meRes?.data) {
            setUser(meRes.data);
          }
        } catch (err) {
          console.error("Failed to load user data:", err);
        }
      }
    };
    loadUser();
  }, [setUser]);

  return (
    <div className="w-screen h-screen">
      <RouterProvider router={routes} />
    </div>
  );
};

export { App };
