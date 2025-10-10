import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Artist } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreateArtistForm } from "@/components/forms/create-artist-form";

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

export default function Artists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: artists, isLoading } = useQuery<Artist[]>({
    queryKey: ["/api/artists"],
  });

  const filteredArtists = artists?.filter(artist => {
    const searchLower = searchQuery.toLowerCase();
    return (
      artist.firstName.toLowerCase().includes(searchLower) ||
      artist.lastName.toLowerCase().includes(searchLower) ||
      artist.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-artists-title">
            Artistes
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez les profils et l'accompagnement de vos artistes
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-artist">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Artiste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ajouter un Artiste</DialogTitle>
            </DialogHeader>
            <CreateArtistForm onSuccess={() => setCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-artists"
          />
        </div>
        <Button variant="outline" data-testid="button-filter-artists">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Artists Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="gap-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredArtists && filteredArtists.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredArtists.map((artist) => (
            <Link key={artist.id} href={`/artists/${artist.id}`}>
              <Card className="hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-artist-${artist.id}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={artist.avatarUrl || undefined} />
                      <AvatarFallback>
                        {artist.firstName[0]}{artist.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg leading-none mb-2" data-testid={`text-artist-name-${artist.id}`}>
                        {artist.firstName} {artist.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate" data-testid={`text-artist-email-${artist.id}`}>
                        {artist.email}
                      </p>
                      {artist.phone && (
                        <p className="text-sm text-muted-foreground mt-1">{artist.phone}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="secondary" data-testid={`badge-artist-discipline-${artist.id}`}>
                    {disciplineLabels[artist.discipline] || artist.discipline}
                  </Badge>
                  {artist.diversityType && (
                    <p className="text-sm text-muted-foreground">
                      Diversité: {artist.diversityType}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun artiste trouvé</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchQuery
                ? "Aucun artiste ne correspond à votre recherche."
                : "Commencez par ajouter votre premier artiste."}
            </p>
            {!searchQuery && (
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un Artiste
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
