import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { insertTaskSchema, type InsertTask, type Artist } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

const formSchema = insertTaskSchema.extend({
  dueDate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskFormProps {
  onSuccess?: () => void;
}

export function CreateTaskForm({ onSuccess }: CreateTaskFormProps) {
  const { toast } = useToast();

  const { data: artists } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      artistId: null,
      status: "todo",
      priority: "medium",
      assignedTo: "",
      dueDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const submitData = {
        ...data,
        artistId: data.artistId || null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
      };
      return await apiRequest("POST", "/api/tasks", submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Tâche créée",
        description: "La tâche a été ajoutée avec succès.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre *</FormLabel>
              <FormControl>
                <Input placeholder="Titre de la tâche" {...field} data-testid="input-task-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description de la tâche..."
                  className="min-h-24"
                  {...field}
                  data-testid="textarea-task-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-task-priority">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Statut *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-task-status">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">À faire</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminée</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigné à</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du membre de l'équipe" {...field} data-testid="input-task-assignee" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date d'Échéance</FormLabel>
                <FormControl>
                  <Input type="date" {...field} data-testid="input-task-duedate" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="artistId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artiste Associé (optionnel)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger data-testid="select-task-artist">
                    <SelectValue placeholder="Sélectionnez un artiste (optionnel)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Aucun artiste (tâche interne)</SelectItem>
                  {artists?.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.firstName} {artist.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            data-testid="button-cancel-task"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-task">
            {createMutation.isPending ? "Création..." : "Créer la Tâche"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
