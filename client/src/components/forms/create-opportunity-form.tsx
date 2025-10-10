import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertOpportunitySchema, type InsertOpportunity } from "@shared/schema";
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
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

const formSchema = insertOpportunitySchema.extend({
  deadline: z.string().min(1, "La date limite est requise"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateOpportunityFormProps {
  onSuccess?: () => void;
}

export function CreateOpportunityForm({ onSuccess }: CreateOpportunityFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      eligibilityCriteria: "",
      amount: "",
      deadline: "",
      url: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const submitData = {
        ...data,
        deadline: new Date(data.deadline).toISOString(),
      };
      return await apiRequest("POST", "/api/opportunities", submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Opportunité créée",
        description: "L'opportunité a été ajoutée avec succès.",
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
                <Input placeholder="Nom de l'opportunité" {...field} data-testid="input-opportunity-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <FormControl>
                  <Input placeholder="Subvention, Résidence, Appel à projets..." {...field} data-testid="input-opportunity-type" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant</FormLabel>
                <FormControl>
                  <Input placeholder="ex: 5000 $ - 50000 $" {...field} data-testid="input-opportunity-amount" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Limite *</FormLabel>
              <FormControl>
                <Input type="date" {...field} data-testid="input-opportunity-deadline" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lien URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} data-testid="input-opportunity-url" />
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
                  placeholder="Description de l'opportunité..."
                  className="min-h-24"
                  {...field}
                  data-testid="textarea-opportunity-description"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eligibilityCriteria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Critères d'Éligibilité</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Qui peut postuler..."
                  className="min-h-24"
                  {...field}
                  data-testid="textarea-opportunity-criteria"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            data-testid="button-cancel-opportunity"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-opportunity">
            {createMutation.isPending ? "Création..." : "Créer l'Opportunité"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
