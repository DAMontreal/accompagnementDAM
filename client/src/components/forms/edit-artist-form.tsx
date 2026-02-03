import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertArtistSchema, type Artist } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { z } from "zod";

const disciplineOptions = [
  { value: "visual_arts", label: "Arts visuels" },
  { value: "music", label: "Musique" },
  { value: "theater", label: "Théâtre" },
  { value: "dance", label: "Danse" },
  { value: "literature", label: "Littérature" },
  { value: "cinema", label: "Cinéma" },
  { value: "digital_arts", label: "Arts numériques" },
  { value: "multidisciplinary", label: "Multidisciplinaire" },
  { value: "other", label: "Autre" },
];

const socialPlatformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "soundcloud", label: "SoundCloud" },
  { value: "bandcamp", label: "Bandcamp" },
  { value: "spotify", label: "Spotify" },
  { value: "other", label: "Autre" },
];

const formSchema = insertArtistSchema.extend({
  disciplines: z.array(z.string()).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
  })).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditArtistFormProps {
  artist: Artist;
  onSuccess?: () => void;
}

export function EditArtistForm({ artist, onSuccess }: EditArtistFormProps) {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: artist.firstName || "",
      lastName: artist.lastName || "",
      stageName: artist.stageName || "",
      email: artist.email || "",
      phone: artist.phone || "",
      disciplines: artist.disciplines || [],
      portfolio: artist.portfolio || "",
      socialLinks: (artist.socialLinks as Array<{ platform: string; url: string }>) || [],
      artisticStatement: artist.artisticStatement || "",
      diversityType: artist.diversityType || "",
      internalNotes: artist.internalNotes || "",
      avatarUrl: artist.avatarUrl || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("PATCH", `/api/artists/${artist.id}`, data);
    },
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/artists", artist.id] });
      toast({
        title: "Artiste modifié",
        description: "Les informations ont été mises à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  const handleDisciplineChange = (value: string, checked: boolean) => {
    const current = form.getValues("disciplines") || [];
    if (checked) {
      form.setValue("disciplines", [...current, value]);
    } else {
      form.setValue("disciplines", current.filter((d) => d !== value));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom *</FormLabel>
                <FormControl>
                  <Input placeholder="Jean" {...field} data-testid="input-edit-artist-firstname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom *</FormLabel>
                <FormControl>
                  <Input placeholder="Dupont" {...field} data-testid="input-edit-artist-lastname" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stageName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom d'artiste / Surnom</FormLabel>
                <FormControl>
                  <Input placeholder="ex: DJ Nova" {...field} value={field.value || ""} data-testid="input-edit-artist-stagename" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jean.dupont@example.com" {...field} data-testid="input-edit-artist-email" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (514) 555-0123" {...field} value={field.value || ""} data-testid="input-edit-artist-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diversityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de Diversité</FormLabel>
                <FormControl>
                  <Input placeholder="ex: Autochtone, Immigrant..." {...field} value={field.value || ""} data-testid="input-edit-artist-diversity" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-3">
          <Label>Disciplines *</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {disciplineOptions.map((option) => {
              const isChecked = form.watch("disciplines")?.includes(option.value) || false;
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-discipline-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleDisciplineChange(option.value, !!checked)}
                    data-testid={`checkbox-edit-discipline-${option.value}`}
                  />
                  <Label htmlFor={`edit-discipline-${option.value}`} className="text-sm font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        </div>

        <FormField
          control={form.control}
          name="portfolio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio (URL principale)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} value={field.value || ""} data-testid="input-edit-artist-portfolio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Réseaux Sociaux</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ platform: "instagram", url: "" })}
              data-testid="button-edit-add-social-link"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={form.watch(`socialLinks.${index}.platform`)}
                onChange={(e) => form.setValue(`socialLinks.${index}.platform`, e.target.value)}
                data-testid={`select-edit-social-platform-${index}`}
              >
                {socialPlatformOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <Input
                placeholder="https://..."
                {...form.register(`socialLinks.${index}.url`)}
                className="flex-1"
                data-testid={`input-edit-social-url-${index}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                data-testid={`button-edit-remove-social-${index}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="artisticStatement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Démarche Artistique</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez la démarche artistique..."
                  className="min-h-24"
                  {...field}
                  value={field.value || ""}
                  data-testid="textarea-edit-artist-statement"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes Internes (Confidentielles)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notes pour l'équipe interne uniquement..."
                  className="min-h-24"
                  {...field}
                  value={field.value || ""}
                  data-testid="textarea-edit-artist-notes"
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
            data-testid="button-cancel-edit-artist"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit-artist">
            {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
