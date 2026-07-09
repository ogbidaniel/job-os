import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "./AppHeader";
import { SidebarNav } from "./SidebarNav";

export function AppShell() {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground md:block">
        <SidebarNav />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-6">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
