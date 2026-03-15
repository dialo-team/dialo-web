import { Sidebar } from "../components/Sidebar/Sidebar"; 

export const HomePage = () => {
  return (
    <div className="flex h-screen bg-[var(--page-color)]">
      <Sidebar />
    </div>
  );
};