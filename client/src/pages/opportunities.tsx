import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Calendar, Briefcase } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { CreateOpportunityForm } from "@/components/forms/create-opportunity-form";
import type { Opportunity } from "@shared/schema";

export default function Opportunities() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: opportunities, isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
  });

  const filteredOpportunities = opportunities?.filter(opp => {
    const searchLower = searchQuery.toLowerCase();
    return (
      opp.title.toLowerCase().includes(searchLower) ||
      opp.type.toLowerCase().includes(searchLower)
    );
  });

  const getDeadlineColor = (deadline: Date) => {
    const daysUntil = differenceInDays(new Date(deadline), new Date());
    if (daysUntil < 0) return "bg-destructive";
    if (daysUntil <= 7) return "bg-chart-3";
    if (daysUntil <= 30) return "bg-chart-2";
    return "bg-primary";
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-opportunities-title">
            Opportunités & Subventions
          </h1>
          <p className="text-muted-foreground mt-1">
            Base de données des opportunités de financement
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-opportunity">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Opportunité
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter une Opportunité</DialogTitle>
            </DialogHeader>
            <CreateOpportunityForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher une opportunité..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-opportunities"
        />
      </div>

      {/* Opportunities List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOpportunities && filteredOpportunities.length > 0 ? (
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => (
            <Card key={opp.id} className="hover-elevate" data-testid={`card-opportunity-${opp.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2" data-testid={`text-opportunity-title-${opp.id}`}>
                      {opp.title}
                    </CardTitle>
                    {opp.description && (
                      <p className="text-muted-foreground text-sm">{opp.description}</p>
                    )}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getDeadlineColor(opp.deadline)}`}>
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {format(new Date(opp.deadline), "dd MMM yyyy", { locale: fr })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="secondary">{opp.type}</Badge>
                  {opp.amount && (
                    <span className="text-sm text-muted-foreground">Montant: {opp.amount}</span>
                  )}
                  {opp.url && (
                    <a
                      href={opp.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Voir l'appel
                    </a>
                  )}
                </div>
                {opp.eligibilityCriteria && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-1">Critères d'éligibilité:</p>
                    <p className="text-sm text-muted-foreground">{opp.eligibilityCriteria}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune opportunité trouvée</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchQuery
                ? "Aucune opportunité ne correspond à votre recherche."
                : "Commencez par ajouter une opportunité."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une Opportunité
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
