import { batiments } from "@/constants/batiments";
import { MARGE, TVA } from "@/constants/constants";
import { occupation } from "@/constants/occupation";
import { toast } from "@/hooks/use-toast";
import { InsertClientType } from "@/zod-schemas/client";
import html2canvas from "html2canvas";
import { PDFDocument, PDFTextField, RotationTypes } from "pdf-lib";
import { formatNumber } from "./formatNumber";
import { formatSIRET } from "./isValideSIRET";
import { sanitizeText } from "./sanitizeText";

export const fillDevis = async (
  // url: string,
  numeroDevis: string,
  dateEmission: string,
  nomEmetteur: string,
  client: InsertClientType,
  totalAnnuelHT: number | null,
  totalInstallationHT: number | null,
  commentaires: string | null,
  dateDemarrage: string | null
) => {
  try {
    const formPdfBytes = await fetch("/pdf/fm4all_devis_template_NEW.pdf").then(
      (res) => res.arrayBuffer()
    );
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();

    const totalAnnuelHtText = formatNumber(totalAnnuelHT ?? 0);
    const totalMensuelHtText = formatNumber((totalAnnuelHT ?? 0) / 12);
    const tvaText = formatNumber(0.2 * (totalAnnuelHT ?? 0));
    const totalInstallationHtText = formatNumber(
      (totalInstallationHT ?? 0) * MARGE
    );
    const totalInstallationTtcText = formatNumber(
      (totalInstallationHT ?? 0) * MARGE * TVA
    );
    const totalAnnuelTtcText = formatNumber((totalAnnuelHT ?? 0) * TVA);
    const adresseClient =
      [client.adresseLigne1, client.adresseLigne2].filter(Boolean).join(" ") +
      " " +
      client.codePostal +
      " " +
      client.ville;
    const signataireClient =
      client.prenomSignataire && client.nomSignataire
        ? client.prenomSignataire + " " + client.nomSignataire
        : client.prenomContact + " " + client.nomContact;
    const posteSignataireClient = client.posteSignataire
      ? client.posteSignataire
      : client.posteContact;
    const emailSignataireClient = client.emailSignataire
      ? client.emailSignataire
      : client.emailContact;

    const textFieldsDatas = [
      {
        fieldName: "numero_devis",
        value: numeroDevis,
      },
      { fieldName: "date_emission", value: dateEmission },
      { fieldName: "nom_emetteur", value: nomEmetteur },
      { fieldName: "nom_entreprise", value: client.nomEntreprise },
      { fieldName: "adresse_client", value: adresseClient },
      {
        fieldName: "siret_client",
        value: client.siret ? formatSIRET(client.siret) : "",
      },
      { fieldName: "signataire_client", value: signataireClient },
      { fieldName: "poste_signataire_client", value: posteSignataireClient },
      { fieldName: "email_signataire_client", value: emailSignataireClient },
      { fieldName: "phone_signataire_client", value: client.phoneContact },
      { fieldName: "effectif_client", value: client.effectif.toString() },
      {
        fieldName: "typeOccupation_client",
        value:
          occupation.find(({ id }) => id === client.typeOccupation)
            ?.description ?? "",
      },
      {
        fieldName: "typeBatiment_client",
        value:
          batiments.find(({ id }) => id === client.typeBatiment)?.description ??
          "",
      },
      { fieldName: "total_annuel_ht", value: totalAnnuelHtText },
      { fieldName: "total_mensuel_ht", value: totalMensuelHtText },
      { fieldName: "tva", value: tvaText },
      { fieldName: "total_installation_ht", value: totalInstallationHtText },
      { fieldName: "total_installation_ttc", value: totalInstallationTtcText },
      { fieldName: "total_annuel_ttc", value: totalAnnuelTtcText },
      { fieldName: "commentaires", value: commentaires ?? "" },
      { fieldName: "date_demarrage", value: dateDemarrage ?? "" },
    ];

    // Loop through the text fields and populate
    for (const data of textFieldsDatas) {
      const field = form.getFieldMaybe(data.fieldName);
      if (field && field instanceof PDFTextField) {
        field.setText(sanitizeText(data.value));
      }
    }
    form.flatten();

    //SYNTHESE
    try {
      const LIMIT_HEIGHT = 800;
      const totalSummary = document.getElementById("total-summary");
      const sections = Array.from(
        document.querySelectorAll(".total-section")
      ) as HTMLElement[];
      const sectionsHeights = sections.map(
        (section) => section.getBoundingClientRect().height
      );

      let sum = 120; // Padding top + en-tête + gap
      let currentGroup: HTMLElement[] = [];
      const groupedSections: HTMLElement[][] = [];

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionHeight = sectionsHeights[i];

        if (sum + sectionHeight + 16 > LIMIT_HEIGHT) {
          // Si on dépasse la limite, on stocke le groupe actuel et on en commence un nouveau
          groupedSections.push(currentGroup);
          currentGroup = []; // Nouveau tableau
          sum = 0;
        }

        currentGroup.push(section);
        sum += sectionHeight + 16;
      }

      // Ajouter le dernier groupe s'il reste des sections
      if (currentGroup.length > 0) {
        groupedSections.push(currentGroup);
      }
      for (let index = 0; index < groupedSections.length; index++) {
        const group = groupedSections[index];
        const wrapper = document.createElement("div");
        wrapper.classList.add(
          "flex",
          "flex-col",
          "gap-4",
          "w-[18cm]",
          "mx-auto",
          "p-4",
          "border",
          "rounded-xl"
        );
        if (index === 0) {
          const totalSummaryClone = totalSummary?.cloneNode(
            true
          ) as HTMLElement;
          totalSummaryClone.style.marginBottom = "16px";
          wrapper.appendChild(totalSummaryClone);
        }
        group.forEach((section) => {
          wrapper.appendChild(section.cloneNode(true));
        });
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(wrapper, { useCORS: true, scale: 2 });
        const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
        const pdfPage = pdfDoc.getPage(index + 1);
        const image = await pdfDoc.embedJpg(dataUrl);
        pdfPage.drawImage(image, {
          x: 125,
          y: pdfPage.getHeight() - image.height / 4 - 150,
          width: image.width / 4,
          height: image.height / 4,
        });
        document.body.removeChild(wrapper);
      }
      if (groupedSections.length < 3) {
        const nbEmptyPages = 3 - groupedSections.length;
        for (let i = 0; i < nbEmptyPages; i++) {
          const pdfPage = pdfDoc.getPage(groupedSections.length + i + 1);
          pdfPage.drawText("Fin de la synthèse", {
            x: pdfPage.getWidth() / 2 - 50,
            y: pdfPage.getHeight() / 2,
            size: 24,
            rotate: { angle: 45, type: RotationTypes.Degrees },
          });
        }
      }
    } catch (err) {
      if (err instanceof Error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description:
            "Impossible d'intégrer la synthèse dans le devis : " + err.message,
        });
      console.log(err);
    }

    //DETAILS
    try {
      const LIMIT_HEIGHT = 1800;
      const sections = Array.from(
        document.querySelectorAll(".detail-section")
      ) as HTMLElement[];
      const sectionsHeights = sections.map(
        (section) => section.getBoundingClientRect().height
      );
      let sum = 0; // Padding top + en-tête + gap
      let currentGroup: HTMLElement[] = [];
      const groupedSections: HTMLElement[][] = [];

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionHeight = sectionsHeights[i];

        if (sum + sectionHeight + 16 > LIMIT_HEIGHT) {
          //  Si on dépasse la limite, on stocke le groupe actuel et on en commence un nouveau
          groupedSections.push(currentGroup);
          currentGroup = []; // Nouveau tableau
          sum = 0;
        }

        currentGroup.push(section);
        sum += sectionHeight + 16;
      }

      // Ajouter le dernier groupe s'il reste des sections
      if (currentGroup.length > 0) {
        groupedSections.push(currentGroup);
      }
      for (let index = 0; index < groupedSections.length; index++) {
        const group = groupedSections[index];
        const wrapper = document.createElement("div");
        wrapper.classList.add(
          "flex",
          "flex-col",
          "gap-4",
          "w-[1360px]",
          "mx-auto",
          "p-4",
          "border",
          "rounded-xl"
        );
        group.forEach((section) => {
          wrapper.appendChild(section.cloneNode(true));
        });
        document.body.appendChild(wrapper);

        const canvas = await html2canvas(wrapper, { useCORS: true, scale: 2 });
        const dataUrl = canvas.toDataURL("image/jpeg", 1.0);
        const pdfPage = pdfDoc.getPage(index + 5);
        const image = await pdfDoc.embedJpg(dataUrl);
        pdfPage.drawImage(image, {
          x: 70,
          y: pdfPage.getHeight() - image.height / 6 - 150,
          width: image.width / 6,
          height: image.height / 6,
        });
        document.body.removeChild(wrapper);
      }
      if (groupedSections.length < 3) {
        const nbEmptyPages = 3 - groupedSections.length;
        for (let i = 0; i < nbEmptyPages; i++) {
          const pdfPage = pdfDoc.getPage(groupedSections.length + i + 5);
          pdfPage.drawText("Fin de l'Annexe 1", {
            x: pdfPage.getWidth() / 2 - 50,
            y: pdfPage.getHeight() / 2,
            size: 24,
            rotate: { angle: 45, type: RotationTypes.Degrees },
          });
        }
      }
    } catch (err) {
      if (err instanceof Error)
        toast({
          variant: "destructive",
          title: "Erreur",
          description:
            "Impossible d'intégrer le détail des prestations dans le devis : " +
            err.message,
        });
      console.log(err);
    }

    // Save and return the PDF
    const pdfBytes = await pdfDoc.save();

    const docUrl = URL.createObjectURL(
      new Blob([pdfBytes], { type: "application/pdf" })
    );
    return docUrl;
  } catch (error) {
    console.error("Error processing PDF form: ", error);
    return null;
  }
};

export default fillDevis;
