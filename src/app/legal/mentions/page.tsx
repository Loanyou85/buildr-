import { SUPPORT_EMAIL } from '@/lib/guarantee';

export const metadata = { title: 'Mentions légales — Nexteo' };

/**
 * Les informations propres à l'éditeur sont laissées entre crochets : elles
 * dépendent de l'immatriculation réelle, et on n'invente pas l'identité d'une
 * entreprise.
 */
export default function MentionsPage() {
  return (
    <>
      <h1>Mentions légales</h1>

      <h2>Éditeur</h2>
      <p>
        [Raison sociale], [forme juridique] au capital de [montant], immatriculée au RCS de [ville]
        sous le numéro [SIREN]. Siège social : [adresse complète]. Numéro de TVA intracommunautaire :
        [numéro].
      </p>
      <p>Directeur de la publication : [prénom et nom].</p>
      <p>
        Contact : <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis. Les
        données personnelles sont stockées dans une base hébergée dans l’Union européenne.
      </p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus du site — parcours, prompts, textes — sont la propriété de l’éditeur. Ce que tu
        construis en suivant le parcours t’appartient : le code, le produit, les clients et le nom de
        domaine sont sur tes comptes et le restent si tu arrêtes ton abonnement.
      </p>

      <h2>Absence de garantie de résultat</h2>
      <p>
        Nexteo fournit une méthode, des prompts et des modèles. Il ne promet ni revenu, ni client, ni
        résultat. Les chiffres présentés sur la page d’accueil sont des résultats personnels du
        fondateur et ne constituent en aucun cas une moyenne ni une promesse.
      </p>
    </>
  );
}
