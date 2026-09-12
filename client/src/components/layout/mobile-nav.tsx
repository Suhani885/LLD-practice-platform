import { Blocks, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/login");
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu" />}
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2 text-left">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Blocks className="size-4.5" />
            </div>
            LLD Practice
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
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
          <div className="mt-auto border-t px-3 py-3">
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-accent text-xs font-medium text-accent-foreground">
                  {initials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
