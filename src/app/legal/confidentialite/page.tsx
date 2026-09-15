import { SUPPORT_EMAIL } from '@/lib/guarantee';
import { MIN_AGE, PUBLIC_SHARING_AGE } from '@/lib/guardrails';

export const metadata = { title: 'Politique de confidentialité — Nexteo' };

export default function ConfidentialitePage() {
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <p>
        Le diagnostic collecte des informations sur ton parcours professionnel, ton niveau d’études
        et ta situation financière. Voici exactement ce qu’on en fait.
      </p>

      <h2>Ce qu’on collecte</h2>
      <ul>
        <li>Ton prénom et ton adresse e-mail, pour ton compte.</li>
        <li>
          Tes réponses au diagnostic : âge par tranche, situation, secteurs connus, compétences,
          centres d’intérêt, temps disponible, budget, objectif de revenu, et tes réponses libres sur
          ce qui t’agace.
        </li>
        <li>Ta progression dans le parcours, tes idées, tes prompts et tes scripts.</li>
        <li>
          Un identifiant technique déposé en cookie si tu commences le diagnostic sans compte, pour
          retrouver tes réponses. Il est effacé dès que tu crées un compte.
        </li>
      </ul>

      <h2>Pourquoi</h2>
      <p>
        Uniquement pour faire fonctionner le service : classer les idées qui te correspondent,
        remplir tes prompts avec ton projet, et te permettre de reprendre où tu t’es arrêté. Aucune
        de ces données n’est vendue, ni utilisée à des fins publicitaires.
      </p>

      <h2>Ce qu’on ne fait pas</h2>
      <ul>
        <li>Aucun traceur publicitaire, aucun pixel de réseau social.</li>
        <li>Aucune revente, aucun partage à des fins commerciales.</li>
        <li>Aucune décision automatisée produisant un effet juridique à ton égard.</li>
      </ul>

      <h2>Sous-traitants</h2>
      <ul>
        <li>Vercel, pour l’hébergement du site.</li>
        <li>Une base de données hébergée dans l’Union européenne.</li>
        <li>
          Anthropic, pour la génération de texte. Tes réponses libres et la fiche de ton idée lui
          sont transmises au moment de la génération. Aucune clé ni donnée de paiement ne l’est.
        </li>
        <li>Stripe, pour les paiements. Resend, pour les e-mails.</li>
      </ul>

      <h2>Durée de conservation</h2>
      <p>
        Les données de ton compte sont conservées trente-six mois après ta dernière visite, puis
        supprimées. Un diagnostic anonyme non rattaché à un compte est conservé quatre-vingt-dix
        jours. Les factures sont conservées dix ans, comme la loi l’impose.
      </p>

      <h2>Tes droits</h2>
      <p>
        Tu peux à tout moment accéder à tes données, les rectifier, les exporter dans un format
        lisible, et les supprimer. Les deux dernières se font directement depuis « Mon compte », sans
        rien demander à personne. Pour le reste, écris à{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Tu peux aussi introduire une
        réclamation auprès de la CNIL.
      </p>

      <h2>Mineurs</h2>
      <p>
        L’ouverture d’un compte est réservée aux personnes d’au moins {MIN_AGE} ans. Entre {MIN_AGE}{' '}
        et {PUBLIC_SHARING_AGE} ans, le partage public d’un parcours et l’encaissement de paiements
        ne sont pas disponibles.
      </p>
    </>
  );
}
