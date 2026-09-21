import { LogOut, Menu  } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/context/useAuth";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

interface NavbarProps {
  onMenuClick?: () => void;
}

function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page context */}
      <div className="hidden lg:block">
        <p className="text-sm font-medium">
          Project Management Portal
        </p>

        <p className="text-[11px] text-muted-foreground">
          Shree Balaji Associates
        </p>
      </div>

      {/* User */}
      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-medium">
            {user?.name}
          </p>

          <p className="text-[10px] text-muted-foreground">
            {user?.role?.replaceAll("_", " ")}
          </p>
        </div>

        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-xs text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

export default Navbar;