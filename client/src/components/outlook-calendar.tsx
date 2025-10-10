import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, Link as LinkIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface OutlookCalendarProps {
  artistId: string;
  artistEmail: string | null;
  artistName: string;
}

export function OutlookCalendar({ artistId, artistEmail, artistName }: OutlookCalendarProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    subject: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    notes: "",
  });

  const { data: events, isLoading } = useQuery<any[]>({
    queryKey: [`/api/outlook/calendar/events/search?email=${artistEmail}`],
    enabled: !!artistEmail,
  });

  const syncMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/outlook/calendar/events/${eventId}/sync`, {
        method: "POST",
        body: JSON.stringify({ artistId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to sync event");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists", artistId, "interactions"] });
      toast({
        title: "Rendez-vous synchronisé",
        description: "Le rendez-vous a été ajouté à l'historique d'interactions",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de synchroniser le rendez-vous",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const startDateTime = `${newEvent.startDate}T${newEvent.startTime}:00`;
      const endDateTime = `${newEvent.endDate}T${newEvent.endTime}:00`;

      const eventData = {
        subject: newEvent.subject,
        start: {
          dateTime: startDateTime,
          timeZone: "Europe/Paris",
        },
        end: {
          dateTime: endDateTime,
          timeZone: "Europe/Paris",
        },
        location: newEvent.location ? { displayName: newEvent.location } : undefined,
        attendees: artistEmail ? [{
          emailAddress: {
            address: artistEmail,
            name: artistName,
          },
          type: "required",
        }] : [],
        body: newEvent.notes ? {
          contentType: "text",
          content: newEvent.notes,
        } : undefined,
      };

      const response = await fetch("/api/outlook/calendar/events", {
        method: "POST",
        body: JSON.stringify(eventData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Failed to create event");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/outlook/calendar/events/search?email=${artistEmail}`] });
      setIsCreateDialogOpen(false);
      setNewEvent({
        subject: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        notes: "",
      });
      toast({
        title: "Rendez-vous créé",
        description: "Le rendez-vous a été ajouté au calendrier Outlook",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous",
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = () => {
    if (!newEvent.subject || !newEvent.startDate || !newEvent.startTime || !newEvent.endDate || !newEvent.endTime) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate();
  };

  if (!artistEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendrier Outlook</CardTitle>
          <CardDescription>Aucune adresse email pour cet artiste</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendrier Outlook</CardTitle>
            <CardDescription>
              Rendez-vous avec {artistEmail}
            </CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-create-event">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau rendez-vous
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un rendez-vous</DialogTitle>
                <DialogDescription>
                  Ajouter un nouveau rendez-vous au calendrier Outlook
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Objet *</Label>
                  <Input
                    id="subject"
                    data-testid="input-event-subject"
                    value={newEvent.subject}
                    onChange={(e) => setNewEvent({ ...newEvent, subject: e.target.value })}
                    placeholder="Réunion avec l'artiste"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      data-testid="input-event-start-date"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({ ...newEvent, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Heure de début *</Label>
                    <Input
                      id="startTime"
                      type="time"
                      data-testid="input-event-start-time"
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      data-testid="input-event-end-date"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Heure de fin *</Label>
                    <Input
                      id="endTime"
                      type="time"
                      data-testid="input-event-end-time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Lieu</Label>
                  <Input
                    id="location"
                    data-testid="input-event-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Adresse ou lieu de rencontre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    data-testid="input-event-notes"
                    value={newEvent.notes}
                    onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                    placeholder="Ordre du jour ou notes supplémentaires"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-event"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  disabled={createMutation.isPending}
                  data-testid="button-save-event"
                >
                  {createMutation.isPending ? "Création..." : "Créer le rendez-vous"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="p-4 rounded-lg border hover-elevate"
                data-testid={`event-${event.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold">{event.subject}</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(event.start.dateTime), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                        </span>
                      </div>
                      {event.location?.displayName && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location.displayName}</span>
                        </div>
                      )}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{event.attendees.length} participant(s)</span>
                        </div>
                      )}
                    </div>
                    {event.webLink && (
                      <a
                        href={event.webLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        data-testid={`link-event-${event.id}`}
                      >
                        <LinkIcon className="h-3 w-3" />
                        Voir dans Outlook
                      </a>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => syncMutation.mutate(event.id)}
                    disabled={syncMutation.isPending}
                    data-testid={`button-sync-event-${event.id}`}
                  >
                    {syncMutation.isPending ? "Synchronisation..." : "Synchroniser"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">
            Aucun rendez-vous trouvé pour {artistEmail}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
