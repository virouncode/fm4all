"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAppStore } from "@/stores/application/appStore";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const interventionsData = [
  { mois: "Oct", interventions: 28, cibles: 30 },
  { mois: "Nov", interventions: 31, cibles: 30 },
  { mois: "Déc", interventions: 22, cibles: 28 },
  { mois: "Jan", interventions: 29, cibles: 30 },
  { mois: "Fév", interventions: 33, cibles: 32 },
  { mois: "Mar", interventions: 34, cibles: 35 },
];

const clientsInterventions = [
  { client: "Acme Corp", interventions: 12 },
  { client: "Biotech SA", interventions: 9 },
  { client: "StartupXYZ", interventions: 7 },
  { client: "Cabinet Dr. M.", interventions: 4 },
  { client: "CoworkPlus", interventions: 2 },
];

const occurrenceStatuts = [
  { name: "Terminées", value: 68, color: "hsl(172 55% 45%)" },
  { name: "En cours", value: 18, color: "hsl(200 75% 40%)" },
  { name: "Planifiées", value: 10, color: "hsl(196 64% 60%)" },
  { name: "Non honorées", value: 4, color: "hsl(0 72% 60%)" },
];

const ticketsAssignes = [
  {
    id: "TK-0142",
    client: "Acme Corp",
    titre: "Panne climatisation bureau 3",
    statut: "pris_en_charge",
    priorite: "haute",
    date: "il y a 2h",
  },
  {
    id: "TK-0140",
    client: "Biotech SA",
    titre: "Fuite fontaine eau minérale",
    statut: "en_attente_prestataire",
    priorite: "haute",
    date: "hier",
  },
  {
    id: "TK-0136",
    client: "StartupXYZ",
    titre: "Odeur anormale système ventilation",
    statut: "pris_en_charge",
    priorite: "normale",
    date: "il y a 2j",
  },
  {
    id: "TK-0133",
    client: "Acme Corp",
    titre: "Porte accès parking bloquée",
    statut: "a_valider",
    priorite: "normale",
    date: "il y a 3j",
  },
];

const prochainesOccurrences = [
  {
    service: "Nettoyage bureaux",
    client: "Acme Corp",
    site: "Paris Opéra",
    date: "Demain 8h00",
  },
  {
    service: "Maintenance HVAC",
    client: "Biotech SA",
    site: "Lyon Part-Dieu",
    date: "Mer 14h00",
  },
  {
    service: "Contrôle extincteurs",
    client: "StartupXYZ",
    site: "Paris 10e",
    date: "Jeu 9h00",
  },
  {
    service: "Désinfection cuisines",
    client: "Cabinet Dr. M.",
    site: "Paris 16e",
    date: "Ven 7h30",
  },
];

const interventionsConfig: ChartConfig = {
  interventions: { label: "Réalisées", color: "hsl(32 93% 50%)" },
  cibles: { label: "Cibles", color: "hsl(32 93% 80%)" },
};

const clientsConfig: ChartConfig = {
  interventions: { label: "Interventions", color: "hsl(32 93% 50%)" },
};

const statutMeta: Record<string, { label: string; className: string }> = {
  nouveau: {
    label: "Nouveau",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  pris_en_charge: {
    label: "Pris en charge",
    className:
      "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  },
  en_attente_prestataire: {
    label: "En att. prestataire",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  a_valider: {
    label: "À valider",
    className: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  },
  clos: {
    label: "Clôturé",
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
};

const prioriteMeta: Record<string, { className: string }> = {
  haute: {
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  normale: {
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  },
};

export function DashboardPrestatireView() {
  const user = useAppStore((s) => s.user);

  const kpis = [
    {
      label: "Clients actifs",
      value: "6",
      sub: "+1 ce trimestre",
      positive: true,
      Icon: Building2,
      colorText: "text-amber-600 dark:text-amber-400",
      colorBg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      label: "Interventions ce mois",
      value: "34",
      sub: "+2 vs objectif",
      positive: true,
      Icon: CalendarCheck,
      colorText: "text-orange-600 dark:text-orange-400",
      colorBg: "bg-orange-50 dark:bg-orange-950/40",
    },
    {
      label: "Tickets assignés",
      value: "8",
      sub: "3 urgents",
      positive: false,
      Icon: AlertTriangle,
      colorText: "text-red-600 dark:text-red-400",
      colorBg: "bg-red-50 dark:bg-red-950/40",
    },
    {
      label: "Taux de clôture",
      value: "87%",
      sub: "+4% vs mois dernier",
      positive: true,
      Icon: CheckCircle2,
      colorText: "text-emerald-600 dark:text-emerald-400",
      colorBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Bonjour, {user?.prenom ?? "..."}&nbsp;👋
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">Mars 2026</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="overflow-hidden">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-muted-foreground truncate text-sm font-medium">
                    {kpi.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">
                    {kpi.value}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1 text-xs">
                    {kpi.positive === true && (
                      <TrendingUp className="size-3 text-emerald-500" />
                    )}
                    {kpi.positive === false && (
                      <AlertTriangle className="size-3 text-red-500" />
                    )}
                    <span
                      className={
                        kpi.positive === true
                          ? "text-emerald-600 dark:text-emerald-400"
                          : kpi.positive === false
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground"
                      }
                    >
                      {kpi.sub}
                    </span>
                  </div>
                </div>
                <div className={`shrink-0 rounded-xl p-2.5 ${kpi.colorBg}`}>
                  <kpi.Icon className={`size-5 ${kpi.colorText}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Line chart interventions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Interventions réalisées vs cibles
            </CardTitle>
            <CardDescription className="text-xs">
              6 derniers mois · Taux de réalisation moyen :{" "}
              <strong className="text-foreground">103%</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={interventionsConfig}
              className="h-[220px] w-full"
            >
              <LineChart
                data={interventionsData}
                margin={{ top: 6, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={[15, 40]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="interventions"
                  stroke="hsl(32 93% 50%)"
                  strokeWidth={2.5}
                  dot={{ r: 3, strokeWidth: 0, fill: "hsl(32 93% 50%)" }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="cibles"
                  stroke="hsl(32 60% 70%)"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  dot={false}
                />
                <Legend
                  formatter={(value) =>
                    interventionsConfig[value]?.label ?? value
                  }
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut statuts occurrences */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Statuts occurrences
            </CardTitle>
            <CardDescription className="text-xs">
              Ce mois · 100 occurrences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[180px] w-full">
              <PieChart>
                <Pie
                  data={occurrenceStatuts}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  dataKey="value"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {occurrenceStatuts.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, n: string) => [`${v}%`, n]}
                  contentStyle={{
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--background))",
                  }}
                />
              </PieChart>
            </ChartContainer>
            <div className="mt-2 space-y-1.5">
              {occurrenceStatuts.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-muted-foreground">{s.name}</span>
                  <div className="bg-muted mx-1 h-1 flex-1 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.value}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                  <span className="font-semibold">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients + Tickets row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Horizontal bar chart clients */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Interventions par client
            </CardTitle>
            <CardDescription className="text-xs">Ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={clientsConfig} className="h-[200px] w-full">
              <BarChart
                data={clientsInterventions}
                layout="vertical"
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="client"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={85}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="interventions"
                  fill="hsl(32 93% 50%)"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={14}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Tickets assignés */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Tickets assignés récents
                </CardTitle>
                <CardDescription className="text-xs">
                  8 tickets ouverts · 3 urgents
                </CardDescription>
              </div>
              <button className="text-primary flex items-center gap-1 text-xs hover:underline">
                Voir tout <ArrowRight className="size-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {ticketsAssignes.map((t) => (
              <div
                key={t.id}
                className="hover:bg-muted/40 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors"
              >
                <span className="text-muted-foreground w-[68px] shrink-0 font-mono text-xs">
                  {t.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.titre}</p>
                  <p className="text-muted-foreground text-xs">{t.client}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${statutMeta[t.statut]?.className}`}
                >
                  {statutMeta[t.statut]?.label}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${prioriteMeta[t.priorite]?.className}`}
                >
                  {t.priorite}
                </span>
                <span className="text-muted-foreground w-20 shrink-0 text-right text-xs">
                  {t.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Prochaines occurrences */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Prochaines occurrences planifiées
              </CardTitle>
              <CardDescription className="text-xs">
                7 prochains jours · tous clients
              </CardDescription>
            </div>
            <Users className="text-muted-foreground size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {prochainesOccurrences.map((item, i) => (
              <div
                key={i}
                className="bg-muted/40 hover:bg-muted/70 rounded-xl p-3.5 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0 rounded-lg bg-amber-100 p-1.5 dark:bg-amber-900/30">
                    <Clock className="size-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug font-semibold">
                      {item.service}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                      {item.client}
                    </p>
                    <p className="text-muted-foreground text-xs">{item.site}</p>
                    <p className="mt-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                      {item.date}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
