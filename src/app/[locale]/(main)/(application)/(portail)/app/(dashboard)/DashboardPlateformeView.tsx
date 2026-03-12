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
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  FileCheck,
  FileText,
  ReceiptEuro,
  TrendingUp,
  Users,
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

const caMensuelData = [
  { mois: "Avr", intermediaire: 210000, direct: 45000 },
  { mois: "Mai", intermediaire: 225000, direct: 42000 },
  { mois: "Jun", intermediaire: 198000, direct: 51000 },
  { mois: "Jul", intermediaire: 215000, direct: 38000 },
  { mois: "Aoû", intermediaire: 180000, direct: 29000 },
  { mois: "Sep", intermediaire: 238000, direct: 55000 },
  { mois: "Oct", intermediaire: 262000, direct: 58000 },
  { mois: "Nov", intermediaire: 244000, direct: 62000 },
  { mois: "Déc", intermediaire: 251000, direct: 47000 },
  { mois: "Jan", intermediaire: 268000, direct: 71000 },
  { mois: "Fév", intermediaire: 279000, direct: 68000 },
  { mois: "Mar", intermediaire: 291000, direct: 74000 },
];

const secteurClients = [
  { name: "Services / Conseil", value: 28, color: "hsl(258 64% 55%)" },
  { name: "Tech & Startups", value: 22, color: "hsl(258 54% 45%)" },
  { name: "Santé & Médical", value: 18, color: "hsl(240 45% 60%)" },
  { name: "Commerce & Retail", value: 14, color: "hsl(225 50% 65%)" },
  { name: "Coworking", value: 10, color: "hsl(210 55% 68%)" },
  { name: "Autres", value: 8, color: "hsl(200 40% 72%)" },
];

const servicesPopulaires = [
  { service: "Nettoyage", clients: 39, color: "hsl(196 64% 30%)" },
  { service: "Maintenance", clients: 31, color: "hsl(258 64% 55%)" },
  { service: "Sécu. incendie", clients: 28, color: "hsl(32 93% 50%)" },
  { service: "Café", clients: 22, color: "hsl(172 55% 45%)" },
  { service: "Eau", clients: 19, color: "hsl(200 75% 45%)" },
  { service: "Fruits & Snacks", clients: 14, color: "hsl(142 60% 50%)" },
  { service: "Boissons", clients: 11, color: "hsl(45 90% 52%)" },
  { service: "Office Mgr", clients: 8, color: "hsl(330 60% 55%)" },
  { service: "Pilotage FM", clients: 5, color: "hsl(258 40% 70%)" },
];

const topClients = [
  {
    nom: "Acme Corp",
    secteur: "Tech",
    sites: 8,
    ca: "142 800 €",
    statut: "actif",
    evolution: "+12%",
  },
  {
    nom: "Biotech SA",
    secteur: "Santé",
    sites: 5,
    ca: "98 500 €",
    statut: "actif",
    evolution: "+5%",
  },
  {
    nom: "ConsultGroup",
    secteur: "Conseil",
    sites: 12,
    ca: "187 200 €",
    statut: "actif",
    evolution: "+18%",
  },
  {
    nom: "RetailPro",
    secteur: "Commerce",
    sites: 3,
    ca: "54 300 €",
    statut: "actif",
    evolution: "-2%",
  },
  {
    nom: "CoworkPlus",
    secteur: "Coworking",
    sites: 6,
    ca: "76 900 €",
    statut: "actif",
    evolution: "+8%",
  },
];

const activiteRecente = [
  {
    type: "devis_signe",
    texte: "Devis DV-0231 signé par Acme Corp",
    montant: "34 800 €",
    date: "il y a 25min",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    Icon: FileCheck,
  },
  {
    type: "ticket_ouvert",
    texte: "Nouveau ticket urgent — StartupXYZ",
    montant: null,
    date: "il y a 1h",
    color: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    Icon: AlertCircle,
  },
  {
    type: "facture_emise",
    texte: "Facture FA-0198 émise — Biotech SA",
    montant: "28 400 €",
    date: "il y a 3h",
    color: "bg-violet-100 dark:bg-violet-900/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    Icon: ReceiptEuro,
  },
  {
    type: "client_cree",
    texte: "Nouveau client créé — RetailPro",
    montant: null,
    date: "il y a 5h",
    color: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    Icon: Building2,
  },
  {
    type: "devis_signe",
    texte: "Devis DV-0230 signé par CoworkPlus",
    montant: "18 200 €",
    date: "hier 16h",
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    Icon: FileCheck,
  },
  {
    type: "ticket_clos",
    texte: "Ticket TK-0132 clôturé — ConsultGroup",
    montant: null,
    date: "hier 14h",
    color: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-500",
    Icon: CheckCircle2,
  },
];

const caConfig: ChartConfig = {
  intermediaire: {
    label: "Intermédiaire FM4ALL",
    color: "hsl(258 64% 55%)",
  },
  direct: { label: "Direct", color: "hsl(258 40% 75%)" },
};

const servicesConfig: ChartConfig = {
  clients: { label: "Clients", color: "hsl(258 64% 55%)" },
};

export function DashboardPlateformeView() {
  const user = useAppStore((s) => s.user);

  const kpis = [
    {
      label: "Entreprises clientes",
      value: "47",
      sub: "+3 ce mois",
      positive: true,
      Icon: Building2,
      colorText: "text-violet-600 dark:text-violet-400",
      colorBg: "bg-violet-50 dark:bg-violet-950/40",
    },
    {
      label: "Prestataires actifs",
      value: "23",
      sub: "+1 ce trimestre",
      positive: true,
      Icon: Users,
      colorText: "text-indigo-600 dark:text-indigo-400",
      colorBg: "bg-indigo-50 dark:bg-indigo-950/40",
    },
    {
      label: "CA annuel signé",
      value: "2.3M€",
      sub: "+23% vs N-1",
      positive: true,
      Icon: TrendingUp,
      colorText: "text-emerald-600 dark:text-emerald-400",
      colorBg: "bg-emerald-50 dark:bg-emerald-950/40",
    },
    {
      label: "Tickets ouverts",
      value: "128",
      sub: "14 urgents",
      positive: false,
      Icon: AlertCircle,
      colorText: "text-orange-600 dark:text-orange-400",
      colorBg: "bg-orange-50 dark:bg-orange-950/40",
    },
    {
      label: "Devis en attente",
      value: "14",
      sub: "3 expirés bientôt",
      positive: null,
      Icon: FileText,
      colorText: "text-sky-600 dark:text-sky-400",
      colorBg: "bg-sky-50 dark:bg-sky-950/40",
    },
    {
      label: "Factures impayées",
      value: "7",
      sub: "41 200 € en cours",
      positive: false,
      Icon: ReceiptEuro,
      colorText: "text-red-600 dark:text-red-400",
      colorBg: "bg-red-50 dark:bg-red-950/40",
    },
  ];

  const totalCaAnnuel = caMensuelData.reduce(
    (sum, d) => sum + d.intermediaire + d.direct,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Bonjour, {user?.prenom ?? "..."}&nbsp;👋
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">Mars 2026</p>
        </div>
      </div>

      {/* KPI Cards — 3+3 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
                      <AlertCircle className="size-3 text-red-500" />
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

      {/* CA chart + Secteurs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Area chart CA mensuel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Chiffre d&apos;affaires mensuel consolidé
            </CardTitle>
            <CardDescription className="text-xs">
              12 derniers mois · Total annuel :{" "}
              <strong className="text-foreground">
                {(totalCaAnnuel / 1_000_000).toFixed(2)}M €
              </strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={caConfig} className="h-[220px] w-full">
              <AreaChart
                data={caMensuelData}
                margin={{ top: 6, right: 8, left: -6, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="gradIntermédiaire"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(258 64% 55%)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(258 64% 55%)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                  <linearGradient id="gradDirect" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(258 40% 75%)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(258 40% 75%)"
                      stopOpacity={0.02}
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
                      ]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="intermediaire"
                  stroke="hsl(258 64% 55%)"
                  strokeWidth={2.5}
                  fill="url(#gradIntermédiaire)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
                <Area
                  type="monotone"
                  dataKey="direct"
                  stroke="hsl(258 40% 75%)"
                  strokeWidth={1.5}
                  fill="url(#gradDirect)"
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 0 }}
                />
              </AreaChart>
            </ChartContainer>
            <div className="mt-2 flex justify-center gap-6">
              {[
                {
                  label: "Intermédiaire FM4ALL",
                  color: "hsl(258 64% 55%)",
                },
                { label: "Direct", color: "hsl(258 40% 75%)" },
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

        {/* Donut secteurs */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Clients par secteur
            </CardTitle>
            <CardDescription className="text-xs">
              47 entreprises clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[180px] w-full">
              <PieChart>
                <Pie
                  data={secteurClients}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  dataKey="value"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {secteurClients.map((entry, i) => (
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
            <div className="mt-2 space-y-1">
              {secteurClients.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-muted-foreground truncate text-[11px]">
                    {s.name}
                  </span>
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

      {/* Services + Activité */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Bar chart services */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Services les plus demandés
            </CardTitle>
            <CardDescription className="text-xs">
              Nombre de clients par service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={servicesConfig}
              className="h-[230px] w-full"
            >
              <BarChart
                data={servicesPopulaires}
                margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                barSize={18}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="service"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="clients" radius={[4, 4, 0, 0]}>
                  {servicesPopulaires.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Activité récente
                </CardTitle>
                <CardDescription className="text-xs">
                  Plateforme · Toutes entreprises
                </CardDescription>
              </div>
              <Activity className="text-muted-foreground size-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {activiteRecente.map((item, i) => (
              <div
                key={i}
                className="hover:bg-muted/40 flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors"
              >
                <div
                  className={`mt-0.5 shrink-0 rounded-lg p-1.5 ${item.color}`}
                >
                  <item.Icon className={`size-3.5 ${item.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-snug font-medium">
                    {item.texte}
                  </p>
                  {item.montant && (
                    <p className="mt-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {item.montant}
                    </p>
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 text-[10px]">
                  {item.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top clients table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">
                Top clients · CA cumulé
              </CardTitle>
              <CardDescription className="text-xs">
                Classés par chiffre d&apos;affaires · 12 derniers mois
              </CardDescription>
            </div>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              47 clients
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                    Entreprise
                  </th>
                  <th className="text-muted-foreground pb-2 text-left text-xs font-medium">
                    Secteur
                  </th>
                  <th className="text-muted-foreground pb-2 text-center text-xs font-medium">
                    Sites
                  </th>
                  <th className="text-muted-foreground pb-2 text-right text-xs font-medium">
                    CA 12m
                  </th>
                  <th className="text-muted-foreground pb-2 text-right text-xs font-medium">
                    Évolution
                  </th>
                  <th className="text-muted-foreground pb-2 text-center text-xs font-medium">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {topClients.map((c) => (
                  <tr
                    key={c.nom}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-2.5 font-semibold">{c.nom}</td>
                    <td className="text-muted-foreground py-2.5 text-xs">
                      {c.secteur}
                    </td>
                    <td className="py-2.5 text-center text-xs">{c.sites}</td>
                    <td className="py-2.5 text-right font-mono text-xs font-semibold">
                      {c.ca}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`text-xs font-semibold ${c.evolution.startsWith("+") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {c.evolution}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        {c.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
