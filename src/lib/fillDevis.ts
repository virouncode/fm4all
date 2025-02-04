import { batiments } from "@/constants/batiments";
import { occupations } from "@/constants/occupations";
import { InsertClientType } from "@/zod-schemas/client";
import { PDFDocument, PDFTextField } from "pdf-lib";
import { formatNumber } from "./formatNumber";
import { sanitizeText } from "./sanitizeText";

export const fillDevis = async (
  // url: string,
  numeroDevis: string,
  dateEmission: string,
  nomEmetteur: string,
  client: InsertClientType,
  totalAnnuelHT: number,
  totalInstallationHT: number
) => {
  try {
    // const formUrl = url;
    // Fetch the PDF form
    const formPdfBytes = await fetch("/pdf/fm4all_devis_template.pdf").then(
      (res) => res.arrayBuffer()
    );
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const form = pdfDoc.getForm();

    const totalAnnuelHtText = formatNumber(totalAnnuelHT);
    const totalMensuelHtText = formatNumber(totalAnnuelHT / 12);
    const tvaText = formatNumber(0.2 * totalAnnuelHT);
    const totalInstallationHtText = formatNumber(totalInstallationHT);
    const totalAnnuelTtcText = formatNumber(totalAnnuelHT * 1.2);
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
      { fieldName: "siret_client", value: client.siret ?? "" },
      { fieldName: "signataire_client", value: signataireClient },
      { fieldName: "poste_signataire_client", value: posteSignataireClient },
      { fieldName: "email_signataire_client", value: emailSignataireClient },
      { fieldName: "phone_signataire_client", value: client.phoneContact },
      { fieldName: "effectif_client", value: client.effectif.toString() },
      {
        fieldName: "typeOccupation_client",
        value:
          occupations.find(({ id }) => id === client.typeOccupation)
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
      { fieldName: "total_annuel_ttc", value: totalAnnuelTtcText },
    ];

    // Loop through the text fields and populate
    for (const data of textFieldsDatas) {
      const field = form.getFieldMaybe(data.fieldName);
      if (field && field instanceof PDFTextField) {
        field.setText(sanitizeText(data.value));
      }
    }
    form.flatten();
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
