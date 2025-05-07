import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFm4AllColor } from "@/lib/utils/getFm4AllColor";
import { GammeType } from "@/zod-schemas/gamme";
import React from "react";

// Types for our data structure
type FrequencyValue = number | string | null;

interface TaskRow {
  id: number;
  task: string;
  essentiel: {
    hebdomadaire: FrequencyValue;
    mensuelle: FrequencyValue;
    trimestrielle: FrequencyValue;
    semestrielle: FrequencyValue;
  };
  confort: {
    hebdomadaire: FrequencyValue;
    mensuelle: FrequencyValue;
    trimestrielle: FrequencyValue;
    semestrielle: FrequencyValue;
  };
  excellence: {
    hebdomadaire: FrequencyValue;
    mensuelle: FrequencyValue;
    trimestrielle: FrequencyValue;
    semestrielle: FrequencyValue;
  };
}

interface SectionData {
  title: string;
  rows: TaskRow[];
}

// Component for the CDC Nettoyage table
const CDCNettoyage = () => {
  // Data structure representing the table content
  const sections: SectionData[] = [
    {
      title: "Bureaux - Salle de Réunion - Accueil",
      rows: [
        {
          id: 1,
          task: "Aération des locaux",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 2,
          task: "Vidage des corbeilles à papier",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 3,
          task: "Dépoussiérage des meubles, objets meublants jusqu'à hauteur d'homme",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 4,
          task: "Dépoussiérage des bureaux dégagés de tous documents",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 5,
          task: "Dépoussiérage des plinthes",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 6,
          task: "Nettoyage des dessus d'armoire non encombrées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 7,
          task: "Essuyage de traces sur les portes, interrupteurs, cloisons vitrées, ...",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 8,
          task: "Dépoussiérage des sièges en tissu et piétements de chaises",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 9,
          task: "Dépoussiérage des rebords et des glissières de fenêtres accessibles",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 10,
          task: "Aspiration et lavage des sols",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 2,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 11,
          task: "Enlèvement des toiles d'araignées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 12,
          task: "Nettoyage traces de doigts vitrerie intérieure et des cloisons vitrées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
        },
      ],
    },
    {
      title: "Circulation",
      rows: [
        {
          id: 13,
          task: "Aération des locaux",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 14,
          task: "Essuyage de traces sur les portes, interrupteurs, cloisons, ...",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 2,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 15,
          task: "Aspiration et lavage du sol",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 3",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 16,
          task: "Dépoussiérage des plinthes et des radiateurs",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 17,
          task: "Enlèvement des toiles d'araignées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 18,
          task: "Nettoyage traces de doigts vitrerie intérieure et des cloisons vitrées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
        },
      ],
    },
    {
      title: "Sanitaires",
      rows: [
        {
          id: 19,
          task: "Vidage et désinfection des poubelles",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 20,
          task: "Nettoyage et désinfection des éléments sanitaires",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 21,
          task: "Mise en place des consommables sanitaires",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 22,
          task: "Aspiration, lavage et désinfection des sols",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 23,
          task: "Désinfection des poignées de portes et des plaques de portes",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 24,
          task: "Nettoyage et désinfection des robinetteries, faïences murales",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 2,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 25,
          task: "Nettoyage des miroirs et des distributeurs",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 2,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 26,
          task: "Dépoussiérage des plinthes",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 27,
          task: "Détartrage des éléments sanitaires",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 28,
          task: "Enlèvement des toiles d’araignées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
      ],
    },
    {
      title: " Salle de Repos / Espace thisanerie / Cafeteria",
      rows: [
        {
          id: 29,
          task: "Aération des locaux",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 30,
          task: "Vidage des poubelles",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 31,
          task: "Dépoussiérage des meubles, objets meublants jusqu’à hauteur d’homme",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 32,
          task: "Nettoyage et désinfection de l’évier, des robinetteries, faïences murales",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 33,
          task: "Désinfection des poignées de portes et des plaques de portes",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "?",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: "?",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 34,
          task: "Dépoussiérage des plinthes et radiateurs",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 35,
          task: "Essuyage de traces sur les portes, interrupteurs, cloisons vitrées,…",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 36,
          task: "Nettoyage et désinfection des réfrigérateurs",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 37,
          task: "Nettoyage des tables et des chaises",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 38,
          task: "Nettoyage de l’évier, micro onde et plaques chauffantes",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 39,
          task: "Détartrage de l’évier",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 40,
          task: "Dépoussiérage des rebords et des glissières de fenêtres accessibles",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 41,
          task: "Nettoyage traces de doigts vitrerie intérieure et des cloisons vitrées accessibles",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: 1,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 42,
          task: "Aspiration et lavage des sols",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 43,
          task: "Enlèvement des toiles d’araignées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
      ],
    },
    {
      title: "Vestiaire du personnel / Sociaux",
      rows: [
        {
          id: 44,
          task: "Vidage et désinfection des poubelles",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 3",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 45,
          task: "Aspiration, lavage et désinfection des sols",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 3",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },

        {
          id: 46,
          task: "Nettoyage et désinfection des éléments sanitaires",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 47,
          task: "Mise en place des consommables sanitaires",
          essentiel: {
            hebdomadaire: "1 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 5",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 48,
          task: "Aspiration, lavage et désinfection des sols",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: "2 à 3",
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 49,
          task: "Nettoyage et désinfection des robinetteries, faïences murales",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 2,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 50,
          task: "Nettoyage des miroirs",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 2,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 51,
          task: "Enlèvement des traces sur les portes de vestiaires",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 5,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 52,
          task: "Dépoussiérage des objets meublants et de décoration à hauteur d'homme",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 53,
          task: "Lavage des plinthes",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 54,
          task: "Détartrage des éléments sanitaires",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 55,
          task: "Dépoussiérage des dessus de meubles hauts",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 56,
          task: "Enlèvement des toiles d'araignées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: 1,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
      ],
    },
    {
      title: "Local technique et stocks",
      rows: [
        {
          id: 57,
          task: "Aspiration et lavage des sols",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 58,
          task: "Lavage des plinthes",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 59,
          task: "Enlèvement des toiles d'araignées",
          essentiel: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: null,
            mensuelle: 1,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: null,
            mensuelle: 2,
            trimestrielle: null,
            semestrielle: null,
          },
        },
      ],
    },
  ];

  const sectionsOptions: SectionData[] = [
    {
      title: "Option Repasse Sanitaire (disponible à partir de 5j/5)",
      rows: [
        {
          id: 60,
          task: "Bureaux - Salle de réunion - Accueil : Tournée de contrôle, aspiration",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 61,
          task: "Circulation : Tournée de contrôle, aspiration localisée, poubelles",
          essentiel: {
            hebdomadaire: null,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 62,
          task: "Sanitaires : Repasse selon besoin réappro, Poubelles, nettoyage WC",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 63,
          task: "Salle de Repos / Espace thisanerie / Cafeteria",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
        {
          id: 64,
          task: "Sociaux : Repasse selon besoin réappro, Poubelles, nettoyage WC",
          essentiel: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          confort: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
          excellence: {
            hebdomadaire: 1,
            mensuelle: null,
            trimestrielle: null,
            semestrielle: null,
          },
        },
      ],
    },
  ];

  // Notes for the table
  const notes = [
    {
      title: "Essentiel",
      description:
        "La fréquence hebdomadaire de nettoyage passe progressivement à 5j/5 lorsqu'on dépasse 690m²",
      permanence: "Permanence efficace",
    },
    {
      title: "Confort",
      description:
        "La fréquence hebdomadaire de nettoyage passe progressivement à 5j/5 lorsqu'on dépasse 390m²",
      permanence: "Permanence avec contrôle complet des zones sensibles",
    },
    {
      title: "Excellence",
      description:
        "Fréquence hebdomadaire de nettoyage de 5j/5. Option Permanence / Repasse sanitaire préconisée par défaut dès 200m²",
      permanence: "Permanence premium avec contrôle toutes zones",
    },
  ];

  return (
    <div
      className="overflow-x-auto rounded-lg border border-slate-200"
      id="cdc-nettoyage"
    >
      <div className="h-[calc(100vh-7rem)]">
        <Table className="border-collapse">
          <TableHeader className="sticky top-0 z-20 bg-white">
            <TableRow className="bg-white">
              <TableCell
                colSpan={13}
                className="p-0 sticky left-0 z-10
"
              >
                <div className="bg-fm4allsecondary text-white text-center p-4">
                  <h1 className="text-xl">Cahier des charges - Nettoyage</h1>
                  <p>Fréquences minimum de prestations par zone</p>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={13}
                className="text-center font-bold py-2 sticky left-0 z-10
"
              >
                Notes pour le chiffrage
              </TableCell>
            </TableRow>
            {notes.map((note, index) => (
              <TableRow key={`note-${index}`}>
                <TableCell
                  className={`w-80 sticky left-0 z-10
 text-right text-white font-bold bg-${getFm4AllColor(note.title.toLowerCase() as GammeType)}`}
                >
                  {note.title}
                </TableCell>
                <TableCell colSpan={12}>{note.description}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableHead
                className="bg-fm4allsecondary text-white sticky left-0 z-10
"
                rowSpan={2}
              ></TableHead>
              <TableHead
                colSpan={4}
                className="text-center bg-fm4allessential text-white w-8"
              >
                Gamme Essentiel
              </TableHead>
              <TableHead
                colSpan={4}
                className="text-center bg-fm4allcomfort text-white w-8"
              >
                Gamme Confort
              </TableHead>
              <TableHead
                colSpan={4}
                className="text-center bg-fm4allexcellence text-white w-8"
              >
                Gamme Excellence
              </TableHead>
            </TableRow>

            <TableRow>
              {/* Essentiel Headers */}
              <TableHead className="text-center bg-fm4allessential text-white h-28 w-14 p-0">
                <div className="-rotate-90">Hebdomadaire</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allessential text-white h-28 w-14 p-0">
                <div className="-rotate-90">Mensuelle</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allessential text-white h-28 w-14 p-0">
                <div className="-rotate-90">Trimestrielle</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allessential text-white h-28 w-14 p-0">
                <div className="-rotate-90">Semestrielle</div>
              </TableHead>
              {/* Confort Headers */}
              <TableHead className="text-center bg-fm4allcomfort text-white h-28 w-14 p-0">
                <div className="-rotate-90">Hebdomadaire</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allcomfort text-white h-28 w-14 p-0">
                <div className="-rotate-90">Mensuelle</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allcomfort text-white h-28 w-14 p-0">
                <div className="-rotate-90">Trimestrielle</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allcomfort text-white h-28 w-14 p-0">
                <div className="-rotate-90">Semestrielle</div>
              </TableHead>
              {/* Excellence Headers */}
              <TableHead className="text-center bg-fm4allexcellence text-white h-28 w-14 p-0">
                <div className="-rotate-90">Hebdomadaire</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allexcellence text-white h-28 w-14 p-0">
                <div className="-rotate-90">Mensuelle</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allexcellence text-white h-28 w-14 p-0">
                <div className="-rotate-90">Trimestrielle</div>
              </TableHead>
              <TableHead className="text-center bg-fm4allexcellence text-white h-28 w-14 p-0">
                <div className="-rotate-90">Semestrielle</div>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sections.map((section, sectionIndex) => (
              <React.Fragment key={`section-${sectionIndex}`}>
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="bg-fm4allsecondary text-white text-center font-bold py-2 sticky left-0 z-10 
"
                  >
                    {section.title}
                  </TableCell>
                </TableRow>

                {/* Section Rows */}
                {section.rows.map((row) => (
                  <TableRow key={`row-${row.id}`}>
                    <TableCell className="sticky left-0 z-10 bg-white">
                      {row.task}
                    </TableCell>

                    {/* Essentiel Cells */}
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.hebdomadaire}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.mensuelle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.trimestrielle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.semestrielle}
                    </TableCell>

                    {/* Confort Cells */}
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.hebdomadaire}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.mensuelle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.trimestrielle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.semestrielle}
                    </TableCell>

                    {/* Excellence Cells */}
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.hebdomadaire}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.mensuelle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.trimestrielle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.semestrielle}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}

            {sectionsOptions.map((section, sectionIndex) => (
              <React.Fragment key={`section-${sectionIndex}`}>
                {/* Section Header */}
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="bg-fm4allsecondary text-white text-center font-bold py-2 sticky left-0 z-10
"
                  >
                    {section.title}
                  </TableCell>
                </TableRow>
                {/* Permanence Notes */}
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="text-center font-bold py-2 sticky left-0 z-10
"
                  >
                    Notes pour le chiffrage
                  </TableCell>
                </TableRow>
                {notes.map((note, index) => (
                  <TableRow key={`permanence-${index}`}>
                    <TableCell
                      className={`text-right text-white sticky left-0 z-10 font-bold bg-${getFm4AllColor(note.title.toLowerCase() as GammeType)}`}
                    >
                      {note.title}
                    </TableCell>
                    <TableCell colSpan={12}>{note.permanence}</TableCell>
                  </TableRow>
                ))}

                {/* Section Rows */}
                {section.rows.map((row) => (
                  <TableRow key={`row-${row.id}`}>
                    <TableCell className="sticky left-0 z-10 bg-white">
                      {row.task}
                    </TableCell>

                    {/* Essentiel Cells */}
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.hebdomadaire}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.mensuelle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.trimestrielle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allessential/40">
                      {row.essentiel.semestrielle}
                    </TableCell>

                    {/* Confort Cells */}
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.hebdomadaire}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.mensuelle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.trimestrielle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allcomfort/40">
                      {row.confort.semestrielle}
                    </TableCell>

                    {/* Excellence Cells */}
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.hebdomadaire}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.mensuelle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.trimestrielle}
                    </TableCell>
                    <TableCell className="text-center bg-fm4allexcellence/40">
                      {row.excellence.semestrielle}
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CDCNettoyage;
