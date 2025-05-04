import { useState, useCallback } from "react";
import { Bell, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MainHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const isMobile = useIsMobile();
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleProfileClick = useCallback(() => {
    toast.info("Navigating to profile page");
    setIsDropdownOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    toast.success("Logged out successfully");
    setIsDropdownOpen(false);
    // Add logout logic here (e.g., clear auth token, redirect)
  }, []);

  const handleNotificationClick = useCallback(() => {
    toast.info(`You have ${notifications} new notifications`);
    // Add logic to view notifications
  }, [notifications]);

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-3 sm:px-6 lg:px-8 shadow-sm">
      {/* Menu toggle button */}
      <Button
        variant="ghost"
        size={isMobile ? "sm" : "icon"}
        className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? (
          <X className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
        ) : (
          <Menu className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
        )}
      </Button>

      {/* Right-side controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <Button
          variant="ghost"
          size={isMobile ? "sm" : "icon"}
          className="relative p-2 hover:bg-muted rounded-lg transition-colors duration-200"
          onClick={handleNotificationClick}
          aria-label={`View ${notifications} notifications`}
        >
          <Bell className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              {notifications > 9 ? "9+" : notifications}
            </span>
          )}
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar with Dropdown */}
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="p-1 rounded-full hover:bg-muted transition-colors duration-200"
              aria-label="User menu"
            >
              <Avatar className={isMobile ? "h-8 w-8" : "h-9 w-9"}>
                <AvatarImage src="" alt="User" />
                <AvatarFallback
                  className={`${
                    isMobile ? "text-xs" : "text-sm"
                  } font-medium bg-muted text-muted-foreground`}
                >
                  JD
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 mt-2 rounded-lg shadow-lg">
            <DropdownMenuLabel className="font-semibold text-sm">
              John Doe
              <span className="block text-xs text-muted-foreground">john.doe@example.com</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleProfileClick}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted rounded-md"
            >
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted rounded-md"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};