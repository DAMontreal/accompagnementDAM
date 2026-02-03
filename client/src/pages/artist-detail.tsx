import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Mail, Phone, FileText, History, Target, Briefcase, Calendar as CalendarIcon, StickyNote, ExternalLink, Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Artist, Interaction, Application, Document, ArtistNote } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { SiInstagram, SiFacebook, SiLinkedin, SiTiktok, SiYoutube, SiSoundcloud, SiBandcamp, SiSpotify } from "react-icons/si";
import { FaXTwitter } from "react-icons/fa6";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AccompanimentPlanTab } from "@/components/accompaniment-plan-tab";
import { DocumentsTab } from "@/components/documents-tab";
import { OutlookEmailArchive } from "@/components/outlook-email-archive";
import { OutlookCalendar } from "@/components/outlook-calendar";
import { EditArtistForm } from "@/components/forms/edit-artist-form";

const disciplineLabels: Record<string, string> = {
  visual_arts: "Arts visuels",
  music: "Musique",
  theater: "Théâtre",
  dance: "Danse",
  literature: "Littérature",
  cinema: "Cinéma",
  digital_arts: "Arts numériques",
  multidisciplinary: "Multidisciplinaire",
  other: "Autre",
};

const interactionTypeLabels: Record<string, string> = {
  meeting: "Rencontre",
  call: "Appel",
  email: "Courriel",
  calendly_appointment: "Rendez-vous Calendly",
  other: "Autre",
};

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  twitter: FaXTwitter,
  linkedin: SiLinkedin,
  tiktok: SiTiktok,
  youtube: SiYoutube,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  spotify: SiSpotify,
};

export default function ArtistDetail() {
  const params = useParams();
  const artistId = params.id;
  const { toast } = useToast();
  const [noteContent, setNoteContent] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ["/api/artists", artistId],
  });

  const { data: interactions, isLoading: interactionsLoading } = useQuery<Interaction[]>({
    queryKey: ["/api/artists", artistId, "interactions"],
  });

  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/artists", artistId, "applications"],
  });

  const { data: documents, isLoading: documentsLoading } = useQuery<Document[]>({
    queryKey: ["/api/artists", artistId, "documents"],
  });

  const { data: notes, isLoading: notesLoading } = useQuery<ArtistNote[]>({
    queryKey: ["/api/artists", artistId, "notes"],
  });

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/artists/${artistId}/notes`, {
        content,
        sessionDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artists", artistId, "notes"] });
      setNoteContent("");
      toast({
        title: "Note ajoutée",
        description: "La note de session a été enregistrée.",
      });
    },
  });

  if (artistLoading) {
    return (
      <div className="flex flex-col gap-6 p-8">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <h2 className="text-2xl font-bold mb-2">Artiste non trouvé</h2>
        <p className="text-muted-foreground mb-6">Cet artiste n'existe pas ou a été supprimé.</p>
        <Link href="/artists">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux artistes
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/artists">
          <Button variant="ghost" size="icon" data-testid="button-back-to-artists">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-artist-detail-title">
          Fiche Artiste
        </h1>
      </div>

      {/* Artist Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={artist.avatarUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {artist.firstName[0]}{artist.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1" data-testid="text-artist-name">
                {artist.firstName} {artist.lastName}
              </h2>
              {artist.stageName && (
                <p className="text-lg text-muted-foreground mb-2" data-testid="text-artist-stagename">
                  « {artist.stageName} »
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                {artist.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span data-testid="text-artist-email">{artist.email}</span>
                  </div>
                )}
                {artist.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{artist.phone}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(artist.disciplines && artist.disciplines.length > 0) ? (
                  artist.disciplines.map((d) => (
                    <Badge key={d} variant="secondary" data-testid={`badge-discipline-${d}`}>
                      {disciplineLabels[d] || d}
                    </Badge>
                  ))
                ) : null}
                {artist.diversityType && (
                  <Badge variant="outline">{artist.diversityType}</Badge>
                )}
              </div>
              {/* Social Links */}
              {artist.socialLinks && artist.socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {artist.socialLinks.map((link, idx) => {
                    const Icon = socialIcons[link.platform] || ExternalLink;
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        data-testid={`link-social-${link.platform}-${idx}`}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
            <Button onClick={() => setIsEditDialogOpen(true)} data-testid="button-edit-artist">
              <Pencil className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>

          {artist.artisticStatement && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Démarche Artistique</h3>
              <p className="text-muted-foreground">{artist.artisticStatement}</p>
            </div>
          )}

          {artist.internalNotes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Notes Internes (Confidentielles)</h3>
              <p className="text-muted-foreground">{artist.internalNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="interactions" className="w-full">
        <TabsList className="grid w-full grid-cols-7 max-w-5xl">
          <TabsTrigger value="interactions" data-testid="tab-interactions">
            <History className="h-4 w-4 mr-2" />
            Historique
          </TabsTrigger>
          <TabsTrigger value="notes" data-testid="tab-notes">
            <StickyNote className="h-4 w-4 mr-2" />
            Notes
          </TabsTrigger>
          <TabsTrigger value="outlook" data-testid="tab-outlook">
            <Mail className="h-4 w-4 mr-2" />
            Emails
          </TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendrier
          </TabsTrigger>
          <TabsTrigger value="plan" data-testid="tab-plan">
            <Target className="h-4 w-4 mr-2" />
            Plan
          </TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications">
            <Briefcase className="h-4 w-4 mr-2" />
            Candidatures
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="interactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              {interactionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : interactions && interactions.length > 0 ? (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex gap-4 p-4 rounded-lg border hover-elevate"
                      data-testid={`interaction-${interaction.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{interaction.title}</h4>
                          <Badge variant="outline">
                            {interactionTypeLabels[interaction.type] || interaction.type}
                          </Badge>
                        </div>
                        {interaction.notes && (
                          <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(interaction.date), "dd MMMM yyyy à HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Aucune interaction enregistrée
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notes de Session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new note */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
                <Textarea
                  placeholder="Ajouter une note de session..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-24"
                  data-testid="textarea-new-note"
                />
                <Button
                  onClick={() => noteContent.trim() && createNoteMutation.mutate(noteContent)}
                  disabled={!noteContent.trim() || createNoteMutation.isPending}
                  data-testid="button-add-note"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la note
                </Button>
              </div>

              {/* Notes history */}
              {notesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-lg border"
                      data-testid={`note-${note.id}`}
                    >
                      <p className="whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(note.sessionDate), "dd MMMM yyyy", { locale: fr })}
                        </span>
                        {note.createdBy && (
                          <>
                            <span>-</span>
                            <span>{note.createdBy}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Aucune note de session enregistrée
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outlook" className="mt-6">
          <OutlookEmailArchive artistId={artistId!} artistEmail={artist.email} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <OutlookCalendar
            artistId={artistId!}
            artistEmail={artist.email}
            artistName={`${artist.firstName} ${artist.lastName}`}
          />
        </TabsContent>

        <TabsContent value="plan" className="mt-6">
          <AccompanimentPlanTab artistId={artistId!} />
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Candidatures</CardTitle>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      data-testid={`application-${app.id}`}
                    >
                      <div>
                        <p className="font-medium">Opportunité #{app.opportunityId}</p>
                        <p className="text-sm text-muted-foreground">
                          {app.submittedDate
                            ? format(new Date(app.submittedDate), "dd MMM yyyy", { locale: fr })
                            : "Non soumise"}
                        </p>
                      </div>
                      <Badge>{app.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Aucune candidature
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <DocumentsTab artistId={artistId!} documents={documents} isLoading={documentsLoading} />
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'artiste</DialogTitle>
          </DialogHeader>
          {artist && (
            <EditArtistForm 
              artist={artist} 
              onSuccess={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
