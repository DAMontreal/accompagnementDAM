import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, CheckSquare, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalArtists: number;
    pendingApplications: number;
    totalFunding: number;
    activeTasks: number;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: todayTasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/today"],
  });

  const { data: upcomingDeadlines, isLoading: deadlinesLoading } = useQuery<any[]>({
    queryKey: ["/api/deadlines/upcoming"],
  });

  return (
    <div className="flex flex-col gap-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-dashboard-title">
          Tableau de Bord
        </h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de votre activité d'accompagnement
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-5 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card data-testid="card-stat-artists">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Artistes Actifs</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-stat-artists">
                  {stats?.totalArtists || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Artistes accompagnés
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-applications">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Candidatures en Cours</CardTitle>
                <CheckSquare className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-stat-applications">
                  {stats?.pendingApplications || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  En attente ou soumises
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-funding">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Financement Total</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-stat-funding">
                  {(stats?.totalFunding || 0).toLocaleString('fr-CA')} $
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Fonds obtenus cette année
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-stat-tasks">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tâches Actives</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="text-stat-tasks">
                  {stats?.activeTasks || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tâches en cours
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tâches d'Aujourd'hui</CardTitle>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            ) : todayTasks && todayTasks.length > 0 ? (
              <div className="space-y-4">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 hover-elevate rounded-lg p-3 -m-3"
                    data-testid={`task-item-${task.id}`}
                  >
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${
                      task.priority === 'urgent' ? 'bg-destructive' :
                      task.priority === 'high' ? 'bg-chart-3' :
                      'bg-primary'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.assignedTo && (
                          <span className="text-xs text-muted-foreground">{task.assignedTo}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Aucune tâche pour aujourd'hui
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Échéances Prochaines</CardTitle>
          </CardHeader>
          <CardContent>
            {deadlinesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : upcomingDeadlines && upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div
                    key={deadline.id}
                    className="flex items-center justify-between hover-elevate rounded-lg p-3 -m-3"
                    data-testid={`deadline-item-${deadline.id}`}
                  >
                    <div>
                      <p className="font-medium">{deadline.title}</p>
                      <p className="text-sm text-muted-foreground">{deadline.type}</p>
                    </div>
                    <Badge variant="outline" data-testid={`deadline-date-${deadline.id}`}>
                      {format(new Date(deadline.deadline), 'dd MMM', { locale: fr })}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                Aucune échéance prochaine
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
