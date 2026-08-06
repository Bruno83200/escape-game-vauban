// js/data/scenes.js

export const scenes = {
    "pont_dormant": {
        text: "La herse du Pont Dormant est verrouillée. Un mécanisme ancien semble bloquer l'accès. Au-dessus de la porte, une inscription de Vauban dit : 'Seul l'emblème de la cité impériale libérera le passage'.",
        image: "assets/images/scenes/pont_bloque.webp",
        ambience: "ambiance_vent_citadelle",
        choices: [
            { text: "Examiner les blasons", action: "enigmeBlason" }
        ]
    },
    "pont_ouvert": {
        text: "Dans un grondement de chaînes, la herse s'est levée. L'entrée du Front Saint-Étienne est enfin libre.",
        image: "assets/images/scenes/pont_ouvert.webp",
        ambience: "ambiance_vent_citadelle",
        choices: [ { text: "S'avancer vers la courtine", next: "courtine_saint_etienne" } ]
    },
    "courtine_saint_etienne": {
        text: "Vous êtes devant la grande courtine. Des griffures semblent cacher un secret. Vos archives pourraient peut-être vous éclairer sur l'histoire de ce mur.",
        image: "assets/images/scenes/courtine_bloquee.webp",
        ambience: "ambiance_vent_citadelle",
        choices: [
            { text: "Consulter les Archives", action: "lireArchives" }, // <--- NOUVEAU
            { text: "Fouiller les décombres", action: "ramasserFrottis" },
            { text: "Analyser le mur", action: "utiliserFrottis" }
        ]
    },
    "courtine_devoilee": {
        text: "Le frottis a révélé le nombre '1674' gravé dans la pierre. C'est la date de la conquête de la ville par Louis XIV. Un panneau s'est déverrouillé sur le côté.",
        image: "assets/images/scenes/courtine_resolue.webp",
        ambience: "ambiance_vent_citadelle",
        choices: [ { text: "Monter sur les remparts", next: "remparts_vue" } ]
    },
    "remparts_vue": {
        text: "Du haut des remparts, la vue sur le Doubs est vertigineuse. Pour continuer, vous devez trouver la clé de la porte de garde, cachée par une ancienne sentinelle.",
        image: "assets/images/scenes/guetteur_vue.webp",
        ambience: "ambiance_vent_citadelle",
        choices: [ { text: "Observer les guérites", action: "choisirGuerite" } ]
    },
    "vauban_statue": {
        text: "Vous arrivez face à la statue de bronze de Vauban. Il semble scruter l'horizon, un plan à la main. Un détail attire votre attention sur son compas.",
        image: "assets/images/scenes/vauban_statue.webp",
        ambience: "ambiance_remparts_vent",
        choices: [
            { text: "Examiner le plan de près", action: "enigmeVauban" }
        ]
    },
    "galerie_entree": {
        text: "Vous pénétrez dans la galerie 110. L'obscurité est presque totale. Un mince filet de lumière tombe du plafond sur un système de miroirs pivotants.",
        image: "assets/images/scenes/galerie_sombre.webp",
        ambience: "ambiance_galerie",
        choices: [
            { text: "Orienter les miroirs", action: "enigmeMiroirs" }
        ]
    },
    "galerie_eclairee": {
        text: "Le faisceau de lumière traverse enfin toute la galerie et frappe le mur du fond, révélant une mystérieuse inscription latine.",
        image: "assets/images/scenes/galerie_sombre.webp", // On garde le fond mais on affichera l'item éclairé
        ambience: "ambiance_galerie",
        choices: [
            { text: "Lire l'inscription", action: "revelerLatin" },
            { text: "Continuer vers les courtines", next: "courtine_calcul" }
        ]
    },
    "courtine_calcul": {
        text: "Vous arrivez sur une section massive des remparts. Un coffre d'artillerie abandonné semble verrouillé par un code numérique. Un schéma technique est cloué sur une caisse à côté.",
        image: "assets/images/scenes/courtine_calcul.webp",
        ambience: "ambiance_remparts_vent",
        choices: [
            { text: "Étudier le schéma", action: "enigmeVolume" }
        ]
    },
    "chemin_ronde": {
        text: "Le coffre s'est ouvert, révélant de vieux parchemins de défense. Vous pouvez désormais continuer votre progression sur le chemin de ronde vers la cour intérieure.",
        image: "assets/images/scenes/courtine_calcul.webp", 
        ambience: "ambiance_remparts_vent",
        choices: [
            { text: "S'avancer sur le chemin de ronde", next: "etape_morse" }
        ]
    },
    "etape_morse": {
        text: "Près d'une plaque commémorative, un ancien poste radio grésille. Un signal en morse se répète inlassablement. Il semble être la clé pour ouvrir la grille vers la cour intérieure.",
        image: "assets/images/scenes/remparts_resistance.webp",
        ambience: "ambiance_remparts_vent",
        choices: [
            { text: "Écouter le signal", action: "enigmeMorse" }
        ]
    },
    "entree_zone3": {
        text: "Le mot 'LIBERTÉ' a déverrouillé la grille électronique. Vous descendez les marches vers la cour centrale. L'air devient plus frais, vous approchez des magasins à poudre.",
        image: "assets/images/scenes/remparts_resistance.webp", 
        ambience: "ambiance_remparts_vent",
        choices: [
            { text: "Pénétrer dans la cour intérieure", next: "magasin_poudre" }
        ]
    },
    "magasin_poudre": {
        text: "L'air est chargé d'une odeur de soufre. Des barils de poudre sont empilés jusqu'au plafond. Sur une table, plusieurs objets ont été confisqués aux ouvriers pour éviter les accidents.",
        image: "assets/images/scenes/magasin_poudre.webp",
        ambience: "ambiance_poudriere",
        choices: [
            { text: "Examiner les objets", action: "enigmePoudriere" }
        ]
    },
    "poudriere_ok": {
        text: "En écartant l'objet en fer, vous avez débloqué le loquet de sécurité de la porte en bronze. Vous pouvez descendre plus profondément vers le Grand Puits.",
        image: "assets/images/scenes/magasin_poudre.webp",
        ambience: "ambiance_poudriere",
        choices: [
            { text: "Aller vers le Grand Puits", next: "grand_puits_roue" }
        ]
    },
    "grand_puits_roue": {
        text: "Le Grand Puits s'enfonce dans les entrailles du rocher sur 117 mètres. Une immense roue à écureuil de 4 mètres de diamètre permettait de remonter l'eau. Le mécanisme semble encore fonctionnel.",
        image: "assets/images/scenes/grand_puits_roue.webp",
        ambience: "ambiance_grand_puits",
        choices: [
            { text: "Actionner la roue", action: "enigmeGrandPuits" }
        ]
    },
    "puits_eau_trouvee": {
        text: "Après un long effort, le seau remonte enfin à la surface. L'eau est trouble, mais le contrepoids nécessaire pour la suite est prêt.",
        image: "assets/images/scenes/grand_puits_roue.webp",
        ambience: "ambiance_grand_puits",
        choices: [
            { text: "Examiner l'eau", next: "etape_eau_saumatre" }
        ]
    },
    "etape_eau_saumatre": {
        text: "Le mécanisme hydraulique est bloqué. La citerne de 10L est pleine, mais pour équilibrer le contrepoids, elle ne doit contenir que 7L. Vous avez un seau de 3L à disposition.",
        image: "assets/images/scenes/citerne_valves.webp",
        ambience: "ambiance_citernes",
        choices: [
            { text: "Ouvrir les valves", action: "enigmeValves" }
        ]
    },
    "zone3_terminee": {
        text: "L'eau se répartit parfaitement. Dans un sifflement hydraulique, la porte massive du fond pivote. Vous voyez enfin la lumière du jour : le Front Royal vous attend pour l'ultime épreuve.",
        image: "assets/images/scenes/citerne_valves.webp",
        ambience: "ambiance_citernes",
        choices: [
            { text: "Monter vers le Front Royal", next: "traite_defense" }
        ]
    },
    "traite_defense": {
        text: "Le Front Royal s'offre à vous. Sur un pupitre de pierre, un exemplaire du traité de défense de Vauban a été déchiré. Les morceaux semblent contenir un mot clé pour orienter les canons.",
        image: "assets/images/scenes/front_royal_final.webp",
        ambience: "ambiance_final",
        choices: [
            { text: "Reconstituer la page", action: "enigmeTraite" }
        ]
    },
    "alignement_solaire": {
        text: "Une dernière herse bloque l'accès au Front de Secours. La corde qui la retient est hors de portée, mais le soleil de midi frappe directement le bastion. Si seulement vous aviez un moyen de concentrer cette chaleur...",
        image: "assets/images/scenes/alignement_solaire.webp",
        ambience: "ambiance_final",
        choices: [
            { text: "Chercher dans la guérite", action: "ramasserLentille" },
            { text: "Utiliser la lentille sur la corde", action: "enigmeSolaire" }
        ]
    },
    "front_secours": {
        text: "La trappe du Front de Secours est verrouillée par un mécanisme à 8 chiffres. Une inscription sur le métal indique : 'Le jour où la Citadelle devint française'. Cherchez dans les recoins de la guérite royale.",
        image: "assets/images/scenes/front_royal_final.webp",
        ambience: "ambiance_final",
        choices: [
            { text: "Inspecter la Guérite de la Reine", action: "voirIndicesGuerite" }, // <--- Nouveau
            { text: "Saisir le code de sortie", action: "enigmeFinale" }
        ]
    },    
    "victoire": {
        text: "La porte s'ouvre sur la liberté ! Vous avez préservé le Secret du Lys Noir. Votre nom mérite d'entrer dans l'Histoire de la Citadelle.",
        image: "assets/images/scenes/victoire_finale.webp",
        ambience: "fanfare_victoire",
        choices: [
            { text: "S'inscrire au Tableau d'Honneur", action: "enregistrerVictoire" }
        ]
    },
    "hall_of_fame": {
        text: "Voici les explorateurs qui, comme vous, ont bravé les mystères de Vauban.",
        image: "assets/images/scenes/victoire_finale.webp",
        ambience: "fanfare_victoire",
        choices: [
            { text: "Rejouer", action: "demandeRejouer" } // <--- Changement ici
        ]
    },
};