import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Mail, Send, Users, Pencil, Eye } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateCampaignForm } from "@/components/forms/create-campaign-form";
import { EditCampaignForm } from "@/components/forms/edit-campaign-form";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { EmailCampaign, Artist } from "@shared/schema";

const disciplineLabels: Record<string, string> = {
  visual_arts: "Arts visuels",
  music: "Musique",
  theater: "Théâtre",
  dance: "Danse",
  literature: "Littérature",
  cinema: "Cinéma",
  digital_arts: "Arts numériques",
  multidisciplinary: "Multidisciplinaire",
};

export default function Campaigns() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const { toast } = useToast();

  const { data: campaigns, isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: artists } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const getFilteredRecipientCount = (campaign: EmailCampaign) => {
    if (!artists || !campaign.segmentCriteria) return artists?.length || 0;
    
    const criteria = campaign.segmentCriteria as { disciplines?: string[]; hasAccompaniment?: boolean };
    
    return artists.filter(artist => {
      if (criteria.disciplines && criteria.disciplines.length > 0) {
        const artistDisciplines = (artist as any).disciplines || [artist.discipline];
        const hasMatchingDiscipline = criteria.disciplines.some((d: string) => 
          artistDisciplines.includes(d)
        );
        if (!hasMatchingDiscipline) return false;
      }
      return true;
    }).length;
  };

  const handleEditClick = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-campaigns-title">
            Campagnes Email
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez et envoyez des communications ciblées à vos artistes
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-campaign">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Campagne
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une Campagne Email</DialogTitle>
            </DialogHeader>
            <CreateCampaignForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover-elevate" data-testid={`card-campaign-${campaign.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <Mail className="h-5 w-5" />
                      <span data-testid={`text-campaign-name-${campaign.id}`}>{campaign.name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                  </div>
                  {campaign.sentAt ? (
                    <Badge variant="secondary" data-testid={`badge-campaign-sent-${campaign.id}`}>
                      <Send className="h-3 w-3 mr-1" />
                      Envoyée
                    </Badge>
                  ) : (
                    <Badge variant="outline" data-testid={`badge-campaign-draft-${campaign.id}`}>
                      Brouillon
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {campaign.sentAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date d'envoi:</span>
                      <span>{format(new Date(campaign.sentAt), "dd MMMM yyyy", { locale: fr })}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Destinataires filtrés:
                    </span>
                    <span className="font-medium" data-testid={`text-campaign-recipients-${campaign.id}`}>
                      {getFilteredRecipientCount(campaign)} / {artists?.length || 0}
                    </span>
                  </div>
                  {campaign.segmentCriteria && (campaign.segmentCriteria as any).disciplines?.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Critères de segmentation:</p>
                      <div className="flex flex-wrap gap-2">
                        {(campaign.segmentCriteria as any).disciplines?.map((d: string) => (
                          <Badge key={d} variant="outline" className="text-xs">{disciplineLabels[d] || d}</Badge>
                        ))}
                        {campaign.segmentCriteria.hasAccompaniment && (
                          <Badge variant="outline" className="text-xs">Accompagnement actif</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {!campaign.sentAt && (
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditClick(campaign)}
                        data-testid={`button-edit-campaign-${campaign.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button className="flex-1" size="sm" data-testid={`button-send-campaign-${campaign.id}`}>
                        <Send className="h-4 w-4 mr-2" />
                        Envoyer
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune campagne créée</h3>
            <p className="text-muted-foreground text-center mb-6">
              Créez votre première campagne email pour communiquer avec vos artistes
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une Campagne
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Campaign Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier la Campagne</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <EditCampaignForm 
              campaign={selectedCampaign}
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedCampaign(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
