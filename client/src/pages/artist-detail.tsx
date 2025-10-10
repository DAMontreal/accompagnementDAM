import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Mail, Phone, FileText, History, Target, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artist, Interaction, Application, Document } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

export default function ArtistDetail() {
  const params = useParams();
  const artistId = params.id;

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
              <h2 className="text-2xl font-bold mb-2" data-testid="text-artist-name">
                {artist.firstName} {artist.lastName}
              </h2>
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
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" data-testid="badge-artist-discipline">
                  {disciplineLabels[artist.discipline] || artist.discipline}
                </Badge>
                {artist.diversityType && (
                  <Badge variant="outline">{artist.diversityType}</Badge>
                )}
              </div>
            </div>
            <Button data-testid="button-edit-artist">Modifier</Button>
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
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="interactions" data-testid="tab-interactions">
            <History className="h-4 w-4 mr-2" />
            Historique
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

        <TabsContent value="plan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan d'Accompagnement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Fonctionnalité en développement
              </p>
            </CardContent>
          </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover-elevate"
                      data-testid={`document-${doc.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">{doc.type}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Télécharger</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Aucun document
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
