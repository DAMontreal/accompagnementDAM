import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserPlus, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { WaitlistEntry } from "@shared/schema";

const statusLabels = {
  waiting: "En attente",
  contacted: "Contacté",
  booked: "Réservé",
  expired: "Expiré",
};

const statusColors = {
  waiting: "bg-muted",
  contacted: "bg-chart-3",
  booked: "bg-chart-2",
  expired: "bg-destructive",
};

export default function Waitlist() {
  const { data: waitlistEntries, isLoading } = useQuery<WaitlistEntry[]>({
    queryKey: ["/api/waitlist"],
  });

  const sortedEntries = waitlistEntries?.sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-waitlist-title">
            Liste d'Attente
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez la liste d'attente et contactez les personnes prioritaires
          </p>
        </div>
        <Button data-testid="button-notify-next">
          <Mail className="h-4 w-4 mr-2" />
          Notifier les 5 Prochains
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedEntries && sortedEntries.length > 0 ? (
        <div className="space-y-3">
          {sortedEntries.map((entry, index) => (
            <Card
              key={entry.id}
              className={`hover-elevate ${entry.status === 'waiting' && index < 5 ? 'border-primary' : ''}`}
              data-testid={`card-waitlist-${entry.id}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-full ${statusColors[entry.status]} text-white font-bold`}>
                    {entry.position}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1" data-testid={`text-waitlist-name-${entry.id}`}>
                      {entry.firstName} {entry.lastName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span data-testid={`text-waitlist-email-${entry.id}`}>{entry.email}</span>
                      </div>
                      {entry.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{entry.phone}</span>
                        </div>
                      )}
                    </div>
                    {entry.contactedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Contacté le {format(new Date(entry.contactedAt), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" data-testid={`badge-waitlist-status-${entry.id}`}>
                      {statusLabels[entry.status]}
                    </Badge>
                    {entry.status === 'waiting' && (
                      <Button size="sm" variant="outline" data-testid={`button-contact-${entry.id}`}>
                        Contacter
                      </Button>
                    )}
                    {entry.status === 'contacted' && entry.exclusiveLink && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={entry.exclusiveLink} target="_blank" rel="noopener noreferrer">
                          Voir le lien
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Liste d'attente vide</h3>
            <p className="text-muted-foreground text-center">
              Aucune personne en attente pour le moment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
