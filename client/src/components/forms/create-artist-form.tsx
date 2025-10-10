import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertArtistSchema, type InsertArtist } from "@shared/schema";
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

interface CreateArtistFormProps {
  onSuccess?: () => void;
}

export function CreateArtistForm({ onSuccess }: CreateArtistFormProps) {
  const { toast } = useToast();

  const form = useForm<InsertArtist>({
    resolver: zodResolver(insertArtistSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      discipline: "visual_arts",
      portfolio: "",
      artisticStatement: "",
      diversityType: "",
      internalNotes: "",
      avatarUrl: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertArtist) => {
      return await apiRequest("POST", "/api/artists", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      toast({
        title: "Artiste créé",
        description: "L'artiste a été ajouté avec succès.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertArtist) => {
    createMutation.mutate(data);
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
                  <Input placeholder="Jean" {...field} data-testid="input-artist-firstname" />
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
                  <Input placeholder="Dupont" {...field} data-testid="input-artist-lastname" />
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
                  <Input type="email" placeholder="jean.dupont@example.com" {...field} data-testid="input-artist-email" />
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
                  <Input placeholder="+1 (514) 555-0123" {...field} data-testid="input-artist-phone" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discipline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discipline *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-artist-discipline">
                      <SelectValue placeholder="Sélectionnez une discipline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {disciplineOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input placeholder="ex: Autochtone, Immigrant..." {...field} data-testid="input-artist-diversity" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="portfolio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio (URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} data-testid="input-artist-portfolio" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  data-testid="textarea-artist-statement"
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
                  data-testid="textarea-artist-notes"
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
            data-testid="button-cancel-artist"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-artist">
            {createMutation.isPending ? "Création..." : "Créer l'Artiste"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
