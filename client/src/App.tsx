import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import Dashboard from "@/pages/dashboard";
import Artists from "@/pages/artists";
import ArtistDetail from "@/pages/artist-detail";
import Opportunities from "@/pages/opportunities";
import Resources from "@/pages/resources";
import Tasks from "@/pages/tasks";
import Campaigns from "@/pages/campaigns";
import Waitlist from "@/pages/waitlist";
import Reports from "@/pages/reports";
import Team from "@/pages/team";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/artists" component={Artists} />
      <Route path="/artists/:id" component={ArtistDetail} />
      <Route path="/opportunities" component={Opportunities} />
      <Route path="/resources" component={Resources} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/waitlist" component={Waitlist} />
      <Route path="/reports" component={Reports} />
      <Route path="/team" component={Team} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-4 p-4 border-b">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-y-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
