
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainHeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const MainHeader: React.FC<MainHeaderProps> = ({ onToggleSidebar, sidebarOpen }) => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background px-2 sm:px-4 md:px-6">
      {/* Menu toggle button */}
      <Button 
        variant="ghost" 
        size={isMobile ? "sm" : "icon"} 
        className={isMobile ? "mr-1" : "mr-2"}
        onClick={onToggleSidebar}
      >
        {isMobile && sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        
        <Button variant="ghost" size={isMobile ? "sm" : "icon"} className={isMobile ? "h-8 w-8 relative" : ""}>
          <Bell className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
          <span className="sr-only">Notifications</span>
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-destructive text-[8px] sm:text-[10px] font-bold text-destructive-foreground">
            3
          </span>
        </Button>

        <Avatar className={isMobile ? "h-7 w-7" : "h-8 w-8"}>
          <AvatarImage src="" alt="User" />
          <AvatarFallback className={isMobile ? "text-xs" : "text-sm"}>JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
