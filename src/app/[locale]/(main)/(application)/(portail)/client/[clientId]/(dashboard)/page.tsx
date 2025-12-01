import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const page = async ({ params }: { params: Promise<{ clientId: number }> }) => {
  return (
    <div className="space-y-6 p-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Tickets en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">37 tickets</p>
            <p className="text-muted-foreground mt-1 text-sm">
              ↘︎ 12% vs mois dernier
            </p>
            <p className="text-muted-foreground text-sm">
              Tickets ouverts actuellement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Délai moyen de résolution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2,4 jours</p>
            <p className="text-muted-foreground mt-1 text-sm">
              ↗︎ 8% d'amélioration
            </p>
            <p className="text-muted-foreground text-sm">30 derniers jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux de résolution SLA</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">92%</p>
            <p className="text-muted-foreground mt-1 text-sm">↗︎ +4 points</p>
            <p className="text-muted-foreground text-sm">
              Engagements respectés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coût total du mois</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">12 480 €</p>
            <p className="text-muted-foreground mt-1 text-sm">
              ↘︎ -6% vs mois dernier
            </p>
            <p className="text-muted-foreground text-sm">
              Interventions en cours d'intégration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Volume de tickets (3 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground text-sm">
            <li>Avril : 128 tickets</li>
            <li>Mai : 142 tickets</li>
            <li>Juin : 119 tickets</li>
          </ul>
        </CardContent>
      </Card>

      {/* Second row: categories + sites + attente */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 sites les plus actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>Siège La Défense — 54 tickets</li>
              <li>Site Lyon Centre — 31 tickets</li>
              <li>Site Bordeaux — 22 tickets</li>
              <li>Site Lille — 18 tickets</li>
              <li>Site Nantes — 14 tickets</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catégories les plus fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>Électricité — 23%</li>
              <li>Propreté — 18%</li>
              <li>Plomberie — 14%</li>
              <li>Dégradations — 11%</li>
              <li>Sécurité incendie — 9%</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interventions en attente</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground mb-4 space-y-1 text-sm">
              <li>En attente prestataire : 9</li>
              <li>En attente client : 4</li>
              <li>En attente FM4ALL : 2</li>
            </ul>

            <p className="mb-2 font-semibold">Performance prestataires</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>Fournisseur Électro+ — 18 interventions</li>
              <li>NettoyagePro — 12 interventions</li>
              <li>Plomberie24 — 7 interventions</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
