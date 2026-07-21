import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/landing/legal-page-layout";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Politique de confidentialité de la plateforme ${APP_NAME}.`,
};

export default function ConfidentialitePage() {
  return (
    <LegalPageLayout
      title="Politique de confidentialité"
      updatedAt="21 juillet 2026"
    >
      <p>
        Cette politique décrit comment {APP_NAME} collecte, utilise et protège
        vos données personnelles dans le cadre de la phase de test du MVP.
      </p>

      <h2>1. Données collectées</h2>
      <ul>
        <li>
          <strong>Données de compte</strong> : adresse e-mail, mot de passe
          (chiffré), rôle choisi (cabinet ou remplaçant) ;
        </li>
        <li>
          <strong>Données de profil</strong> : identité, coordonnées,
          spécialité, expérience, disponibilités, informations sur le cabinet ;
        </li>
        <li>
          <strong>Documents professionnels</strong> : justificatifs transmis
          volontairement pour la vérification du profil, stockés dans un espace
          privé ;
        </li>
        <li>
          <strong>Données d&apos;usage</strong> : annonces, candidatures,
          messages échangés sur la plateforme, notifications.
        </li>
      </ul>

      <h2>2. Finalités</h2>
      <ul>
        <li>Créer et gérer votre compte et votre profil ;</li>
        <li>Mettre en relation cabinets et remplaçants ;</li>
        <li>Vérifier les informations professionnelles déclarées ;</li>
        <li>Assurer la messagerie et les notifications du service ;</li>
        <li>Garantir la sécurité de la plateforme.</li>
      </ul>
      <p>
        Aucune donnée n&apos;est vendue ni transmise à des tiers à des fins
        commerciales.
      </p>

      <h2>3. Base légale</h2>
      <p>
        Les traitements reposent sur l&apos;exécution du service demandé lors de
        votre inscription, sur votre consentement pour la transmission des
        documents de vérification, et sur l&apos;intérêt légitime de {APP_NAME}
        {" "}pour la sécurité du service.
      </p>

      <h2>4. Durées de conservation</h2>
      <ul>
        <li>
          <strong>Données de compte et de profil</strong> : pendant la durée de
          vie du compte, puis suppression dans un délai de 30 jours après la
          suppression du compte ;
        </li>
        <li>
          <strong>Documents professionnels</strong> : pendant la durée de vie du
          compte, supprimés avec celui-ci ;
        </li>
        <li>
          <strong>Messages et candidatures</strong> : pendant la durée de vie
          des comptes concernés ;
        </li>
        <li>
          <strong>Phase de test</strong> : les données de démonstration peuvent
          être réinitialisées à tout moment.
        </li>
      </ul>

      <h2>5. Hébergement et sous-traitants</h2>
      <p>
        Les données sont hébergées par Supabase (base de données,
        authentification, stockage privé des documents) et Vercel
        (application). Ces prestataires agissent en qualité de sous-traitants.
      </p>

      <h2>6. Vos droits (RGPD)</h2>
      <p>
        Conformément au Règlement général sur la protection des données, vous
        disposez des droits suivants :
      </p>
      <ul>
        <li>droit d&apos;accès à vos données ;</li>
        <li>droit de rectification ;</li>
        <li>droit à l&apos;effacement (suppression de compte intégrée) ;</li>
        <li>droit à la portabilité (export de vos données intégré) ;</li>
        <li>droit d&apos;opposition et de limitation du traitement.</li>
      </ul>
      <p>
        Vous pouvez exercer ces droits directement depuis les paramètres de
        votre compte ou en écrivant à <strong>{CONTACT_EMAIL}</strong>. Vous
        disposez également du droit d&apos;introduire une réclamation auprès de
        la CNIL (cnil.fr).
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Les documents professionnels sont stockés dans un espace privé,
        inaccessible aux autres utilisateurs. Les accès sont contrôlés côté
        serveur selon le rôle de chaque compte, et les vérifications de profil
        sont historisées.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative à cette politique :{" "}
        <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalPageLayout>
  );
}
