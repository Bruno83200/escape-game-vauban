// js/enigmes/zone1.js — Zone I : Le Front Saint-Étienne

import { UI } from "../ui.js";
import { gameData, getState, setBusy } from "../engine/state.js";
import { playSound } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import { ajouterObjet, enregistrerIndice } from "../engine/inventory.js";
import { runHotspotPuzzle, runGraphiteRubbingPuzzle } from "../minigames/workbench.js";

export function enigmeBlason() {
  if (getState().isBusy) return;

  runHotspotPuzzle({
    kicker: "Zone I · Héraldique de la Cité",
    title: "Les Quatre Blasons du Pont Dormant",
    instruction: "Quatre armoiries sont sculptées au-dessus de la herse. Cliquez directement sur le blason qui représente l'allégeance historique de la cité impériale de Besançon.",
    hint: "Besançon était ville libre impériale : son blason d'or porte un aigle noir tenant deux colonnes rouges.",
    image: "assets/images/items/blasons_indice.webp",
    hotspots: [
      {
        label: "L'Aigle Impérial",
        left: "2%", top: "2%", width: "47%", height: "47%",
        correct: true,
        successText: "L'aigle noir aux deux colonnes : le blason de Besançon s'enclenche !"
      },
      {
        label: "Les Fleurs de Lys",
        left: "51%", top: "2%", width: "47%", height: "47%",
        correct: false,
        errorText: "Les trois fleurs de lys représentent le Royaume de France, mais pas l'emblème impérial propre à la cité."
      },
      {
        label: "Le Lion Comtois",
        left: "2%", top: "51%", width: "47%", height: "47%",
        correct: false,
        errorText: "Le lion d'or est l'emblème de la Franche-Comté, mais la cité impériale possède ses propres armes."
      },
      {
        label: "La Croix de Bourgogne",
        left: "51%", top: "51%", width: "47%", height: "47%",
        correct: false,
        errorText: "La croix de Saint-André rappelle la Bourgogne. Cherchez l'oiseau impérial de Besançon."
      }
    ],
    onSuccess: () => {
      setBusy(true);
      playSound("succes");
      setTimeout(() => {
        playSound("herse_ouverture");
        UI.message(
          "Le blason de Besançon s'enclenche parfaitement dans la pierre. Dans un fracas métallique, la herse du Pont Dormant s'élève !",
          () => {
            setBusy(false);
            changeScene("pont_ouvert");
          },
          null,
          { kicker: "Passage Libéré", title: "La Herse s'Élève" }
        );
      }, 650);
    }
  });
}

export async function lireArchives() {
  playSound("bruit_frottement_papier");
  await enregistrerIndice("archives_chronologie");
  UI.message(
    "Vos notes indiquent : « La muraille fut gravée par les ingénieurs royaux l'année où Besançon devint française à l'issue du siège de Louis XIV ! »",
    null,
    "assets/images/items/archives_item.webp",
    { kicker: "Archives Consignées", title: "Chronologie de la Citadelle" }
  );
}

export async function ramasserFrottis() {
  if (getState().isBusy) return;
  setBusy(true);
  await ajouterObjet("Frottis");
  playSound("bruit_frottement_papier");
  UI.showItem(
    "Frottis de graphite",
    "Vous avez trouvé un bâton de graphite et un chiffon de lin : de quoi révéler les inscriptions gravées dans la pierre.",
    "assets/images/items/frottis_item.webp",
    () => { setBusy(false); }
  );
}

export function utiliserFrottis() {
  if (getState().isBusy) return;

  const inventaire = gameData.userData.inventory || [];
  if (!inventaire.includes("Frottis")) {
    playSound("erreur");
    UI.message(
      "Vos doigts sentent bien une gravure sous la mousse, mais vous n'avez rien pour la faire apparaître. Fouillez d'abord les décombres au pied du mur.",
      null,
      null,
      { kicker: "Instrument Manquant", title: "Gravure Illisible" }
    );
    return;
  }

  runGraphiteRubbingPuzzle({
    onSuccess: () => {
      setBusy(true);
      playSound("succes");
      UI.message(
        "Le code 1674 est exact ! Un pan de pierre pivote et dévoile un escalier dérobé vers les remparts.",
        () => {
          setBusy(false);
          changeScene("courtine_devoilee");
        },
        null,
        { kicker: "Courtine Déverrouillée", title: "1674 — Conquête Royale" }
      );
    }
  });
}

export function choisirGuerite() {
  if (getState().isBusy) return;

  runHotspotPuzzle({
    kicker: "Zone I · Poste d'Observation",
    title: "Les Trois Guérites des Remparts",
    instruction: "Inspectez la vue à travers l'embrasure de chaque guérite (A, B ou C). Cliquez sur celle qui surveille directement le cours du Doubs.",
    hint: "Regardez attentivement au centre de la meurtrière de la guérite de droite : on y distingue le ruban bleu de la rivière.",
    image: "assets/images/items/guetteur_indice.webp",
    wide: true,
    hotspots: [
      {
        label: "Guérite A",
        left: "0%", top: "0%", width: "33%", height: "100%",
        correct: false,
        errorText: "La guérite A surveille les toits de la ville de Besançon. Observez les autres embrasures."
      },
      {
        label: "Guérite B",
        left: "33.5%", top: "0%", width: "33%", height: "100%",
        correct: false,
        errorText: "La guérite B fait face aux collines boisées. Cherchez le cours d'eau du Doubs."
      },
      {
        label: "Guérite C",
        left: "67%", top: "0%", width: "33%", height: "100%",
        correct: true,
        successText: "Bien vu ! La guérite C plonge directement sur la boucle du Doubs."
      }
    ],
    onSuccess: () => {
      setBusy(true);
      playSound("succes");
      setTimeout(async () => {
        playSound("clic_serrure");
        await ajouterObjet("Clé de la Porte de Garde");
        UI.showItem(
          "Clé de la Porte de Garde",
          "Dissimulée dans l'anfractuosité de la guérite C ! Félicitations, vous achevez la Zone I — Le Front Saint-Étienne.",
          "assets/images/items/cle_garde_item.webp",
          () => {
            UI.message(
              "Vous franchissez la porte de garde et quittez le Front Saint-Étienne pour vous engager sur les hauts remparts de Vauban…",
              () => {
                setBusy(false);
                changeScene("vauban_statue");
              },
              null,
              { kicker: "Zone I Achevée", title: "En Route vers les Remparts" }
            );
          }
        );
      }, 600);
    }
  });
}
