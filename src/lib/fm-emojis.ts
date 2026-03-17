export type FmEmojiCategory = {
  label: string;
  emojis: string[];
};

export const FM_EMOJI_CATEGORIES: FmEmojiCategory[] = [
  {
    label: "Nettoyage",
    emojis: [
      "🧹", // balai
      "🧽", // éponge
      "🪣", // seau
      "🧼", // savon
      "🫧", // mousse / désinfectant
      "🧴", // produit nettoyant
      "🧻", // papier essuie-tout
      "🗑️", // vider les corbeilles
      "🚽", // sanitaires / toilettes
      "🪟", // nettoyage de vitres
      "🪞", // nettoyage de miroirs
      "🚿", // rinçage / sanitaires
      "💦", // eau / rinçage
      "🚪", // portes / poignées
      "🪠", // débouchoir / canalisation bouchée
      "✨", // résultat propre
    ],
  },
  {
    label: "Maintenance",
    emojis: [
      "🔧", // clé plate / réglage
      "🪛", // tournevis
      "🔨", // marteau
      "⚙️", // mécanique / engrenage
      "🔩", // visserie / boulonnerie
      "🧰", // boîte à outils
      "🪜", // échelle / travail en hauteur
      "🔌", // électricité / prise
      "💡", // ampoule / éclairage
      "🔋", // batterie / alimentation secours
      "🔦", // torche / inspection
      "💧", // plomberie / fuite
      "🌡️", // température / chauffage
      "❄️", // climatisation / PAC
      "🌬️", // VMC / ventilation
      "🛗", // ascenseur
      "🏗️", // gros travaux
      "🛢️", // lubrification / huile
      "🔑", // serrure / accès
      "🔎", // inspection / vérification
      "📐", // mesure / calage
      "🪚", // scie / découpe
      "⛽", // carburant / groupe électrogène
    ],
  },
  {
    label: "Sécurité incendie",
    emojis: [
      "🔥", // incendie
      "🧯", // extincteur
      "🚨", // alarme
      "⚠️", // avertissement / signalisation
      "🛑", // arrêt d'urgence
      "🔔", // détecteur / sonnerie
      "🚪", // sortie de secours
      "🪜", // échelle d'évacuation
      "📢", // diffusion alerte / PA
      "💨", // fumée / détecteur de fumée
      "🏃", // évacuation
      "🗺️", // plan d'évacuation
      "🧱", // porte coupe-feu
      "📋", // registre de sécurité
      "✅", // vérification conforme
      "❌", // non-conforme
      "📸", // photo / preuve de contrôle
      "💡", // balisage lumineux de sécurité
      "🚒", // intervention pompiers
    ],
  },
  {
    label: "Café & Boissons",
    emojis: [
      "☕", // café
      "🫖", // théière
      "🍵", // thé / infusion
      "🥤", // boisson froide
      "🧃", // jus de fruit
      "🥛", // lait
      "🧋", // boisson spéciale
      "🍫", // chocolat chaud
      "🍪", // biscuit
      "🥐", // viennoiserie
      "🍎", // fruit frais
      "🥜", // snack / noix
      "🫙", // bocal / stock produits
      "📦", // réapprovisionnement
      "🧊", // boisson fraîche / glace
      "🔧", // maintenance machine à café
      "🧼", // nettoyage machine
      "🗓️", // planning maintenance / livraison
    ],
  },
  {
    label: "Fontaines & Eau",
    emojis: [
      "💧", // eau
      "🚰", // eau potable / robinet
      "🫙", // bonbonne / réservoir
      "❄️", // eau froide / réfrigérée
      "🧊", // glace / eau fraîche
      "💦", // jets d'eau
      "📦", // livraison bonbonnes
      "🗓️", // planning remplissage
      "🔧", // maintenance fontaine
      "🌊", // eau fraîche / débit
      "🧽", // nettoyage / entretien
      "♻️", // bonbonne recyclée
      "✅", // vérification qualité eau
    ],
  },
  {
    label: "Travaux & Rénovation",
    emojis: [
      "🏗️", // chantier / gros œuvre
      "🧱", // maçonnerie
      "🪨", // matériaux / béton
      "🪵", // bois / menuiserie
      "🔨", // démolition / frappe
      "⛏️", // pioche / démolition
      "🪚", // scie / découpe
      "🪛", // vissage / fixation
      "🔩", // fixation / boulonnerie
      "🪜", // travail en hauteur
      "📦", // matériaux / livraison
      "🎨", // peinture
      "🖌️", // peinture / finition
      "🪣", // pot de peinture
      "🛠️", // outillage général
      "🏢", // bâtiment professionnel
      "📐", // tracé / mesure
      "🔌", // câblage électrique
    ],
  },
  {
    label: "Espaces verts",
    emojis: [
      "🌱", // semis / plantation
      "🌿", // plante / verdure
      "🍀", // gazon / pelouse
      "🌳", // arbre
      "🌲", // conifère / haie
      "🪴", // plante en pot / intérieur
      "🌺", // massif fleuri
      "🌻", // fleur / décoration extérieure
      "🌼", // pelouse fleurie
      "💐", // arrangement floral
      "🍃", // taille / élagage
      "🍂", // ramassage feuilles mortes
      "🍁", // entretien saisonnier
      "✂️", // taille / tonte
      "🌾", // fauchage / herbes hautes
      "🌵", // plante robuste / extérieur sec
      "💦", // arrosage
      "🌞", // saison / ensoleillement
      "🏡", // jardin / espace extérieur
    ],
  },
  {
    label: "Office Management",
    emojis: [
      "📋", // formulaire / checklist
      "📁", // classement / dossier
      "🗂️", // archivage
      "📊", // reporting / tableau de bord
      "📈", // suivi de performance
      "📝", // note / compte-rendu
      "✏️", // annotation
      "📌", // point important
      "📎", // document joint
      "🖥️", // poste de travail
      "⌨️", // informatique
      "🖨️", // impression / copie
      "📱", // application mobile
      "☎️", // téléphone fixe
      "📧", // email / communication
      "🗓️", // agenda / planification
      "⏰", // horaires / délais
      "📬", // courrier entrant
      "📦", // fournitures / commande
      "🤝", // contrat / partenaire
    ],
  },
  {
    label: "Accueil & Réception",
    emojis: [
      "🤝", // accueil / poignée de main
      "👋", // bonjour
      "🏢", // hall d'entrée
      "🚪", // porte d'entrée
      "🛋️", // salon d'attente
      "🪑", // chaise / assise
      "🗝️", // accès / badge
      "📬", // courrier
      "🧳", // visiteur / voyageur
      "🪪", // badge / carte d'accès
      "📋", // registre des visites
      "🖊️", // signature
      "👔", // tenue professionnelle
      "🌐", // accueil international
      "🛎️", // sonnette / appel
      "📸", // photo badge
      "🗺️", // plan / orientation
      "☎️", // standard téléphonique
    ],
  },
  {
    label: "Sécurité & Accès",
    emojis: [
      "🔒", // verrouillé / sécurisé
      "🔓", // déverrouillé / accès autorisé
      "🔐", // accès sécurisé
      "🛡️", // protection
      "👮", // agent de sécurité
      "📹", // vidéosurveillance
      "🪪", // badge / carte
      "🗝️", // clé / pass
      "🔑", // clé / accès
      "🚧", // zone restreinte
      "⛔", // accès refusé
      "🚫", // interdit
      "⚠️", // avertissement
      "🟢", // accès autorisé
      "🔴", // accès interdit / danger
      "🏃", // ronde / patrouille
      "🕵️", // surveillance discrète
      "🌙", // sécurité nocturne
    ],
  },
  {
    label: "Énergie & Environnement",
    emojis: [
      "⚡", // électricité
      "🔋", // stockage énergie
      "🔌", // branchement
      "💡", // éclairage LED / économie
      "☀️", // solaire / énergie renouvelable
      "🌬️", // vent / ventilation
      "♻️", // recyclage / tri sélectif
      "🌡️", // température / chauffage
      "🌿", // environnement / bio
      "🌎", // impact planétaire
      "🏭", // consommation industrielle
      "💨", // ventilation / air
      "🔆", // luminosité / éclairage
      "🌱", // économie verte
      "🗑️", // déchets / tri sélectif
    ],
  },
  {
    label: "Logistique",
    emojis: [
      "📦", // colis / livraison
      "🚚", // camion livraison
      "🏭", // entrepôt / stockage
      "📬", // réception courrier
      "📥", // entrée marchandise
      "📤", // sortie marchandise
      "🚛", // poids lourd
      "📊", // inventaire / gestion stock
      "🗓️", // planning livraison
      "🔖", // étiquette
      "🏷️", // tag / label
      "⏰", // ponctualité / horaires
      "🗃️", // rangement / classement
      "📋", // bon de livraison
      "🔍", // contrôle qualité
      "♻️", // retour / reverse logistique
      "🤝", // partenaire / prestataire
    ],
  },
  {
    label: "Hygiène & Santé",
    emojis: [
      "🧼", // lavage des mains
      "🫧", // désinfection
      "🚿", // rinçage / hygiène
      "💊", // médicament / trousse de secours
      "🩺", // visite médicale
      "🩹", // premiers secours / pansement
      "🏥", // urgences / infirmerie
      "🧴", // gel hydroalcoolique
      "🌡️", // fièvre / température
      "🧤", // gants / EPI
      "😷", // masque / protection
      "🧪", // analyse / test sanitaire
      "✅", // protocole respecté
      "♿", // accessibilité / PMR
      "🗑️", // déchets sanitaires / DASRI
      "💧", // eau potable / hydratation
      "🌿", // produits naturels / bio
      "❤️", // bien-être / santé au travail
      "🔬", // contrôle microbiologique
    ],
  },
  {
    label: "Général",
    emojis: [
      "✅", // fait / validé
      "❌", // non-conforme / refusé
      "⭐", // priorité
      "🎯", // objectif / cible
      "🔔", // alerte / notification
      "📢", // communication
      "⏰", // délai / horaire
      "🗓️", // planning
      "🔄", // récurrent / renouvellement
      "📌", // point de contrôle
      "🏁", // terminé
      "👍", // approuvé
      "💪", // énergie / efficacité
      "🏆", // excellence
      "📸", // photo / preuve
      "📝", // note / commentaire
      "🔍", // vérification / audit
      "⚡", // urgent / prioritaire
      "🔧", // en cours de traitement
      "📞", // contact / appel
    ],
  },
];
