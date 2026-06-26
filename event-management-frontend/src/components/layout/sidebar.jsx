import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  Settings,
  Library,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/auth-context";
import { Button } from "../ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ['admin', 'organizer', 'staff'] },
  { name: "Events", href: "/events", icon: Calendar, roles: ['admin', 'organizer', 'staff'] },
  { name: "Attendees", href: "/attendees", icon: Users, roles: ['admin', 'organizer', 'staff'] },
  { name: "Ticketing", href: "/ticketings", icon: Ticket, roles: ['admin', 'organizer'] },
  { name: "Library", href: "/library", icon: Library, roles: ['admin', 'organizer'] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ['admin', 'organizer', 'staff'] },
];

export function Sidebar({ collapsed = false, onToggle, mobileOpen = false, setMobileOpen }) {
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center border-b border-border/50 px-3 shrink-0">
        <div className="flex items-center justify-between w-full">
          {!collapsed && (
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">EventHub</span>
            </NavLink>
          )}
          <Button variant="ghost" size="sm" onClick={onToggle} className="hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-200">
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${collapsed ? "justify-center" : ""}
                ${isActive
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 dark:from-indigo-950/40 dark:to-purple-950/40 dark:text-purple-300 shadow-sm"
                  : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground"
                }
              `}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:rotate-[-3deg] ${collapsed ? "mx-auto" : ""}`} />
              {!collapsed && <span className="text-sm font-medium truncate">{item.name}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {item.name}
                </div>
              )}
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-gradient-to-b from-indigo-500 to-purple-500" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border/50 p-3 shrink-0">
        <button onClick={handleLogout} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full group ${collapsed ? "justify-center" : ""} text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400`}>
          <LogOut className={`h-5 w-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${collapsed ? "mx-auto" : ""}`} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Logout
            </div>
          )}
        </button>
        {!collapsed && <div className="mt-4 text-center text-[10px] text-muted-foreground/50">v2.0.0 • © {new Date().getFullYear()}</div>}
      </div>
    </>
  );

  return (
    <>
      <aside className={`hidden md:flex fixed inset-y-0 left-0 z-40 flex-col border-r bg-background transition-all duration-300 ease-in-out ${collapsed ? "w-20" : "w-64"}`}>
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-background border-r transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">EventHub</span>
          </NavLink>
          <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 dark:from-indigo-950/40 dark:to-purple-950/40 dark:text-purple-300 shadow-sm"
                    : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>
        <div className="border-t border-border/50 p-3">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400">
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
