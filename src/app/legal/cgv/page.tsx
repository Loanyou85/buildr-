import { OFFERS, formatPrice } from '@/lib/offers';
import { GUARANTEE_DAYS, SUPPORT_EMAIL } from '@/lib/guarantee';

export const metadata = { title: 'Conditions générales de vente — Nexteo' };

export default function CgvPage() {
  return (
    <>
      <h1>Conditions générales de vente</h1>
      <p>En vigueur au [date de mise en ligne]. Éditeur : [raison sociale], [SIREN].</p>

      <h2>Ce qui est vendu</h2>
      <p>
        Un accès par abonnement à un service en ligne : un parcours de construction en treize phases,
        un pack de prompts généré pour l’idée de l’abonné, des prompts de réparation, un générateur
        de prompts à la demande et un générateur de scripts vidéo, selon l’offre souscrite.
      </p>

      <h2>Les offres et leurs prix</h2>
      <ul>
        {OFFERS.map((offre) => (
          <li key={offre.plan}>
            <strong className="text-white">{offre.name}</strong> — {formatPrice(offre.price)} par
            mois, toutes taxes comprises. {offre.tagline}
          </li>
        ))}
      </ul>
      <p>
        Une offre gratuite donne accès au diagnostic, aux trois idées et aux deux premières phases du
        parcours. Elle ne donne lieu à aucun paiement.
      </p>

      <h2>Durée et résiliation</h2>
      <p>
        L’abonnement est mensuel, sans engagement, reconduit tacitement chaque mois. Il peut être
        résilié à tout moment, sans motif et sans frais, depuis l’espace « Mon compte ». La
        résiliation prend effet à la fin de la période en cours : l’accès reste ouvert jusque-là.
      </p>

      <h2>Droit de rétractation</h2>
      <p>
        Le consommateur dispose d’un délai de quatorze jours pour se rétracter, sauf s’il a demandé
        l’exécution immédiate du service et reconnu perdre ce droit une fois le service pleinement
        exécuté (articles L221-18 et L221-28 du code de la consommation). Pour exercer ce droit, il
        suffit d’écrire à <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>

      <h2>Garantie commerciale</h2>
      <p>
        Une garantie commerciale de {GUARANTEE_DAYS} jours s’applique aux offres payantes, dans les
        conditions détaillées sur la page « La garantie ». Elle s’ajoute aux garanties légales et ne
        s’y substitue pas.
      </p>

      <h2>Paiement</h2>
      <p>
        Les paiements sont traités par Stripe. Aucune donnée de carte bancaire ne transite par nos
        serveurs ni n’y est conservée. Les factures sont accessibles depuis le portail client.
      </p>

      <h2>Absence de garantie de résultat</h2>
      <p>
        Le service fournit une méthode et des outils. Il ne garantit aucun revenu, aucun client et
        aucun résultat commercial.
      </p>

      <h2>Litiges</h2>
      <p>
        En cas de litige, une solution amiable sera recherchée en priorité. À défaut, le consommateur
        peut recourir gratuitement au médiateur de la consommation [nom et coordonnées du médiateur],
        ou à la plateforme européenne de règlement en ligne des litiges. Le droit applicable est le
        droit français.
      </p>
    </>
  );
}
