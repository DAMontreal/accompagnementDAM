import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Filter, TrendingUp, Users, DollarSign, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function Reports() {
  const [timeRange, setTimeRange] = useState("year");
  const [discipline, setDiscipline] = useState("all");

  const { data: reportData, isLoading } = useQuery<{
    totalArtists: number;
    totalApplications: number;
    acceptedApplications: number;
    totalFunding: number;
    byDiscipline: Array<{ discipline: string; count: number }>;
    byStatus: Array<{ status: string; count: number }>;
    fundingByMonth: Array<{ month: string; amount: number }>;
  }>({
    queryKey: [`/api/reports?timeRange=${timeRange}&discipline=${discipline}`],
  });

  // Export to CSV function
  const exportToCSV = () => {
    if (!reportData) return;

    const csvSections = [
      `Rapport d'Impact - ${new Date().toLocaleDateString('fr-FR')}`,
      `\nPériode: ${timeRange === 'month' ? 'Ce mois' : timeRange === 'quarter' ? 'Ce trimestre' : timeRange === 'year' ? 'Cette année' : 'Tout'}`,
      `Discipline: ${discipline === 'all' ? 'Toutes' : discipline}`,
      `\n\nMétriques Globales`,
      `Total Artistes,${reportData.totalArtists}`,
      `Total Candidatures,${reportData.totalApplications}`,
      `Candidatures Acceptées,${reportData.acceptedApplications}`,
      `Financement Total,${reportData.totalFunding}€`,
      `\n\nArtistes par Discipline`,
      `Discipline,Nombre`,
      ...reportData.byDiscipline.map(d => `"${d.discipline}",${d.count}`),
      `\n\nCandidatures par Statut`,
      `Statut,Nombre`,
      ...reportData.byStatus.map(s => `"${s.status}",${s.count}`),
      `\n\nFinancement par Mois`,
      `Mois,Montant (€)`,
      ...reportData.fundingByMonth.map(f => `"${f.month}",${f.amount}`),
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvSections], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rapport_impact_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Free memory
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-reports-title">
            Rapports d'Impact
          </h1>
          <p className="text-muted-foreground mt-1">
            Mesurez et visualisez l'impact de votre accompagnement
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={exportToCSV}
            disabled={!reportData}
            data-testid="button-export-csv"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button data-testid="button-export-report" disabled>
            <Download className="h-4 w-4 mr-2" />
            Exporter en PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Période</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger data-testid="select-time-range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="quarter">Ce trimestre</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                  <SelectItem value="all">Tout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discipline</Label>
              <Select value={discipline} onValueChange={setDiscipline}>
                <SelectTrigger data-testid="select-discipline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="visual_arts">Arts visuels</SelectItem>
                  <SelectItem value="music">Musique</SelectItem>
                  <SelectItem value="theater">Théâtre</SelectItem>
                  <SelectItem value="dance">Danse</SelectItem>
                  <SelectItem value="literature">Littérature</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card data-testid="card-metric-artists">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Artistes Accompagnés</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-metric-artists">
                {reportData?.totalArtists || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-metric-applications">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidatures Soumises</CardTitle>
              <Briefcase className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-metric-applications">
                {reportData?.totalApplications || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-metric-accepted">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidatures Acceptées</CardTitle>
              <TrendingUp className="h-5 w-5 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-2" data-testid="text-metric-accepted">
                {reportData?.acceptedApplications || 0}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-metric-funding">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financement Total</CardTitle>
              <DollarSign className="h-5 w-5 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-chart-3" data-testid="text-metric-funding">
                {(reportData?.totalFunding || 0).toLocaleString('fr-CA')} $
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Artistes par Discipline</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={reportData?.byDiscipline || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.discipline}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {reportData?.byDiscipline?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statut des Candidatures</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData?.byStatus || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financement par Mois</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={reportData?.fundingByMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="hsl(var(--chart-2))" name="Montant ($)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
