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
  Rocket,
  ArrowLeft,
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

type AppSidebarProps = {
  hasUnsharedChanges?: boolean;
  isDemo?: boolean;
};

const DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https://github.com/gstreet-ops/ledger-starter&project-name=my-ledger&integration-ids=oac_jUduyjQgOyzev1fjrW83NYOv&env=PLAID_CLIENT_ID,PLAID_SECRET,PLAID_ENV,PLAID_TOKEN_ENCRYPTION_KEY,ANTHROPIC_API_KEY&envDescription=Plaid%20and%20Anthropic%20are%20optional.%20Supabase%20env%20vars%20are%20set%20automatically%20by%20the%20integration.&envLink=https://github.com/gstreet-ops/ledger-starter/blob/main/SETUP.md";

export function AppSidebar({ hasUnsharedChanges, isDemo: isDemoUser = false }: AppSidebarProps = {}) {
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
        {isDemoUser && (
          <Link href="/" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-1">
            <ArrowLeft className="h-3 w-3" />
            Ledger Starter Home
          </Link>
        )}
        <h1 className="text-lg font-semibold">Ledger Starter</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(item.href + "/")}>
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                  {item.href === "/settings" && hasUnsharedChanges && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                  )}
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
        {isDemoUser && (
          <div className="mx-2 mt-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 p-3">
            <p className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
              Like what you see?
            </p>
            <a
              href={DEPLOY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
            >
              <Rocket className="h-3 w-3" />
              Deploy Your Own
            </a>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
