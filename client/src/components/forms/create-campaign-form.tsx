import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertEmailCampaignSchema, type InsertEmailCampaign } from "@shared/schema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

const disciplineOptions = [
  { value: "visual_arts", label: "Arts visuels" },
  { value: "music", label: "Musique" },
  { value: "theater", label: "Théâtre" },
  { value: "dance", label: "Danse" },
  { value: "literature", label: "Littérature" },
  { value: "cinema", label: "Cinéma" },
  { value: "digital_arts", label: "Arts numériques" },
  { value: "multidisciplinary", label: "Multidisciplinaire" },
];

const formSchema = insertEmailCampaignSchema.extend({
  selectedDisciplines: z.array(z.string()).optional(),
  hasAccompaniment: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateCampaignFormProps {
  onSuccess?: () => void;
}

export function CreateCampaignForm({ onSuccess }: CreateCampaignFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      selectedDisciplines: [],
      hasAccompaniment: false,
      segmentCriteria: {},
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const submitData = {
        name: data.name,
        subject: data.subject,
        body: data.body,
        segmentCriteria: {
          disciplines: data.selectedDisciplines,
          hasAccompaniment: data.hasAccompaniment,
        },
      };
      return await apiRequest("POST", "/api/campaigns", submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campagne créée",
        description: "La campagne a été créée avec succès.",
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la Campagne *</FormLabel>
              <FormControl>
                <Input placeholder="ex: Infolettre Janvier 2024" {...field} data-testid="input-campaign-name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet du Courriel *</FormLabel>
              <FormControl>
                <Input placeholder="Sujet de l'email..." {...field} data-testid="input-campaign-subject" />
              </FormControl>
              <FormDescription>
                Vous pouvez utiliser des champs personnalisés: [Prénom], [Nom]
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contenu du Message *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Bonjour [Prénom],&#10;&#10;Nous avons le plaisir de vous informer..."
                  className="min-h-48"
                  {...field}
                  data-testid="textarea-campaign-body"
                />
              </FormControl>
              <FormDescription>
                Utilisez [Prénom] et [Nom] pour personnaliser le message
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Critères de Segmentation</h3>

          <FormField
            control={form.control}
            name="selectedDisciplines"
            render={() => (
              <FormItem>
                <FormLabel>Disciplines Artistiques</FormLabel>
                <div className="grid gap-3 md:grid-cols-2">
                  {disciplineOptions.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="selectedDisciplines"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option.value])
                                    : field.onChange(
                                        field.value?.filter((value) => value !== option.value)
                                      );
                                }}
                                data-testid={`checkbox-discipline-${option.value}`}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hasAccompaniment"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-has-accompaniment"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Uniquement les artistes ayant déjà eu un accompagnement
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            data-testid="button-cancel-campaign"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-campaign">
            {createMutation.isPending ? "Création..." : "Créer la Campagne"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
