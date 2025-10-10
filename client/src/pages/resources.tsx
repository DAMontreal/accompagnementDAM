import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, Wrench, Briefcase, Plus, Mail, Phone, MapPin, Globe, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Resource, InsertResource } from "@shared/schema";

const resourceTypeLabels: Record<string, string> = {
  venue: "Salle de spectacle",
  equipment: "Équipement",
  service: "Service",
  other: "Autre",
};

const resourceTypeIcons: Record<string, any> = {
  venue: Building2,
  equipment: Wrench,
  service: Briefcase,
  other: Briefcase,
};

export default function Resources() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<Partial<InsertResource>>({
    name: "",
    type: "venue",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    website: "",
    pricing: "",
    capacity: undefined,
    availability: "",
    internalNotes: "",
  });

  const queryKey = selectedType === "all"
    ? ["/api/resources"]
    : ["/api/resources", { type: selectedType }];

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey,
    queryFn: async () => {
      const url = selectedType === "all"
        ? "/api/resources"
        : `/api/resources?type=${selectedType}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch resources");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertResource) => {
      const response = await fetch("/api/resources", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to create resource");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Ressource créée",
        description: "La ressource a été ajoutée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la ressource",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertResource> }) => {
      const response = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to update resource");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setIsCreateDialogOpen(false);
      setEditingResource(null);
      resetForm();
      toast({
        title: "Ressource modifiée",
        description: "Les modifications ont été enregistrées",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la ressource",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/resources/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete resource");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Ressource supprimée",
        description: "La ressource a été supprimée avec succès",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la ressource",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "venue",
      description: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      website: "",
      pricing: "",
      capacity: undefined,
      availability: "",
      internalNotes: "",
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setEditingResource(null);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEdit = (resource: Resource) => {
    setFormData({
      name: resource.name,
      type: resource.type,
      description: resource.description || "",
      contactName: resource.contactName || "",
      contactEmail: resource.contactEmail || "",
      contactPhone: resource.contactPhone || "",
      address: resource.address || "",
      website: resource.website || "",
      pricing: resource.pricing || "",
      capacity: resource.capacity || undefined,
      availability: resource.availability || "",
      internalNotes: resource.internalNotes || "",
    });
    setEditingResource(resource);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.type) {
      toast({
        title: "Champs requis",
        description: "Le nom et le type sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, data: formData as InsertResource });
    } else {
      createMutation.mutate(formData as InsertResource);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Ressources</h1>
            <p className="text-muted-foreground mt-1">
              Salles de spectacle, équipements et services pour les artistes
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenCreate} data-testid="button-create-resource">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle ressource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? "Modifier la ressource" : "Nouvelle ressource"}
                </DialogTitle>
                <DialogDescription>
                  {editingResource
                    ? "Modifiez les informations de la ressource"
                    : "Ajoutez une nouvelle salle, équipement ou service"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      data-testid="input-resource-name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nom de la ressource"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger id="type" data-testid="select-resource-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="venue">Salle de spectacle</SelectItem>
                        <SelectItem value="equipment">Équipement</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="other">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="input-resource-description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description de la ressource"
                    rows={3}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Nom du contact</Label>
                      <Input
                        id="contactName"
                        data-testid="input-contact-name"
                        value={formData.contactName || ""}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="Personne à contacter"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        data-testid="input-contact-email"
                        value={formData.contactEmail || ""}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="contactPhone">Téléphone</Label>
                    <Input
                      id="contactPhone"
                      data-testid="input-contact-phone"
                      value={formData.contactPhone || ""}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Localisation & Détails</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        data-testid="input-address"
                        value={formData.address || ""}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Adresse complète"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input
                        id="website"
                        type="url"
                        data-testid="input-website"
                        value={formData.website || ""}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="capacity">Capacité</Label>
                        <Input
                          id="capacity"
                          type="number"
                          data-testid="input-capacity"
                          value={formData.capacity || ""}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : undefined })}
                          placeholder="Nombre de places"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pricing">Tarifs</Label>
                        <Input
                          id="pricing"
                          data-testid="input-pricing"
                          value={formData.pricing || ""}
                          onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                          placeholder="Info sur les prix"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Disponibilité</Label>
                      <Input
                        id="availability"
                        data-testid="input-availability"
                        value={formData.availability || ""}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        placeholder="Horaires, jours disponibles"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="internalNotes">Notes internes</Label>
                    <Textarea
                      id="internalNotes"
                      data-testid="input-internal-notes"
                      value={formData.internalNotes || ""}
                      onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                      placeholder="Notes privées visibles uniquement par l'équipe"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-resource"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-resource"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Enregistrement..."
                    : editingResource
                    ? "Enregistrer"
                    : "Créer"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">Toutes</TabsTrigger>
            <TabsTrigger value="venue" data-testid="tab-venue">Salles</TabsTrigger>
            <TabsTrigger value="equipment" data-testid="tab-equipment">Équipement</TabsTrigger>
            <TabsTrigger value="service" data-testid="tab-service">Services</TabsTrigger>
            <TabsTrigger value="other" data-testid="tab-other">Autres</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => {
              const Icon = resourceTypeIcons[resource.type];
              return (
                <Card key={resource.id} data-testid={`resource-card-${resource.id}`} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="truncate">{resource.name}</CardTitle>
                          <CardDescription>
                            <Badge variant="secondary" className="mt-1">
                              {resourceTypeLabels[resource.type]}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleOpenEdit(resource)}
                          data-testid={`button-edit-${resource.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(resource.id, resource.name)}
                          data-testid={`button-delete-${resource.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resource.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                    )}
                    <div className="space-y-2 text-sm">
                      {resource.contactEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{resource.contactEmail}</span>
                        </div>
                      )}
                      {resource.contactPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{resource.contactPhone}</span>
                        </div>
                      )}
                      {resource.address && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{resource.address}</span>
                        </div>
                      )}
                      {resource.website && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline truncate"
                            data-testid={`link-website-${resource.id}`}
                          >
                            Voir le site
                          </a>
                        </div>
                      )}
                    </div>
                    {(resource.capacity || resource.pricing || resource.availability) && (
                      <div className="pt-3 border-t space-y-1 text-sm">
                        {resource.capacity && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Capacité:</span>
                            <span className="font-medium">{resource.capacity} places</span>
                          </div>
                        )}
                        {resource.pricing && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tarifs:</span>
                            <span className="font-medium">{resource.pricing}</span>
                          </div>
                        )}
                        {resource.availability && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Disponibilité:</span>
                            <span className="font-medium">{resource.availability}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {selectedType === "all"
                  ? "Aucune ressource trouvée. Créez votre première ressource."
                  : `Aucune ressource de type "${resourceTypeLabels[selectedType]}".`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
