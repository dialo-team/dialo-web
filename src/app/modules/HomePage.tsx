import { Sidebar } from "../components/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

export const HomePage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar bên trái */}
      <Sidebar />

      {/* Nội dung bên phải */}
      <div className="flex-1 min-h-0 min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};
