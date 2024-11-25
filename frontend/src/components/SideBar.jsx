import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Search,
  Bell,
  Settings,
  User,
  BarChart3,
  Activity,
  Calendar,
  Users,
  AlertTriangle,
  FileText,
  Heart,
  Clock,
  Pill,
  Clipboard,
  Hospital,
  UserCog,
  Database,
  Shield,
  Menu,
  ChevronRight,
  ChevronLeft,
  Home,
  ClipboardList,
} from "lucide-react";
import { Dashboard } from "@mui/icons-material";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { setIn } from "formik";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function SideBar() {
  const [activeTab, setActiveTab] = useState(window.location.href.split("/")[3] || "dashboard");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const menuItems = [
    {
      group: "Main",
      items: [
        { icon: Dashboard, label: "Dashboard", id: "dashboard" },
        { icon: Users, label: "My Patients", id: "patients" },
      ]
    },
    {
      group: "Clinical",
      items: [
        { icon: Activity, label: "Risk Predictions", id: "predictions" },
        { icon: Clipboard, label: "Treatment Plans", id: "treatments" },
        { icon: Hospital, label: "Rooms", id: "rooms" },
      ]
    }
  ];

  const NavButton = ({ icon: Icon, label, id }) => {
    const isActive = activeTab === id;
    
    if (isMobile) {
      return (
        <Link className="text-black" to={id}>
          <Button
            variant={isActive ? "default" : "ghost"}
            className={cn(
              "flex flex-col items-center justify-center p-2 py-6",
              isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
              !isActive && "hover:bg-accent",
              "rounded-lg"
            )}
            onClick={() => setActiveTab(id)}
          >
            <Icon className={cn("h-5 w-5", isActive && "text-current")} />
            <span className="text-xs mt-1">{label}</span>
          </Button>
        </Link>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link className="text-black" to={id}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-200 mt-[6px]",
                isCollapsed ? "justify-center p-2" : "px-4",
                isActive && "bg-primary text-primary-foreground hover:bg-primary/90",
                !isActive && "hover:bg-accent",
                "rounded-lg"
              )}
              onClick={() => setActiveTab(id)}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 transition-transform",
                  !isCollapsed && "mr-3",
                  isActive && "text-current"
                )} 
              />
              {!isCollapsed && (
                <span className="font-medium">{label}</span>
              )}
            </Button>
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <Link to={id}>
            <TooltipContent side="right" className="font-medium">
              <p>{label}</p>
            </TooltipContent>
            </Link>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md">
        <div className="flex justify-around items-center p-2">
          {menuItems.map((group) =>
            group.items.map((item) => (
              <NavButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                id={item.id}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white sticky top-0 shadow-md relative transition-all duration-300 border-r flex flex-col",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 border-b">
        <div className={cn(
          "flex items-center",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && <span className="font-bold text-xl">Menu</span>}
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-accent rounded-full p-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto">
        <nav className="space-y-6">
          {menuItems.map((group, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">
                  {group.group}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavButton
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    id={item.id}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t p-3">
        <NavButton
          icon={UserCog}
          label="Settings"
          id="settings"
        />
      </div>
    </div>
  );
}