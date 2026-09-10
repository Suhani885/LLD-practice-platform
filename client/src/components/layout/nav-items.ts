import { History, ListChecks, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/problems", label: "Problems", icon: ListChecks },
  { to: "/history", label: "History", icon: History },
];
