"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  BookOpen,
  Calculator,
  ListChecks,
  FileText,
  BookPlus,
  ClipboardList,
  CalendarClock,
  MessageSquareText,
  Settings,
  LogOut,
  FileUp,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Bank Connections", href: "/connections", icon: Landmark },
  { title: "Review", href: "/transactions/review", icon: ArrowLeftRight },
  { title: "Imports", href: "/imports", icon: FileUp },
  { title: "Journal", href: "/transactions/journal", icon: ClipboardList },
  { title: "New Transaction", href: "/transactions/new", icon: BookPlus },
  { title: "Accounts", href: "/accounts", icon: BookOpen },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Tax", href: "/tax", icon: Calculator },
  { title: "Quarterly Estimates", href: "/tax/quarterly", icon: CalendarClock },
  { title: "Rules", href: "/rules", icon: ListChecks },
  { title: "Narrative", href: "/reports/narrative", icon: MessageSquareText },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold">GStreet Ledger</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/help"}>
              <Link href="/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
