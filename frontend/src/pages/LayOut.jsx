import NavBar from "@/components/NavBar";
import SideBar from "../components/SideBar";
import { Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function LayOut() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="h-screen w-screen bg-gray-100 overflow-hidden">
      <NavBar userType="Doctor" />
      <div className="flex h-[calc(100vh-64px)]">
        <SideBar />
        <div className={cn(
          "flex-1 overflow-y-auto scrollbar-thin scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 transition-colors",
          isMobile && "pb-20 px-4"
        )}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}