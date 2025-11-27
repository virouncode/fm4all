// scripts/seedClientUserImpl.ts
import { auth } from "@/lib/auth";
import { sendEmailFromServer } from "@/lib/email/sendEmail";
import { generatePassword } from "@/lib/utils/generatePassword";

import { insertUserSchema, InsertUserType } from "@/zod-schemas/user";

// PLACEHOLDERS
const SEED_EMAIL = "viroun.gads@gmail.com";
const SEED_NAME = "Alice Dubois";
const SEED_PASSWORD_OVERRIDE = "Keryah250484@"; // ex "MotDePasseTest123!"
const SEED_CLIENT_ID = 1;
const SEED_ROLE: InsertUserType["role"] = "client";

export async function runSeedClientUser() {
  console.log("▶ Seed client user…");

  if (!SEED_EMAIL) {
    throw new Error("Veuillez remplir SEED_EMAIL dans seedClientUserImpl.ts");
  }
  const tempPassword =
    SEED_PASSWORD_OVERRIDE && SEED_PASSWORD_OVERRIDE.length > 0
      ? SEED_PASSWORD_OVERRIDE
      : generatePassword();

  const userInput: InsertUserType = {
    email: SEED_EMAIL,
    name: SEED_NAME,
    role: SEED_ROLE,
    clientId: SEED_CLIENT_ID,
    password: tempPassword,
    image: null,
    // complète ici selon insertUserSchema (locale, etc.)
  };

  const safeUserInput = insertUserSchema.parse(userInput);

  console.log(" - Email :", safeUserInput.email);
  console.log(" - ClientId :", safeUserInput.clientId);
  console.log(" - Role :", safeUserInput.role);
  console.log(
    " - Mot de passe :",
    SEED_PASSWORD_OVERRIDE ? "(override fourni)" : "(généré automatiquement)",
  );

  await auth.api.signUpEmail({
    body: { ...safeUserInput, password: tempPassword },
  });

  await sendEmailFromServer({
    to: safeUserInput.email,
    from: "noreply@mg.fm4all.com",
    subject: "Création de votre compte utilisateur",
    text: `<p>Votre compte utilisateur a été crée avec succès, bienvenue chez fm4all !</p><br/>
           <p>Voici mot de passe temporaire : ${tempPassword}</p><br/>
           <p>Nous vous conseillons de le changer dès votre première connexion dans votre espace.</p>
           <p>Pensez aussi à vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.</p>
          `,
    nomDestinataire: safeUserInput.name,
  });

  console.log("✅ User seed créé et email envoyé à", safeUserInput.email);
}
