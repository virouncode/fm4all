export const logosFournisseursMapping = [
  { fournisseurId: 1, url: "/img/logos-fournisseurs/logo_desautel.png" },
  { fournisseurId: 2, url: "/img/logos-fournisseurs/logo_ecoclean.png" },
  { fournisseurId: 3, url: "/img/logos-fournisseurs/logo_braam.png" },
  { fournisseurId: 4, url: "/img/logos-fournisseurs/logo_quartier_frais.png" },
  { fournisseurId: 5, url: "/img/logos-fournisseurs/logo_delicorner.png" },
  { fournisseurId: 6, url: "/img/logos-fournisseurs/logo_refruiting.png" },
  { fournisseurId: 7, url: "/img/logos-fournisseurs/logo_brita.png" },
  { fournisseurId: 8, url: "/img/logos-fournisseurs/logo_armada.png" },
  { fournisseurId: 9, url: "/img/logos-fournisseurs/logo_esp.png" },
  { fournisseurId: 10, url: "/img/logos-fournisseurs/logo_eseis.png" },
  { fournisseurId: 11, url: "/img/logos-fournisseurs/logo_ems.png" },
  { fournisseurId: 12, url: "/img/logos-fournisseurs/logo_epch.png" },
  { fournisseurId: 13, url: "/img/logos-fournisseurs/logo_castalie.png" },
];

export const getLogoFournisseurUrl = (fournisseurId: number) => {
  return logosFournisseursMapping.find(
    (logo) => logo.fournisseurId === fournisseurId
  )?.url;
};
