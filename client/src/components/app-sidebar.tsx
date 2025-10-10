import { Users, Briefcase, LayoutDashboard, CheckSquare, Mail, UserPlus, BarChart3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Tableau de Bord",
    url: "/",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Artistes",
    url: "/artists",
    icon: Users,
    testId: "link-artists",
  },
  {
    title: "Opportunités",
    url: "/opportunities",
    icon: Briefcase,
    testId: "link-opportunities",
  },
  {
    title: "Tâches",
    url: "/tasks",
    icon: CheckSquare,
    testId: "link-tasks",
  },
  {
    title: "Campagnes Email",
    url: "/campaigns",
    icon: Mail,
    testId: "link-campaigns",
  },
  {
    title: "Liste d'Attente",
    url: "/waitlist",
    icon: UserPlus,
    testId: "link-waitlist",
  },
  {
    title: "Rapports",
    url: "/reports",
    icon: BarChart3,
    testId: "link-reports",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>DAM Accompagnement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
