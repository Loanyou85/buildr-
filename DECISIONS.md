# Décisions

Les choix que le cahier des charges laissait ouverts, et pourquoi ils ont été
tranchés comme ça.

## Produit

**Les trois offres sont Départ 7,99 €, Construction 18,99 € et Lancement
35,99 €.** Les prix viennent du fondateur. Le découpage suit les trois
promesses : Départ ouvre le parcours et le pack de prompts, Construction ajoute
le générateur illimité et l'assistance, Lancement ajoute les trente scripts et
le partage. L'offre gratuite n'est pas une quatrième carte : c'est ce que la
personne a déjà, rappelé sous les offres. Au moment de décider, un quatrième
choix n'aide personne.

**Le paywall est placé après la restitution des idées**, comme le demande la
section 13. La personne a reçu trois idées et leur justification avant qu'on lui
demande quoi que ce soit.

**Le diagnostic fait seize écrans.** Une question par écran, un seul geste par
écran, et les choix uniques envoient le formulaire directement — pas de bouton
« suivant » à chercher. Les seize tiennent en une dizaine de minutes, ce que la
section 17 fixe comme objectif.

**Les secteurs connus de l'intérieur arrivent en troisième question.** C'est la
dimension la plus discriminante du moteur : la poser tard, c'est risquer de la
poser à quelqu'un qui a déjà abandonné.

## Moteur d'idées

**Trente archétypes, pas une génération libre.** Un modèle qui invente une idée
à chaque appel ne peut pas être classé de façon reproductible, et rien ne
garantit que l'idée soit constructible avec le parcours. Le moteur classe des
archétypes réels contre un profil ; le modèle ne fait que rédiger l'explication.

**`problemAccess` pèse 0,24, `noCodeFeasibility` seulement 0,12.** Le parcours
existe précisément pour absorber la complexité de construction : un écran de
plus ne doit pas disqualifier une idée que l'utilisateur est le seul à pouvoir
vendre. Les poids vivent en base et se règlent sans déploiement.

**L'accès au problème se partage 55 / 45 entre le secteur connu et l'irritant
cité.** Une première version donnait 80 / 20 au secteur : trois archétypes du
même secteur devenaient interchangeables, et les six premiers résultats ne se
départageaient plus que sur des détails. Ce qui a vraiment réglé le problème,
ce n'est pas le poids, c'est d'avoir resserré les étiquettes : un archétype ne
porte que les irritants qu'il fait réellement disparaître, pas tout ce qui est
adjacent.

**Les trois profils de démonstration sont testés, pas seulement décrits.** La
section 15 dit que si les trois profils produisent des idées interchangeables,
le moteur est raté. C'est devenu un test : les trois listes de trois idées
doivent être disjointes, et l'idée de tête doit se détacher de la suivante.

## Moteur de prompts

**Le corps des quarante prompts est écrit à la main, en base.** Seules les
variables propres à l'idée passent par le modèle, validées par Zod. Un prompt
cassé casse le projet d'un utilisateur qui n'a aucun moyen de s'en rendre
compte.

**Les prompts référencés par une étape ne sont pas stockés dans l'étape.**
L'étape porte un slug de gabarit ; le moteur va chercher le prompt rempli dans
le pack. Sinon le même prompt existerait en deux exemplaires, et l'un des deux
finirait périmé.

**Vingt-sept motifs d'erreur pour quinze gabarits de réparation.** Plusieurs
motifs partagent un gabarit — un module introuvable et un conflit de versions se
réparent de la même façon. Ce qui compte, c'est de reconnaître le message que
l'utilisateur colle.

## Technique

**Le diagnostic anonyme est porté par un cookie, pas par une session.** Le
profil existe sans utilisateur, avec un `anonId`, et il est rattaché au compte à
l'inscription. Demander de créer un compte avant de répondre ferait perdre la
moitié des visiteurs.

**Au rattachement, un profil déjà présent sur le compte l'emporte sur
l'anonyme.** Écraser ce que la personne avait déjà répondu serait pire que de
perdre un diagnostic qu'elle vient de refaire.

**Les cases à cocher n'ont aucun état React.** L'apparence est pilotée en CSS
par l'état de la case native. Une version contrôlée ne dessinait la coche
qu'après l'hydratation, et un clic avant celle-ci était annulé : la case se
cochait puis se décochait toute seule.

**Les reveals au défilement sont écrits à la main avec un IntersectionObserver,
pas avec une bibliothèque d'animation.** La landing tient un budget de 200 Ko de
JavaScript ; la section 16 dit de choisir la vitesse contre la belle animation.
Environ un kilooctet ici, contre plusieurs dizaines. La landing est à 116 Ko.

**Le seed tient dans une transaction ouverte par un verrou consultatif, avec des
insertions par lots.** Sans le verrou, deux exécutions simultanées — un
déploiement lent que l'utilisateur relance — violent une contrainte d'unicité.
Sans les lots, plusieurs centaines de lignes dépassent le délai d'exécution.

**La migration vers ce schéma nettoie les anciennes valeurs d'offre avant de
changer l'énumération.** Sans ça, le transtypage échoue sur une base déjà semée
avec les anciennes offres, et le déploiement s'arrête au milieu.

**Le seed tourne pendant le build.** Le contenu — trente archétypes, treize
phases, quarante gabarits de prompts, vingt-sept motifs d'erreur — n'est pas
optionnel : sans lui le produit n'a rien à montrer. Le faire passer par une
page d'administration à déclencher à la main, c'est accepter qu'un déploiement
mette le site en ligne vide. Le garde d'idempotence rend les builds suivants
gratuits.

**Le webhook Stripe reste le seul endroit qui ouvre un accès payant.** Une
redirection de retour peut être fabriquée, une signature Stripe non.

## Ce qui n'a pas été fait

**Aucun faux chiffre sur la landing.** Les compteurs affichent le contenu du
produit — phases, étapes, prompts, scripts — lu en base au rendu. Le mur
d'aventures reste vide tant que personne n'a partagé, avec un état vide qui le
dit franchement.

**La capture Stripe n'est pas fabriquée.** `public/proof/placeholder.svg` dit
qu'il s'agit d'un visuel à remplacer. Le composant détecte au rendu si le
fondateur a déposé sa vraie capture. Une fausse capture crédible serait une
pratique commerciale trompeuse.

**Pas de Lenis.** Le défilement fluide était prévu pour la landing et désactivé
sur mobile ; comme la quasi-totalité du trafic est mobile, il ne servait qu'au
desktop pour un coût en JavaScript sur tout le monde. Le défilement natif reste
meilleur sur téléphone.
