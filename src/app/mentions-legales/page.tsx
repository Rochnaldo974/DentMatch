import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/landing/legal-page-layout";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales de la plateforme ${APP_NAME}.`,
};

export default function MentionsLegalesPage() {
  return (
    <LegalPageLayout title="Mentions légales" updatedAt="21 juillet 2026">
      <h2>1. Éditeur du site</h2>
      <p>
        Le présent site est édité par <strong>{APP_NAME} — projet MVP de
        démonstration</strong>, projet en phase de test sans exploitation
        commerciale. Il n&apos;est adossé, à ce stade, à aucune société
        immatriculée.
      </p>
      <p>
        Contact : <strong>{CONTACT_EMAIL}</strong>
      </p>

      <h2>2. Directeur de la publication</h2>
      <p>
        Le directeur de la publication est le porteur du projet {APP_NAME},
        joignable à l&apos;adresse de contact ci-dessus.
      </p>

      <h2>3. Hébergement</h2>
      <p>Le site et ses données sont hébergés par :</p>
      <ul>
        <li>
          <strong>Vercel Inc.</strong> — 440 N Barranca Avenue #4133, Covina, CA
          91723, États-Unis (hébergement de l&apos;application) ;
        </li>
        <li>
          <strong>Supabase Inc.</strong> — 970 Toa Payoh North #07-04, Singapour
          318992 (base de données, authentification et stockage des fichiers).
        </li>
      </ul>

      <h2>4. Nature du service</h2>
      <p>
        {APP_NAME} est une plateforme de mise en relation entre cabinets
        dentaires et chirurgiens-dentistes remplaçants. Elle ne fournit aucun
        soin, aucun conseil médical et ne se substitue à aucune démarche
        réglementaire, ordinale, contractuelle, sociale ou assurantielle liée à
        la réalisation d&apos;un remplacement.
      </p>

      <h2>5. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des éléments du site (marque, logo, textes, interface)
        est protégé par le droit de la propriété intellectuelle. Toute
        reproduction non autorisée est interdite.
      </p>

      <h2>6. Données personnelles</h2>
      <p>
        Les modalités de traitement des données personnelles sont détaillées
        dans la politique de confidentialité, accessible depuis le pied de page
        du site.
      </p>

      <h2>7. Signalement</h2>
      <p>
        Pour signaler un contenu illicite ou un problème sur la plateforme,
        écrivez à {CONTACT_EMAIL}.
      </p>
    </LegalPageLayout>
  );
}
