import {
  Bell,
  Home,
  Settings,
  Share,
  User,
  TrendingUp,
  ShieldCheck,
  User2,
  Wallet,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  position: string;
}

export const NavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    position: "top",
  },
    {
    name: "Wallet and Gas tank",
    href: "/admin_wallet",
    icon: Wallet,
    position: "top",
  },
  {
    name: "User Management",
    href: "/user_management",
    icon: User,
    position: "top",
  },
  {
    name: "KYC Requests",
    href: "/kyc",
    icon: ShieldCheck,
    position: "top",
  },
  {
    name: "Transactions",
    href: "/transactions",
    icon: TrendingUp,
    position: "top",
  },
  {
    name: "Add moderator",
    href: "/Moderator",
    icon: User2,
    position: "top",
  },
  {
    name: "Referrals stats",
    href: "/referral_system",
    icon: Share,
    position: "top",
  },
  {
    name: "Notifications",
    href: "/notifications",
    icon: Bell,
    position: "top",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    position: "bottom",
  },
];
