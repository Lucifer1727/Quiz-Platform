"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, History, LayoutDashboard, Play, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/", icon: Play, label: "Attempt" },
  { href: "/manage", icon: LayoutDashboard, label: "Manage" },
  { href: "/history", icon: History, label: "History" },
  { href: "/resume", icon: FileText, label: "Resume" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function FloatingNavbar() {
  const pathname = usePathname();

  return (
    <TooltipProvider>
      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg text-white p-4 shadow-lg rounded-full flex space-x-4">
        {navItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  pathname === item.href
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="sr-only">{item.label}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent className="p-2 bg-white text-black shadow-lg rounded-lg">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
}