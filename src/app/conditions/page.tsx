import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/landing/legal-page-layout";
import { APP_NAME, CONTACT_EMAIL, LEGAL_DISCLAIMER } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: `Conditions générales d'utilisation de la plateforme ${APP_NAME}.`,
};

export default function ConditionsPage() {
  return (
    <LegalPageLayout
      title="Conditions générales d'utilisation"
      updatedAt="21 juillet 2026"
    >
      <h2>1. Objet</h2>
      <p>
        Les présentes conditions encadrent l&apos;utilisation de {APP_NAME},
        plateforme de mise en relation entre cabinets dentaires et
        chirurgiens-dentistes remplaçants, en France métropolitaine et dans les
        territoires d&apos;outre-mer.
      </p>
      <p>{LEGAL_DISCLAIMER}</p>

      <h2>2. Phase de test gratuite</h2>
      <p>
        La plateforme est actuellement proposée en version MVP, à titre gratuit
        et expérimental. Les fonctionnalités peuvent évoluer, être suspendues
        ou réinitialisées sans préavis pendant cette phase. Aucune continuité de
        service n&apos;est garantie.
      </p>

      <h2>3. Comptes</h2>
      <ul>
        <li>
          L&apos;inscription est réservée aux cabinets dentaires et aux
          professionnels remplissant les conditions réglementaires de
          remplacement en chirurgie dentaire ;
        </li>
        <li>
          Chaque utilisateur s&apos;engage à fournir des informations exactes et
          à jour ;
        </li>
        <li>
          Les identifiants de connexion sont strictement personnels ; leur
          confidentialité relève de la responsabilité de l&apos;utilisateur.
        </li>
      </ul>

      <h2>4. Obligations des utilisateurs</h2>
      <ul>
        <li>
          Publier uniquement des annonces et candidatures sincères et licites ;
        </li>
        <li>
          Ne transmettre que des documents authentiques lors de la vérification
          de profil ;
        </li>
        <li>
          Respecter la confidentialité des échanges et des informations
          accessibles via la plateforme ;
        </li>
        <li>
          Accomplir, en dehors de la plateforme, l&apos;ensemble des démarches
          réglementaires, ordinales, contractuelles, sociales et assurantielles
          requises pour tout remplacement.
        </li>
      </ul>

      <h2>5. Vérification des profils</h2>
      <p>
        {APP_NAME} contrôle les informations professionnelles déclarées par les
        utilisateurs et attribue, le cas échéant, un badge « Profil vérifié par{" "}
        {APP_NAME} ». Cette vérification est interne au produit : elle ne
        constitue ni un agrément, ni une validation par un organisme officiel.
      </p>

      <h2>6. Responsabilité</h2>
      <p>
        {APP_NAME} intervient uniquement comme intermédiaire technique de mise
        en relation. La plateforme n&apos;est pas partie aux contrats de
        remplacement conclus entre utilisateurs et ne saurait être tenue
        responsable de leur exécution, de leur validité ou de leur conformité
        réglementaire. En phase de test, le service est fourni « en
        l&apos;état », sans garantie de disponibilité ni d&apos;exactitude.
      </p>

      <h2>7. Suspension et suppression</h2>
      <p>
        {APP_NAME} se réserve le droit de suspendre ou supprimer un compte ou un
        contenu en cas de manquement aux présentes conditions. Chaque
        utilisateur peut supprimer son compte à tout moment depuis ses
        paramètres.
      </p>

      <h2>8. Contact</h2>
      <p>
        Pour toute question relative aux présentes conditions :{" "}
        <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </LegalPageLayout>
  );
}
