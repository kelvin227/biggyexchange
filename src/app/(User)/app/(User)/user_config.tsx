import {
  MessageCircleQuestion,
  CoinsIcon,
  Home,
  Share,
  User
} from "lucide-react";
import { NavItem } from "../../../(admin)/admin/(admin)/config";

export const NavItems: NavItem[] = [
  {
    name: "Home",
    href: "/user_dashboard",
    icon: Home,
    position: "top",
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
    position: "top",
  },
  {
    name: "OTC",
    href: "/otc",
    icon: CoinsIcon,
    position: "top",
  },
  {
    name: "About us",
    href: "/About",
    icon: User,
    position: "top",
  },
  {
    name: "Referrals",
    href: "/profile/referrals",
    icon: Share,
    position: "top",
  },
  {
    name: "FAQs",
    href: "/faq",
    icon: MessageCircleQuestion,
    position: "top",
  }
];

export const NavItemsChi: NavItem[] = [
  {
    name: "家",
    href: "/user_dashboard",
    icon: Home,
    position: "top",
  },
  {
    name: "輪廓",
    href: "/profile",
    icon: User,
    position: "top",
  },
  {
    name: "場外交易",
    href: "/otc",
    icon: CoinsIcon,
    position: "top",
  },
  {
    name: "關於我們",
    href: "/About",
    icon: User,
    position: "top",
  },
  {
    name: "推薦",
    href: "/profile/referrals",
    icon: Share,
    position: "top",
  },
  {
    name: "常見問題解答",
    href: "/faq",
    icon: MessageCircleQuestion,
    position: "top",
  }
];
