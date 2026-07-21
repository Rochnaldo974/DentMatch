import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/landing/legal-page-layout";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politique de cookies",
  description: `Politique d'utilisation des cookies de la plateforme ${APP_NAME}.`,
};

export default function CookiesPage() {
  return (
    <LegalPageLayout title="Politique de cookies" updatedAt="21 juillet 2026">
      <h2>1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p>
        Un cookie est un petit fichier déposé sur votre appareil lors de la
        consultation d&apos;un site. Il permet notamment de maintenir votre
        session ouverte de façon sécurisée.
      </p>

      <h2>2. Cookies utilisés par {APP_NAME}</h2>
      <p>
        {APP_NAME} utilise <strong>uniquement des cookies techniques
        d&apos;authentification</strong>, strictement nécessaires au
        fonctionnement du service :
      </p>
      <ul>
        <li>
          <strong>Cookies de session</strong> : ils maintiennent votre connexion
          sécurisée entre les pages et expirent automatiquement ;
        </li>
        <li>
          <strong>Cookies de renouvellement de session</strong> : ils permettent
          de prolonger votre session sans nouvelle saisie du mot de passe.
        </li>
      </ul>

      <h2>3. Ce que nous n&apos;utilisons pas</h2>
      <ul>
        <li>aucun cookie publicitaire ;</li>
        <li>aucun cookie de suivi ou de profilage ;</li>
        <li>aucun cookie déposé par des tiers à des fins commerciales.</li>
      </ul>

      <h2>4. Consentement</h2>
      <p>
        Les cookies strictement nécessaires au fonctionnement du service sont
        exemptés de consentement préalable. C&apos;est pourquoi aucune bannière
        de consentement n&apos;est affichée : nous ne déposons rien
        d&apos;autre.
      </p>

      <h2>5. Gestion des cookies</h2>
      <p>
        Vous pouvez configurer votre navigateur pour bloquer ou supprimer les
        cookies. La suppression des cookies techniques entraînera toutefois la
        déconnexion de votre compte et empêchera l&apos;accès aux espaces
        connectés.
      </p>

      <h2>6. Contact</h2>
      <p>
        Pour toute question relative à cette politique :{" "}
        <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalPageLayout>
  );
}
