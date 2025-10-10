import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Check, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AccompanimentPlan } from "@shared/schema";
import { nanoid } from "nanoid";

interface AccompanimentPlanTabProps {
  artistId: string;
}

interface PlanStep {
  id: string;
  description: string;
  completed: boolean;
  assignedTo?: string;
}

export function AccompanimentPlanTab({ artistId }: AccompanimentPlanTabProps) {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AccompanimentPlan | null>(null);
  const [newObjective, setNewObjective] = useState("");
  const [newSteps, setNewSteps] = useState<PlanStep[]>([]);
  const [newStepText, setNewStepText] = useState("");

  const { data: plans, isLoading } = useQuery<AccompanimentPlan[]>({
    queryKey: [`/api/artists/${artistId}/plans`],
  });

  const createPlanMutation = useMutation({
    mutationFn: async (data: { objective: string; steps: PlanStep[] }) => {
      return await apiRequest("POST", "/api/plans", {
        artistId,
        objective: data.objective,
        steps: data.steps,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/plans`] });
      toast({
        title: "Plan créé",
        description: "Le plan d'accompagnement a été créé avec succès.",
      });
      setCreateDialogOpen(false);
      setNewObjective("");
      setNewSteps([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, steps }: { id: string; steps: PlanStep[] }) => {
      return await apiRequest("PATCH", `/api/plans/${id}`, { steps });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/artists/${artistId}/plans`] });
      toast({
        title: "Plan mis à jour",
        description: "Le plan d'accompagnement a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    },
  });

  const handleAddStep = () => {
    if (!newStepText.trim()) return;
    setNewSteps([...newSteps, { id: nanoid(), description: newStepText, completed: false }]);
    setNewStepText("");
  };

  const handleRemoveStep = (stepId: string) => {
    setNewSteps(newSteps.filter(s => s.id !== stepId));
  };

  const handleToggleStep = (plan: AccompanimentPlan, stepId: string) => {
    const updatedSteps = plan.steps.map(step =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    updatePlanMutation.mutate({ id: plan.id, steps: updatedSteps });
  };

  const handleCreatePlan = () => {
    if (!newObjective.trim() || newSteps.length === 0) {
      toast({
        title: "Champs manquants",
        description: "Veuillez renseigner un objectif et au moins une étape.",
        variant: "destructive",
      });
      return;
    }
    createPlanMutation.mutate({ objective: newObjective, steps: newSteps });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Plans d'Accompagnement</h3>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-plan">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un Plan d'Accompagnement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="objective">Objectif *</Label>
                <Textarea
                  id="objective"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Décrivez l'objectif principal de ce plan..."
                  data-testid="textarea-plan-objective"
                />
              </div>
              <div>
                <Label>Étapes d'Action *</Label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddStep()}
                    placeholder="Nouvelle étape..."
                    data-testid="input-plan-step"
                  />
                  <Button type="button" onClick={handleAddStep} data-testid="button-add-step">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {newSteps.length > 0 && (
                  <div className="space-y-2">
                    {newSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-2 p-2 rounded-md border">
                        <span className="flex-1 text-sm">{step.description}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStep(step.id)}
                          data-testid={`button-remove-step-${step.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)} data-testid="button-cancel-plan">
                  Annuler
                </Button>
                <Button
                  onClick={handleCreatePlan}
                  disabled={createPlanMutation.isPending}
                  data-testid="button-submit-plan"
                >
                  {createPlanMutation.isPending ? "Création..." : "Créer le Plan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {plans && plans.length > 0 ? (
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card key={plan.id} data-testid={`plan-${plan.id}`}>
              <CardHeader>
                <CardTitle className="text-base">{plan.objective}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-3 rounded-md border hover-elevate"
                      data-testid={`step-${step.id}`}
                    >
                      <Checkbox
                        checked={step.completed}
                        onCheckedChange={() => handleToggleStep(plan, step.id)}
                        data-testid={`checkbox-step-${step.id}`}
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${step.completed ? "line-through text-muted-foreground" : ""}`}>
                          {step.description}
                        </p>
                        {step.assignedTo && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Assigné à: {step.assignedTo}
                          </p>
                        )}
                      </div>
                      {step.completed && (
                        <Badge variant="outline" className="bg-green-500/10">
                          <Check className="h-3 w-3 mr-1" />
                          Complété
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Aucun plan d'accompagnement créé
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
