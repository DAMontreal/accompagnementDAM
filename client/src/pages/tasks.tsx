import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateTaskForm } from "@/components/forms/create-task-form";
import type { Task } from "@shared/schema";

const priorityColors = {
  low: "bg-muted",
  medium: "bg-primary",
  high: "bg-chart-3",
  urgent: "bg-destructive",
};

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredTasks = tasks?.filter(task => {
    const searchLower = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(searchLower) ||
      task.description?.toLowerCase().includes(searchLower)
    );
  });

  const groupedTasks = {
    todo: filteredTasks?.filter(t => t.status === 'todo') || [],
    in_progress: filteredTasks?.filter(t => t.status === 'in_progress') || [],
    completed: filteredTasks?.filter(t => t.status === 'completed') || [],
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-tasks-title">
            Tâches
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos tâches d'équipe et de suivi
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Tâche
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une Tâche</DialogTitle>
            </DialogHeader>
            <CreateTaskForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une tâche..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-tasks"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* To Do */}
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-lg">À Faire</span>
              <Badge variant="secondary">{groupedTasks.todo.length}</Badge>
            </h2>
            <div className="space-y-3">
              {groupedTasks.todo.map((task) => (
                <Card key={task.id} className="hover-elevate" data-testid={`task-card-${task.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox className="mt-1" data-testid={`checkbox-task-${task.id}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`} />
                          <h3 className="font-medium leading-none" data-testid={`text-task-title-${task.id}`}>
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.dueDate && (
                            <span>{format(new Date(task.dueDate), "dd MMM", { locale: fr })}</span>
                          )}
                          {task.assignedTo && <span>• {task.assignedTo}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {groupedTasks.todo.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  Aucune tâche à faire
                </p>
              )}
            </div>
          </div>

          {/* In Progress */}
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-lg">En Cours</span>
              <Badge variant="secondary">{groupedTasks.in_progress.length}</Badge>
            </h2>
            <div className="space-y-3">
              {groupedTasks.in_progress.map((task) => (
                <Card key={task.id} className="hover-elevate border-primary" data-testid={`task-card-${task.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox className="mt-1" data-testid={`checkbox-task-${task.id}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`h-2 w-2 rounded-full ${priorityColors[task.priority]}`} />
                          <h3 className="font-medium leading-none">{task.title}</h3>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.dueDate && (
                            <span>{format(new Date(task.dueDate), "dd MMM", { locale: fr })}</span>
                          )}
                          {task.assignedTo && <span>• {task.assignedTo}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {groupedTasks.in_progress.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  Aucune tâche en cours
                </p>
              )}
            </div>
          </div>

          {/* Completed */}
          <div>
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-lg">Terminées</span>
              <Badge variant="secondary">{groupedTasks.completed.length}</Badge>
            </h2>
            <div className="space-y-3">
              {groupedTasks.completed.map((task) => (
                <Card key={task.id} className="opacity-60 hover-elevate" data-testid={`task-card-${task.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-chart-2 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium leading-none line-through mb-2">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-through">{task.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {task.assignedTo && <span>{task.assignedTo}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {groupedTasks.completed.length === 0 && (
                <p className="text-center py-8 text-muted-foreground text-sm">
                  Aucune tâche terminée
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
