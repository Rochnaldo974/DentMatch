/**
 * Identité du produit — centralisée pour pouvoir renommer facilement.
 */
export const APP_NAME = "DentMatch";
export const APP_TAGLINE = "Trouvez le bon remplaçant, au bon moment.";
export const APP_DESCRIPTION =
  `${APP_NAME} met en relation les cabinets dentaires et les chirurgiens-dentistes ` +
  "remplaçants vérifiés, partout en France et dans les territoires d'outre-mer.";

export const CONTACT_EMAIL = "contact@dentmatch.example";

/** Mention réglementaire affichée dans les zones appropriées du produit. */
export const LEGAL_DISCLAIMER =
  `${APP_NAME} est une plateforme de mise en relation. Elle ne remplace pas les ` +
  "démarches réglementaires, ordinales, contractuelles, sociales ou assurantielles " +
  "nécessaires à la réalisation d'un remplacement.";

/** Mention affichée en mode démonstration. */
export const DEMO_DISCLAIMER =
  "Vous utilisez une version MVP. Les vérifications et documents simulés servent " +
  "uniquement à tester le parcours.";

/** Mention affichée à proximité des listes de documents. */
export const DOCUMENTS_DISCLAIMER =
  "La liste exacte des pièces peut varier selon votre statut, votre conseil " +
  `départemental et le type de remplacement. ${APP_NAME} ne remplace pas la ` +
  "validation des organismes compétents.";

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const DEMO_ACCOUNTS = {
  cabinet: { email: "demo.cabinet@dentmatch.example", password: "DemoCabinet2026!" },
  remplacant: { email: "demo.remplacant@dentmatch.example", password: "DemoRemplacant2026!" },
} as const;

/** Limites de téléversement. */
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 Mo
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_MESSAGE_LENGTH = 2000;

/** Buckets Supabase Storage. */
export const PUBLIC_MEDIA_BUCKET = "public-media";
export const PRIVATE_DOCUMENTS_BUCKET = "private-documents";
