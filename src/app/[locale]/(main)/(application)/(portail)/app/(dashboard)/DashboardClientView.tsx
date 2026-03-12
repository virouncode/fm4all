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
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  TrendingDown,
  Wrench,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const depensesData = [
  { mois: "Avr", montant: 42500 },
  { mois: "Mai", montant: 38900 },
  { mois: "Jun", montant: 45200 },
  { mois: "Jul", montant: 41800 },
  { mois: "Aoû", montant: 39200 },
  { mois: "Sep", montant: 48600 },
  { mois: "Oct", montant: 52100 },
  { mois: "Nov", montant: 49800 },
  { mois: "Déc", montant: 47300 },
  { mois: "Jan", montant: 51200 },
  { mois: "Fév", montant: 53800 },
  { mois: "Mar", montant: 55400 },
];

const servicesData = [
  { name: "Nettoyage", value: 35, color: "hsl(196 64% 24%)" },
  { name: "Maintenance", value: 25, color: "hsl(196 64% 42%)" },
  { name: "Sécurité incendie", value: 15, color: "hsl(172 55% 45%)" },
  { name: "Machines à café", value: 10, color: "hsl(160 40% 58%)" },
  { name: "Fontaines à eau", value: 8, color: "hsl(148 35% 62%)" },
  { name: "Autres", value: 7, color: "hsl(140 28% 72%)" },
];

const ticketsData = [
  { mois: "Oct", ouverts: 8, clos: 6 },
  { mois: "Nov", ouverts: 12, clos: 10 },
  { mois: "Déc", ouverts: 5, clos: 8 },
  { mois: "Jan", ouverts: 9, clos: 7 },
  { mois: "Fév", ouverts: 11, clos: 14 },
  { mois: "Mar", ouverts: 7, clos: 5 },
];

const recentTickets = [
  {
    id: "TK-0142",
    titre: "Panne climatisation bureau 3",
    statut: "pris_en_charge",
    priorite: "haute",
    site: "Paris Opéra",
    date: "il y a 2h",
  },
  {
    id: "TK-0141",
    titre: "Réapprovisionnement capsules café",
    statut: "nouveau",
    priorite: "normale",
    site: "Lyon Part-Dieu",
    date: "il y a 5h",
  },
  {
    id: "TK-0140",
    titre: "Fuite fontaine R+2",
    statut: "en_attente_prestataire",
    priorite: "haute",
    site: "Paris Opéra",
    date: "hier",
  },
  {
    id: "TK-0139",
    titre: "Remplacement ampoule salle conf.",
    statut: "a_valider",
    priorite: "basse",
    site: "Bordeaux Centre",
    date: "il y a 2j",
  },
  {
    id: "TK-0138",
    titre: "Nettoyage vitres ext. T1",
    statut: "clos",
    priorite: "normale",
    site: "Lyon Part-Dieu",
    date: "il y a 3j",
  },
];

const prochainesInterventions = [
  {
    service: "Nettoyage quotidien",
    site: "Paris Opéra",
    date: "Demain 8h00",
    prestataire: "CleanPro SARL",
  },
  {
    service: "Maintenance HVAC",
    site: "Lyon Part-Dieu",
    date: "Jeu 14h00",
    prestataire: "TechMaint",
  },
  {
    service: "Contrôle extincteurs",
    site: "Bordeaux Centre",
    date: "Ven 9h00",
    prestataire: "SafeGuard",
  },
  {
    service: "Entretien espaces verts",
    site: "Paris Opéra",
    date: "Lun 7h00",
    prestataire: "VertPlus",
  },
];

const depensesConfig: ChartConfig = {
  montant: { label: "Dépenses (€)", color: "hsl(196 64% 24%)" },
};

const ticketsConfig: ChartConfig = {
  ouverts: { label: "Ouverts", color: "hsl(25 95% 53%)" },
  clos: { label: "Clôturés", color: "hsl(172 55% 45%)" },
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
  en_attente_client: {
    label: "En att. client",
    className:
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
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
  annule: {
    label: "Annulé",
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
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
  basse: {
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

export function DashboardClientView() {
  const user = useAppStore((s) => s.user);

  const kpis = [
    {
      label: "Sites actifs",
      value: "8",
      sub: "+1 ce mois",
      positive: true,
      Icon: Building2,
      colorText: "text-teal-600 dark:text-teal-400",
      colorBg: "bg-teal-50 dark:bg-teal-950/40",
    },
    {
      label: "Prestations en cours",
      value: "12",
      sub: "Stable",
      positive: null,
      Icon: Wrench,
      colorText: "text-blue-600 dark:text-blue-400",
      colorBg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Tickets ouverts",
      value: "5",
      sub: "−3 vs mois dernier",
      positive: true,
      Icon: AlertCircle,
      colorText: "text-orange-600 dark:text-orange-400",
      colorBg: "bg-orange-50 dark:bg-orange-950/40",
    },
    {
      label: "Devis en attente",
      value: "2",
      sub: "À signer",
      positive: null,
      Icon: FileText,
      colorText: "text-violet-600 dark:text-violet-400",
      colorBg: "bg-violet-50 dark:bg-violet-950/40",
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
                      <TrendingDown className="size-3 text-emerald-500" />
                    )}
                    <span
                      className={
                        kpi.positive === true
                          ? "text-emerald-600 dark:text-emerald-400"
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
        {/* Area chart dépenses */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Dépenses mensuelles
            </CardTitle>
            <CardDescription className="text-xs">
              12 derniers mois · Total annuel :{" "}
              <strong className="text-foreground">565 800 €</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={depensesConfig}
              className="h-[220px] w-full"
            >
              <AreaChart
                data={depensesData}
                margin={{ top: 6, right: 8, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(196 64% 24%)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(196 64% 24%)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
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
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(v) => [
                        `${Number(v).toLocaleString("fr-FR")} €`,
                        "Dépenses",
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="montant"
                  stroke="hsl(196 64% 24%)"
                  strokeWidth={2.5}
                  fill="url(#gradDepenses)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut services */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Répartition services
            </CardTitle>
            <CardDescription className="text-xs">
              Par budget alloué
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[180px] w-full">
              <PieChart>
                <Pie
                  data={servicesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  dataKey="value"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {servicesData.map((entry, i) => (
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
            <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {servicesData.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-muted-foreground truncate text-[11px]">
                    {s.name}
                  </span>
                  <span className="ml-auto font-semibold">{s.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Bar chart tickets */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Activité tickets
            </CardTitle>
            <CardDescription className="text-xs">
              6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ticketsConfig} className="h-[190px] w-full">
              <BarChart
                data={ticketsData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                barGap={3}
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
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="ouverts"
                  fill="hsl(25 95% 53%)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                />
                <Bar
                  dataKey="clos"
                  fill="hsl(172 55% 45%)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ChartContainer>
            <div className="mt-2 flex justify-center gap-5">
              {[
                { label: "Ouverts", color: "hsl(25 95% 53%)" },
                { label: "Clôturés", color: "hsl(172 55% 45%)" },
              ].map((l) => (
                <div
                  key={l.label}
                  className="flex items-center gap-1.5 text-xs"
                >
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-muted-foreground">{l.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent tickets */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Derniers tickets
                </CardTitle>
                <CardDescription className="text-xs">
                  Activité récente
                </CardDescription>
              </div>
              <button className="text-primary flex items-center gap-1 text-xs hover:underline">
                Voir tout <ArrowRight className="size-3" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {recentTickets.map((t) => (
              <div
                key={t.id}
                className="hover:bg-muted/40 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors"
              >
                <span className="text-muted-foreground w-[68px] shrink-0 font-mono text-xs">
                  {t.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.titre}</p>
                  <p className="text-muted-foreground text-xs">{t.site}</p>
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

      {/* Prochaines interventions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Prochaines interventions planifiées
              </CardTitle>
              <CardDescription className="text-xs">
                7 prochains jours
              </CardDescription>
            </div>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {prochainesInterventions.map((item, i) => (
              <div
                key={i}
                className="bg-muted/40 hover:bg-muted/70 rounded-xl p-3.5 transition-colors"
              >
                <div className="flex items-start gap-2.5">
                  <div className="bg-primary/10 mt-0.5 shrink-0 rounded-lg p-1.5">
                    <Clock className="text-primary size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug font-semibold">
                      {item.service}
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {item.site}
                    </p>
                    <p className="text-primary mt-1.5 text-xs font-bold">
                      {item.date}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {item.prestataire}
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
