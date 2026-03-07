import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { DemoBanner } from "@/components/demo-banner";
import { checkNudge } from "@/lib/services/fingerprint";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let hasUnsharedChanges = false;
  try {
    const nudge = await checkNudge();
    hasUnsharedChanges = nudge.shouldNudge;
  } catch {
    // Nudge check may fail before setup — ignore
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar hasUnsharedChanges={hasUnsharedChanges} />
        <CommandPalette />
        <main className="flex-1 overflow-auto">
          <DemoBanner />
          <div className="flex items-center gap-2 border-b px-4 py-2">
            <SidebarTrigger />
          </div>
          <div className="p-6">{children}</div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}
