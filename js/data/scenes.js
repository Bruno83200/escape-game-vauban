// js/data/scenes.js — Scénario complet en 4 Zones (Citadelle de Besançon)

export const ZONES = [
  { id: 1, roman: "I", name: "Front Saint-Étienne", desc: "Pont Dormant, Grande Courtine et Guérites des Remparts" },
  { id: 2, roman: "II", name: "Remparts & Galerie 110", desc: "Statue de Vauban, Miroirs optiques, Calcul de courtine et Poste Morse" },
  { id: 3, roman: "III", name: "Le Cœur Souterrain", desc: "Magasin à poudre, Grand Puits de 117 m et Citernes hydrauliques" },
  { id: 4, roman: "IV", name: "Le Front Royal", desc: "Traité de défense, Alignement solaire et Secret du Lys Noir" }
];

// Métadonnées visuelles pour les objets du sac d'explorateur
export const ITEM_CATALOG = {
  "Frottis": {
    title: "Frottis de graphite",
    image: "assets/images/items/frottis_item.webp",
    description: "Un bâton de graphite et un chiffon de lin destinés à relever les inscriptions gravées dans la pierre."
  },
  "Clé de la Porte de Garde": {
    title: "Clé de la Porte de Garde",
    image: "assets/images/items/cle_garde_item.webp",
    description: "L'ancienne clé forgée dissimulée par une sentinelle dans la guérite dominant le cours du Doubs."
  },
  "Lentille de verre": {
    title: "Lentille de Vauban",
    image: "assets/images/items/lentille_indice.webp",
    description: "Une loupe de précision sertie de laiton, capable de lire les plans fins comme de concentrer les rayons du soleil."
  }
};

// Archives & relevés consignables dans le Carnet d'Architecte
export const CLUE_CATALOG = {
  archives_chronologie: {
    title: "Chronologie de Besançon",
    image: "assets/images/items/archives_item.webp",
    text: "1674 : Conquête de la ville par Louis XIV. 1678 : Traité de Nimègue, la Franche-Comté devient française."
  },
  inscription_latine: {
    title: "Inscription de la Galerie 110",
    image: "assets/images/items/inscription_latine.webp",
    text: "« LUX IN TENEBRIS » — La lumière dans les ténèbres, révélée par le jeu des trois miroirs pivotants."
  },
  guerite_reine: {
    title: "Briques de la Guérite de la Reine",
    image: "assets/images/items/guerite_indices.webp",
    text: "Trois dates gravées dans la brique rouge : 10 · 08 · 1678 — la signature du traité de Nimègue."
  }
};

export const SCENE_ORDER = [
  "pont_dormant", "pont_ouvert", "courtine_saint_etienne", "courtine_devoilee", "remparts_vue",
  "vauban_statue", "galerie_entree", "galerie_eclairee", "courtine_calcul", "chemin_ronde", "etape_morse", "entree_zone3",
  "magasin_poudre", "poudriere_ok", "grand_puits_roue", "puits_eau_trouvee", "etape_eau_saumatre", "zone3_terminee",
  "traite_defense", "alignement_solaire", "front_secours", "victoire", "hall_of_fame"
];

export const scenes = {
  "pont_dormant": {
    zone: 1,
    step: 1,
    title: "Le Pont Dormant",
    text: "La herse du Pont Dormant est verrouillée. Un mécanisme ancien semble bloquer l'accès. Au-dessus de la porte, une inscription de Vauban dit : « Seul l'emblème de la cité impériale libérera le passage ».",
    hint: "Besançon était ville libre impériale : ses armoiries arborent un aigle noir tenant deux colonnes rouges sur fond d'or.",
    image: "assets/images/scenes/pont_bloque.webp",
    ambience: "ambiance_vent_citadelle",
    choices: [
      { text: "Examiner les blasons", action: "enigmeBlason", icon: "shield", primary: true }
    ]
  },
  "pont_ouvert": {
    zone: 1,
    step: 2,
    title: "Accès au Front Saint-Étienne",
    text: "Dans un grondement de chaînes, la herse s'est levée. L'entrée du Front Saint-Étienne est enfin libre.",
    image: "assets/images/scenes/pont_ouvert.webp",
    ambience: "ambiance_vent_citadelle",
    choices: [
      { text: "S'avancer vers la courtine", next: "courtine_saint_etienne", icon: "arrow", primary: true }
    ]
  },
  "courtine_saint_etienne": {
    zone: 1,
    step: 3,
    title: "La Courtine Saint-Étienne",
    text: "Vous êtes devant la grande courtine. Des griffures semblent cacher un secret. Vos archives pourraient peut-être vous éclairer sur l'histoire de ce mur.",
    hint: "Fouillez d'abord les décombres pour récupérer le bâton de graphite (Frottis), puis frottez la pierre du mur pour dévoiler la date gravée.",
    image: "assets/images/scenes/courtine_bloquee.webp",
    ambience: "ambiance_vent_citadelle",
    choices: [
      { text: "Consulter les Archives", action: "lireArchives", icon: "scroll" },
      { text: "Fouiller les décombres", action: "ramasserFrottis", icon: "search" },
      { text: "Analyser le mur", action: "utiliserFrottis", icon: "compass", primary: true }
    ]
  },
  "courtine_devoilee": {
    zone: 1,
    step: 4,
    title: "L'Escalier Dérobé",
    text: "Le frottis a révélé le nombre « 1674 » gravé dans la pierre. C'est la date de la conquête de la ville par Louis XIV. Un panneau s'est déverrouillé sur le côté.",
    image: "assets/images/scenes/courtine_resolue.webp",
    ambience: "ambiance_vent_citadelle",
    choices: [
      { text: "Monter sur les remparts", next: "remparts_vue", icon: "arrow", primary: true }
    ]
  },
  "remparts_vue": {
    zone: 1,
    step: 5,
    title: "Les Guérites du Doubs",
    text: "Du haut des remparts, la vue sur le Doubs est vertigineuse. Pour continuer, vous devez trouver la clé de la porte de garde, cachée par une ancienne sentinelle.",
    hint: "Regardez attentivement à travers la meurtrière de chaque guérite : une seule laisse apparaître le ruban bleu du Doubs.",
    image: "assets/images/scenes/guetteur_vue.webp",
    ambience: "ambiance_vent_citadelle",
    choices: [
      { text: "Observer les guérites", action: "choisirGuerite", icon: "eye", primary: true }
    ]
  },
  "vauban_statue": {
    zone: 2,
    step: 6,
    title: "La Statue de Vauban",
    text: "Vous arrivez face à la statue de bronze de Vauban. Il semble scruter l'horizon, un plan à la main. Un détail attire votre attention sur son compas.",
    hint: "Deux nombres à deux chiffres sont gravés sur les branches du compas de bronze : la latitude et la longitude de Besançon.",
    image: "assets/images/scenes/vauban_statue.webp",
    ambience: "ambiance_remparts_vent",
    choices: [
      { text: "Examiner le plan de près", action: "enigmeVauban", icon: "compass", primary: true }
    ]
  },
  "galerie_entree": {
    zone: 2,
    step: 7,
    title: "La Galerie 110",
    text: "Vous pénétrez dans la galerie 110. L'obscurité est presque totale. Un mince filet de lumière tombe du plafond sur un système de miroirs pivotants.",
    hint: "Suivez le trajet du rayon lumineux d'un miroir à l'autre : le premier renvoie vers la droite (D), le second vers la gauche (G), le dernier tout droit au centre (C).",
    image: "assets/images/scenes/galerie_sombre.webp",
    ambience: "ambiance_galerie",
    choices: [
      { text: "Orienter les miroirs", action: "enigmeMiroirs", icon: "sun", primary: true }
    ]
  },
  "galerie_eclairee": {
    zone: 2,
    step: 8,
    title: "Galerie 110 — Éclairée",
    text: "Le faisceau de lumière traverse enfin toute la galerie et frappe le mur du fond, révélant une mystérieuse inscription latine.",
    image: "assets/images/scenes/galerie_sombre.webp",
    ambience: "ambiance_galerie",
    choices: [
      { text: "Lire l'inscription", action: "revelerLatin", icon: "scroll" },
      { text: "Continuer vers les courtines", next: "courtine_calcul", icon: "arrow", primary: true }
    ]
  },
  "courtine_calcul": {
    zone: 2,
    step: 9,
    title: "Le Coffre d'Artillerie",
    text: "Vous arrivez sur une section massive des remparts. Un coffre d'artillerie abandonné semble verrouillé par un code numérique. Un schéma technique est cloué sur une caisse à côté.",
    hint: "Multipliez les trois dimensions cotées sur le plan de Vauban : Longueur (10 m) × Hauteur (8 m) × Largeur (5,5 m).",
    image: "assets/images/scenes/courtine_calcul.webp",
    ambience: "ambiance_remparts_vent",
    choices: [
      { text: "Étudier le schéma", action: "enigmeVolume", icon: "ruler", primary: true }
    ]
  },
  "chemin_ronde": {
    zone: 2,
    step: 10,
    title: "Le Chemin de Ronde",
    text: "Le coffre s'est ouvert, révélant de vieux parchemins de défense. Vous pouvez désormais continuer votre progression sur le chemin de ronde vers la cour intérieure.",
    image: "assets/images/scenes/courtine_calcul.webp",
    ambience: "ambiance_remparts_vent",
    choices: [
      { text: "S'avancer sur le chemin de ronde", next: "etape_morse", icon: "arrow", primary: true }
    ]
  },
  "etape_morse": {
    zone: 2,
    step: 11,
    title: "Le Poste de la Résistance",
    text: "Près d'une plaque commémorative, un ancien poste radio grésille. Un signal en morse se répète inlassablement. Il semble être la clé pour ouvrir la grille vers la cour intérieure.",
    hint: "Le signal transmet un mot de 7 lettres, idéal suprême de la Résistance française, commençant par L (·−··) et I (··).",
    image: "assets/images/scenes/remparts_resistance.webp",
    ambience: "ambiance_remparts_vent",
    choices: [
      { text: "Écouter le signal", action: "enigmeMorse", icon: "radio", primary: true }
    ]
  },
  "entree_zone3": {
    zone: 2,
    step: 12,
    title: "Grille de la Cour Centrale",
    text: "Le mot « LIBERTÉ » a déverrouillé la grille électronique. Vous descendez les marches vers la cour centrale. L'air devient plus frais, vous approchez des magasins à poudre.",
    image: "assets/images/scenes/remparts_resistance.webp",
    ambience: "ambiance_remparts_vent",
    choices: [
      { text: "Pénétrer dans la cour intérieure", next: "magasin_poudre", icon: "arrow", primary: true }
    ]
  },
  "magasin_poudre": {
    zone: 3,
    step: 13,
    title: "Le Magasin à Poudre",
    text: "L'air est chargé d'une odeur de soufre. Des barils de poudre sont empilés jusqu'au plafond. Sur une table, plusieurs objets ont été confisqués aux ouvriers pour éviter les accidents.",
    hint: "Sous un choc contre la pierre, seul le fer produit des étincelles capables d'enflammer la poudre noire — contrairement au bronze, au cuir et au bois.",
    image: "assets/images/scenes/magasin_poudre.webp",
    ambience: "ambiance_poudriere",
    choices: [
      { text: "Examiner les objets", action: "enigmePoudriere", icon: "search", primary: true }
    ]
  },
  "poudriere_ok": {
    zone: 3,
    step: 14,
    title: "Porte de Bronze Déverrouillée",
    text: "En écartant l'objet en fer, vous avez débloqué le loquet de sécurité de la porte en bronze. Vous pouvez descendre plus profondément vers le Grand Puits.",
    image: "assets/images/scenes/magasin_poudre.webp",
    ambience: "ambiance_poudriere",
    choices: [
      { text: "Aller vers le Grand Puits", next: "grand_puits_roue", icon: "arrow", primary: true }
    ]
  },
  "grand_puits_roue": {
    zone: 3,
    step: 15,
    title: "Le Grand Puits (117 m)",
    text: "Le Grand Puits s'enfonce dans les entrailles du rocher sur 117 mètres. Une immense roue à écureuil de 4 mètres de diamètre permettait de remonter l'eau. Le mécanisme semble encore fonctionnel.",
    hint: "Un tour de roue de diamètre 4 m enroule environ π × 4 ≈ 12,57 m de corde. Divisez 117 par 12,57 et arrondissez à l'entier le plus proche.",
    image: "assets/images/scenes/grand_puits_roue.webp",
    ambience: "ambiance_grand_puits",
    choices: [
      { text: "Actionner la roue", action: "enigmeGrandPuits", icon: "gear", primary: true }
    ]
  },
  "puits_eau_trouvee": {
    zone: 3,
    step: 16,
    title: "Eau des Profondeurs",
    text: "Après un long effort, le seau remonte enfin à la surface. L'eau est trouble, mais le contrepoids nécessaire pour la suite est prêt.",
    image: "assets/images/scenes/grand_puits_roue.webp",
    ambience: "ambiance_grand_puits",
    choices: [
      { text: "Examiner l'eau", next: "etape_eau_saumatre", icon: "arrow", primary: true }
    ]
  },
  "etape_eau_saumatre": {
    zone: 3,
    step: 17,
    title: "Les Citernes Hydrauliques",
    text: "Le mécanisme hydraulique est bloqué. La citerne de 10 L est pleine, mais pour équilibrer le contrepoids, elle ne doit contenir que 7 L. Vous avez un seau de 3 L à disposition.",
    hint: "Ouvrez simplement la vanne pour remplir le seau de 3 L depuis la citerne de 10 L : il restera exactement 7 L dans la citerne.",
    image: "assets/images/scenes/citerne_valves.webp",
    ambience: "ambiance_citernes",
    choices: [
      { text: "Ouvrir les valves", action: "enigmeValves", icon: "droplet", primary: true }
    ]
  },
  "zone3_terminee": {
    zone: 3,
    step: 18,
    title: "Passage vers la Lumière",
    text: "L'eau se répartit parfaitement. Dans un sifflement hydraulique, la porte massive du fond pivote. Vous voyez enfin la lumière du jour : le Front Royal vous attend pour l'ultime épreuve.",
    image: "assets/images/scenes/citerne_valves.webp",
    ambience: "ambiance_citernes",
    choices: [
      { text: "Monter vers le Front Royal", next: "traite_defense", icon: "arrow", primary: true }
    ]
  },
  "traite_defense": {
    zone: 4,
    step: 19,
    title: "Le Traité de Défense",
    text: "Le Front Royal s'offre à vous. Sur un pupitre de pierre, un exemplaire du traité de défense de Vauban a été déchiré. Les morceaux semblent contenir un mot clé pour orienter les canons.",
    hint: "Assemblez les trois fragments déchirés (ARTI · LLE · RIE) pour former le corps d'armée dédié aux canons.",
    image: "assets/images/scenes/front_royal_final.webp",
    ambience: "ambiance_final",
    choices: [
      { text: "Reconstituer la page", action: "enigmeTraite", icon: "scroll", primary: true }
    ]
  },
  "alignement_solaire": {
    zone: 4,
    step: 20,
    title: "L'Alignement Solaire",
    text: "Une dernière herse bloque l'accès au Front de Secours. La corde qui la retient est hors de portée, mais le soleil de midi frappe directement le bastion. Si seulement vous aviez un moyen de concentrer cette chaleur…",
    hint: "Cherchez d'abord la Lentille de Vauban dans la guérite, puis utilisez-la pour focaliser le rayon solaire sur le point lumineux de la corde.",
    image: "assets/images/scenes/alignement_solaire.webp",
    ambience: "ambiance_final",
    choices: [
      { text: "Chercher dans la guérite", action: "ramasserLentille", icon: "search" },
      { text: "Utiliser la lentille sur la corde", action: "enigmeSolaire", icon: "sun", primary: true }
    ]
  },
  "front_secours": {
    zone: 4,
    step: 21,
    title: "Le Front de Secours",
    text: "La trappe du Front de Secours est verrouillée par un mécanisme à 8 chiffres. Une inscription sur le métal indique : « Le jour où la Citadelle devint française ». Cherchez dans les recoins de la guérite royale.",
    hint: "Inspectez d'abord la Guérite de la Reine pour relever la date gravée dans la brique (JJMMAAAA : 10081678).",
    image: "assets/images/scenes/front_royal_final.webp",
    ambience: "ambiance_final",
    choices: [
      { text: "Inspecter la Guérite de la Reine", action: "voirIndicesGuerite", icon: "eye" },
      { text: "Saisir le code de sortie", action: "enigmeFinale", icon: "key", primary: true }
    ]
  },
  "victoire": {
    zone: 4,
    step: 22,
    title: "Le Secret Préservé",
    text: "La porte s'ouvre sur la liberté ! Vous avez préservé le Secret du Lys Noir. Votre nom mérite d'entrer dans l'Histoire de la Citadelle.",
    image: "assets/images/scenes/victoire_finale.webp",
    ambience: "fanfare_victoire",
    choices: [
      { text: "S'inscrire au Tableau d'Honneur", action: "enregistrerVictoire", icon: "award", primary: true }
    ]
  },
  "hall_of_fame": {
    zone: 4,
    step: 23,
    title: "Tableau d'Honneur",
    text: "Voici les explorateurs qui, comme vous, ont bravé les mystères de Vauban et préservé le Secret du Lys Noir.",
    image: "assets/images/scenes/victoire_finale.webp",
    ambience: "fanfare_victoire",
    choices: [
      { text: "Consulter le Tableau d'Honneur", action: "enregistrerVictoire", icon: "scroll" },
      { text: "Rejouer", action: "demandeRejouer", icon: "arrow", primary: true }
    ]
  }
};
