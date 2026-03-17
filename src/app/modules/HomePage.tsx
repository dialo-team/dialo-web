import { Sidebar } from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export const HomePage = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Nội dung bên phải */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
