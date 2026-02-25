"use client";

import { SelectTicketType } from "@/zod-schemas/ticket.schema";
import { SelectSiteType } from "@/zod-schemas/sites.schema";

type EntrepriseMinimal = { id: string; nom: string } | null;

type DocumentMinimal = {
  id: string;
  storageProvider: string;
  storageKey: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

type TicketDetailsClientProps = {
  ticket: SelectTicketType;
  entrepriseId: string;
  posture: "client" | "prestataire" | "plateforme";
  permissions: {
    canEditBasicFields: boolean;
    canEditAssigneEntreprise: boolean;
    canEditAssigneUser: boolean;
    canEditStatut: boolean;
  };
  availableStatuts: string[];
  availablePrestataires: Array<{ id: string; nom: string }>;
  availableUsers: Array<{ id: string; prenom: string; nom: string }>;
  site: SelectSiteType | null;
  proprietaireEntreprise: EntrepriseMinimal;
  demandeurEntreprise: EntrepriseMinimal;
  assigneEntreprise: EntrepriseMinimal;
  attachments: DocumentMinimal[];
};

export function TicketDetailsClient({
  ticket,
  entrepriseId,
  posture,
  permissions,
  availableStatuts,
  availablePrestataires,
  availableUsers,
  site,
  proprietaireEntreprise,
  demandeurEntreprise,
  assigneEntreprise,
  attachments,
}: TicketDetailsClientProps) {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header avec breadcrumb */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ticket #{ticket.id.slice(0, 8)}</h1>
        <p className="text-sm text-muted-foreground">
          Créé le {new Date(ticket.createdAt).toLocaleDateString("fr-FR")}
        </p>
      </div>

      {/* Section Header - Champs inline éditables */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Titre
            </label>
            <p className="text-lg font-semibold">{ticket.titre}</p>
          </div>

          {/* Type, Priorité, Statut en grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Type
              </label>
              <p className="text-base">{ticket.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Priorité
              </label>
              <p className="text-base">{ticket.priorite}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Statut
              </label>
              <p className="text-base">{ticket.statut}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Description */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <p className="text-base whitespace-pre-wrap">
          {ticket.description || "Aucune description"}
        </p>
      </div>

      {/* Section Metadata */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <h2 className="text-lg font-semibold mb-4">Informations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Site
            </label>
            <p className="text-base">{site?.nom || "Site inconnu"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Client propriétaire
            </label>
            <p className="text-base">
              {proprietaireEntreprise?.nom || "Entreprise inconnue"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Prestataire assigné
            </label>
            <p className="text-base">
              {assigneEntreprise?.nom || "Non assigné"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Utilisateur assigné
            </label>
            <p className="text-base">
              {ticket.assigneUserId
                ? availableUsers.find((u) => u.id === ticket.assigneUserId)
                    ? `${availableUsers.find((u) => u.id === ticket.assigneUserId)?.prenom} ${availableUsers.find((u) => u.id === ticket.assigneUserId)?.nom}`
                    : "Utilisateur inconnu"
                : "Non assigné"}
            </p>
          </div>
        </div>
      </div>

      {/* Section Pièces Jointes */}
      <div className="bg-card p-6 rounded-lg border mb-6">
        <h2 className="text-lg font-semibold mb-4">
          Pièces jointes ({attachments.length})
        </h2>
        {attachments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune pièce jointe
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {attachment.mimeType.startsWith("image/") ? (
                      <div className="text-blue-500">🖼️</div>
                    ) : attachment.mimeType === "application/pdf" ? (
                      <div className="text-red-500">📄</div>
                    ) : (
                      <div className="text-gray-500">📎</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(attachment.sizeBytes / 1024).toFixed(1)} KB
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(attachment.createdAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug info */}
      <div className="bg-muted p-4 rounded-lg text-xs">
        <p>
          <strong>Posture:</strong> {posture}
        </p>
        <p>
          <strong>Permissions:</strong>{" "}
          {JSON.stringify(permissions, null, 2)}
        </p>
        <p>
          <strong>Statuts disponibles:</strong> {availableStatuts.join(", ")}
        </p>
      </div>
    </div>
  );
}
