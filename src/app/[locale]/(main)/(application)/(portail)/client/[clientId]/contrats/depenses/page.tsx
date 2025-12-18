"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Euro, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

// ============ FAKE DATA ============

// Dépenses mensuelles sur 12 mois
const depensesMensuelles = [
  { mois: "Jan", montant: 12500, prevision: 13000 },
  { mois: "Fév", montant: 11800, prevision: 12500 },
  { mois: "Mar", montant: 13200, prevision: 12800 },
  { mois: "Avr", montant: 12900, prevision: 13000 },
  { mois: "Mai", montant: 14500, prevision: 13500 },
  { mois: "Juin", montant: 15200, prevision: 14000 },
  { mois: "Juil", montant: 13800, prevision: 14200 },
  { mois: "Août", montant: 10200, prevision: 11000 },
  { mois: "Sep", montant: 14800, prevision: 14500 },
  { mois: "Oct", montant: 15600, prevision: 15000 },
  { mois: "Nov", montant: 16200, prevision: 15500 },
  { mois: "Déc", montant: 17500, prevision: 16000 },
];

// Dépenses par service
const depensesParService = [
  { service: "Nettoyage", montant: 68000, fill: "var(--color-nettoyage)" },
  { service: "Hygiène", montant: 24500, fill: "var(--color-hygiene)" },
  { service: "Café", montant: 18200, fill: "var(--color-cafe)" },
  { service: "Fontaines", montant: 8400, fill: "var(--color-fontaines)" },
  { service: "Snacking", montant: 12300, fill: "var(--color-snacking)" },
  { service: "Autres", montant: 6800, fill: "var(--color-autres)" },
];

// Dépenses par site
const depensesParSite = [
  { site: "Siège Paris", montant: 52000 },
  { site: "Agence Lyon", montant: 31500 },
  { site: "Bureau Marseille", montant: 18700 },
  { site: "Entrepôt Lille", montant: 22400 },
  { site: "Showroom Bordeaux", montant: 13600 },
];

// Dépenses par fournisseur
const depensesParFournisseur = [
  {
    fournisseur: "CleanPro Services",
    montant: 45000,
    fill: "var(--color-cleanpro)",
  },
  {
    fournisseur: "Hygiène Plus",
    montant: 28500,
    fill: "var(--color-hygieneplus)",
  },
  { fournisseur: "Café & Co", montant: 22800, fill: "var(--color-cafeco)" },
  { fournisseur: "Aqua Fresh", montant: 18200, fill: "var(--color-aquafresh)" },
  {
    fournisseur: "Food Service",
    montant: 15300,
    fill: "var(--color-foodservice)",
  },
  {
    fournisseur: "Multi Services",
    montant: 8400,
    fill: "var(--color-multiservices)",
  },
];

// ============ CHART CONFIGS ============

const chartConfigMensuel: ChartConfig = {
  montant: {
    label: "Dépenses réelles",
    color: "var(--chart-1)",
  },
  prevision: {
    label: "Budget prévisionnel",
    color: "var(--chart-2)",
  },
};

const chartConfigService: ChartConfig = {
  nettoyage: { label: "Nettoyage", color: "var(--chart-1)" },
  hygiene: { label: "Hygiène", color: "var(--chart-2)" },
  cafe: { label: "Café", color: "var(--chart-3)" },
  fontaines: { label: "Fontaines", color: "var(--chart-4)" },
  snacking: { label: "Snacking", color: "var(--chart-5)" },
  autres: { label: "Autres", color: "hsl(215 20% 65%)" },
};

const chartConfigFournisseur: ChartConfig = {
  cleanpro: { label: "CleanPro Services", color: "var(--chart-1)" },
  hygieneplus: { label: "Hygiène Plus", color: "var(--chart-2)" },
  cafeco: { label: "Café & Co", color: "var(--chart-3)" },
  aquafresh: { label: "Aqua Fresh", color: "var(--chart-4)" },
  foodservice: { label: "Food Service", color: "var(--chart-5)" },
  multiservices: { label: "Multi Services", color: "hsl(215 20% 65%)" },
};

// ============ COMPONENT ============

const DepensesPage = () => {
  const [periode, setPeriode] = useState("12mois");

  // Calculs des KPIs
  const totalDepenses = depensesMensuelles.reduce(
    (acc, m) => acc + m.montant,
    0,
  );
  const totalBudget = depensesMensuelles.reduce(
    (acc, m) => acc + m.prevision,
    0,
  );
  const ecartBudget = totalDepenses - totalBudget;
  const moyenneMensuelle = totalDepenses / 12;

  // Évolution par rapport au mois précédent (fake)
  const evolutionMensuelle = 8.5; // +8.5%

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <main className="flex h-full w-full flex-col overflow-hidden md:border-x">
      <div className="bg-background/95 shrink-0 border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-xl font-bold">Tableau de bord des dépenses</h1>
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3mois">3 derniers mois</SelectItem>
              <SelectItem value="6mois">6 derniers mois</SelectItem>
              <SelectItem value="12mois">12 derniers mois</SelectItem>
              <SelectItem value="annee">Année en cours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 md:p-6">
          {/* KPIs */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total dépenses
                </CardTitle>
                <Euro className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalDepenses)}
                </div>
                <p className="text-muted-foreground text-xs">
                  sur les 12 derniers mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Moyenne mensuelle
                </CardTitle>
                <Building2 className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(moyenneMensuelle)}
                </div>
                <p className="text-muted-foreground text-xs">
                  /mois en moyenne
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Évolution mensuelle
                </CardTitle>
                {evolutionMensuelle > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${evolutionMensuelle > 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {evolutionMensuelle > 0 ? "+" : ""}
                  {evolutionMensuelle}%
                </div>
                <p className="text-muted-foreground text-xs">
                  vs mois précédent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Écart budget
                </CardTitle>
                <Euro className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${ecartBudget > 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {ecartBudget > 0 ? "+" : ""}
                  {formatCurrency(ecartBudget)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {ecartBudget > 0 ? "dépassement" : "économie"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques principaux */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Évolution mensuelle */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Évolution des dépenses mensuelles</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfigMensuel}
                  className="h-[300px] w-full"
                >
                  <AreaChart data={depensesMensuelles}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1000).toFixed(0)}k€`
                      }
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <span>
                              {name === "montant"
                                ? "Dépenses réelles"
                                : "Budget"}{" "}
                              : {formatCurrency(Number(value))}
                            </span>
                          )}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="prevision"
                      stroke="var(--color-prevision)"
                      fill="var(--color-prevision)"
                      fillOpacity={0.2}
                      strokeDasharray="5 5"
                    />
                    <Area
                      type="monotone"
                      dataKey="montant"
                      stroke="var(--color-montant)"
                      fill="var(--color-montant)"
                      fillOpacity={0.4}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Dépenses par service (Pie) */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par service</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfigService}
                  className="mx-auto h-[300px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={depensesParService}
                      dataKey="montant"
                      nameKey="service"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ service, percent }) =>
                        `${service} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {depensesParService.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`var(--chart-${(index % 5) + 1})`}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Dépenses par site (Bar) */}
            <Card>
              <CardHeader>
                <CardTitle>Dépenses par site</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    montant: {
                      label: "Montant",
                      color: "var(--chart-1)",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <BarChart data={depensesParSite} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) =>
                        `${(value / 1000).toFixed(0)}k€`
                      }
                    />
                    <YAxis
                      dataKey="site"
                      type="category"
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Bar
                      dataKey="montant"
                      fill="var(--color-montant)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Dépenses par fournisseur (Pie) */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition par fournisseur</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfigFournisseur}
                  className="mx-auto h-[300px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={depensesParFournisseur}
                      dataKey="montant"
                      nameKey="fournisseur"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      label={({ fournisseur, percent }) =>
                        `${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {depensesParFournisseur.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`var(--chart-${(index % 5) + 1})`}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <span>
                              {name}: {formatCurrency(Number(value))}
                            </span>
                          )}
                        />
                      }
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="fournisseur" />}
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top dépenses par service (Bar horizontal) */}
            <Card>
              <CardHeader>
                <CardTitle>Top services par dépenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfigService}
                  className="h-[300px] w-full"
                >
                  <BarChart data={depensesParService} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) =>
                        `${(value / 1000).toFixed(0)}k€`
                      }
                    />
                    <YAxis
                      dataKey="service"
                      type="category"
                      width={90}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => formatCurrency(Number(value))}
                        />
                      }
                    />
                    <Bar dataKey="montant" radius={[0, 4, 4, 0]}>
                      {depensesParService.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`var(--chart-${(index % 5) + 1})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DepensesPage;
