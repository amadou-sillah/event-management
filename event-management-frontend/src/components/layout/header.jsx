import { Search, Bell, Moon, Sun, User } from "lucide-react";
import { useTheme } from "../../contexts/theme-context";
import { useAuth } from "../../contexts/auth-context";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function Header() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search events, attendees..." className="pl-8" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 pl-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium hidden sm:inline">{user?.name || "User"}</span>
        </div>
      </div>
    </header>
  );
}