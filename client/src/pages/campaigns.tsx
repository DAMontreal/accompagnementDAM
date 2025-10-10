import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Mail, Send, Users } from "lucide-react";
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
import type { EmailCampaign } from "@shared/schema";

export default function Campaigns() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: campaigns, isLoading } = useQuery<EmailCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

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
                      Destinataires:
                    </span>
                    <span className="font-medium" data-testid={`text-campaign-recipients-${campaign.id}`}>
                      {campaign.recipientCount || 0}
                    </span>
                  </div>
                  {campaign.segmentCriteria && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Critères de segmentation:</p>
                      <div className="flex flex-wrap gap-2">
                        {campaign.segmentCriteria.disciplines?.map((d: string) => (
                          <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                        ))}
                        {campaign.segmentCriteria.hasAccompaniment && (
                          <Badge variant="outline" className="text-xs">Accompagnement actif</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {!campaign.sentAt && (
                    <Button className="w-full mt-2" size="sm" data-testid={`button-send-campaign-${campaign.id}`}>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </Button>
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
    </div>
  );
}
