import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const page = async () => {
  return (
    <div className="space-y-6 p-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Clients actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">84 clients</p>
            <p className="text-muted-foreground mt-1 text-sm">
              ↗︎ +6 nouveaux ce mois-ci
            </p>
            <p className="text-muted-foreground text-sm">
              Portefeuille FM4ALL en production
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interventions en cours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">112 interventions</p>
            <p className="text-muted-foreground mt-1 text-sm">
              ↘︎ -9% vs mois dernier
            </p>
            <p className="text-muted-foreground text-sm">
              Tous clients et prestataires confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Taux de conformité SLA global</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">94%</p>
            <p className="text-muted-foreground mt-1 text-sm">
              ↗︎ +3 points sur 30 jours
            </p>
            <p className="text-muted-foreground text-sm">
              Interventions dans les délais contractuels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CA facturé ce mois</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">218 400 €</p>
            <p className="text-muted-foreground mt-1 text-sm">
              ↗︎ +11% vs mois dernier
            </p>
            <p className="text-muted-foreground text-sm">
              Prestations validées par les clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume global interventions */}
      <Card>
        <CardHeader>
          <CardTitle>Volume d’interventions (3 derniers mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-muted-foreground text-sm">
            <li>Avril : 862 interventions</li>
            <li>Mai : 915 interventions</li>
            <li>Juin : 871 interventions</li>
          </ul>
          <p className="text-muted-foreground mt-3 text-xs">
            Inclut tous les tickets FM4ALL, tous clients et catégories
          </p>
        </CardContent>
      </Card>

      {/* Second row: clients + catégories + prestataires */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 clients par volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>Groupe Hexa Industrie — 214 interventions</li>
              <li>Banque Atlantique — 176 interventions</li>
              <li>RetailNova France — 148 interventions</li>
              <li>TechCampus Europe — 121 interventions</li>
              <li>Ville de Montsélie — 96 interventions</li>
            </ul>
            <p className="text-muted-foreground mt-3 text-xs">
              Période : 30 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mix de prestations (tous clients)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>Propreté &amp; hygiène — 27%</li>
              <li>Maintenance multitechnique — 24%</li>
              <li>Sécurité / contrôle accès — 16%</li>
              <li>Espaces verts — 13%</li>
              <li>Bureautique &amp; services généraux — 9%</li>
            </ul>
            <p className="text-muted-foreground mt-3 text-xs">
              Répartition des interventions clôturées depuis le 1er du mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prestataires & qualité de service</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground mb-4 space-y-1 text-sm">
              <li>Prestataires actifs : 47</li>
              <li>En attente de convention : 3</li>
              <li>À auditer ce mois-ci : 5</li>
            </ul>

            <p className="mb-2 font-semibold">Top prestataires (SLA & NPS)</p>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>CleanCity Services — SLA 98% · NPS 4,7/5</li>
              <li>MultiTech Solutions — SLA 96% · NPS 4,5/5</li>
              <li>GreenPark &amp; Co — SLA 95% · NPS 4,4/5</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Third row: interne FM4ALL */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Onboarding & déploiements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>Clients en onboarding : 7</li>
              <li>Roll-out multi-sites en cours : 4</li>
              <li>Temps moyen de mise en service : 16 jours</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satisfaction clients FM4ALL</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">4,6 / 5</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Basé sur 189 retours sur 90 jours
            </p>
            <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
              <li>Qualité du suivi — 4,7 / 5</li>
              <li>Réactivité équipe FM4ALL — 4,5 / 5</li>
              <li>Clarté de la facturation — 4,4 / 5</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité interne FM4ALL</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-1 text-sm">
              <li>Dossiers en revue qualité : 12</li>
              <li>Litiges / réclamations en cours : 5</li>
              <li>Révisions de contrats planifiées : 9</li>
            </ul>
            <p className="text-muted-foreground mt-3 text-xs">
              Vue consolidée pour pilotage FM4ALL
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
