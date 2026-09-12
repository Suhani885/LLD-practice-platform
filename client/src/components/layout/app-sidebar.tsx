import { Blocks, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme-toggle";
import { NAV_ITEMS } from "./nav-items";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Blocks className="size-4.5" />
        </div>
        <span className="font-semibold text-sidebar-foreground tracking-tight">LLD Practice</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="size-4.5" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      {user && (
        <div className="border-t border-sidebar-border px-3 py-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/50">{user.email}</p>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <button
              onClick={handleLogout}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
            <ThemeToggle />
          </div>
        </div>
      )}
    </aside>
  );
}
