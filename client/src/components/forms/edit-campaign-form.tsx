import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertEmailCampaignSchema, type EmailCampaign } from "@shared/schema";
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

interface EditCampaignFormProps {
  campaign: EmailCampaign;
  onSuccess?: () => void;
}

export function EditCampaignForm({ campaign, onSuccess }: EditCampaignFormProps) {
  const { toast } = useToast();

  const existingCriteria = campaign.segmentCriteria as { disciplines?: string[]; hasAccompaniment?: boolean } | null;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campaign.name,
      subject: campaign.subject,
      body: campaign.body || "",
      selectedDisciplines: existingCriteria?.disciplines || [],
      hasAccompaniment: existingCriteria?.hasAccompaniment || false,
      segmentCriteria: campaign.segmentCriteria || {},
    },
  });

  const updateMutation = useMutation({
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
      return await apiRequest("PATCH", `/api/campaigns/${campaign.id}`, submitData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campagne mise à jour",
        description: "Les modifications ont été enregistrées.",
      });
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

  const handleDisciplineChange = (value: string, checked: boolean) => {
    const current = form.getValues("selectedDisciplines") || [];
    if (checked) {
      form.setValue("selectedDisciplines", [...current, value]);
    } else {
      form.setValue("selectedDisciplines", current.filter((d) => d !== value));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la Campagne *</FormLabel>
              <FormControl>
                <Input placeholder="ex: Infolettre Janvier 2024" {...field} data-testid="input-edit-campaign-name" />
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
              <FormLabel>Objet de l'Email *</FormLabel>
              <FormControl>
                <Input placeholder="ex: Nouvelles opportunités pour artistes" {...field} data-testid="input-edit-campaign-subject" />
              </FormControl>
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
                  placeholder="Rédigez votre message ici..."
                  className="min-h-48"
                  {...field}
                  data-testid="textarea-edit-campaign-body"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Critères de Segmentation</h3>
          <FormDescription className="mb-4">
            Sélectionnez les critères pour filtrer les destinataires de cette campagne.
          </FormDescription>

          <div className="space-y-4">
            <div>
              <FormLabel className="mb-3 block">Disciplines artistiques</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {disciplineOptions.map((option) => {
                  const isChecked = form.watch("selectedDisciplines")?.includes(option.value) || false;
                  return (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-discipline-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => handleDisciplineChange(option.value, !!checked)}
                        data-testid={`checkbox-edit-discipline-${option.value}`}
                      />
                      <label
                        htmlFor={`edit-discipline-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            <FormField
              control={form.control}
              name="hasAccompaniment"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-edit-has-accompaniment"
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Uniquement les artistes avec un plan d'accompagnement actif
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={updateMutation.isPending} data-testid="button-update-campaign">
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
