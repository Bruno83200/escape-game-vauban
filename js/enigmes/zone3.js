// js/enigmes/zone3.js — Zone III : Le Cœur Souterrain

import { UI } from "../ui.js";
import { getState, setBusy } from "../engine/state.js";
import { playSound } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import {
  runHotspotPuzzle,
  runWellWinchPuzzle,
  runHydraulicValvesPuzzle
} from "../minigames/workbench.js";

// 1. LA POUDRIÈRE (Sélection directe sur les 4 objets confisqués -> FER)
export function enigmePoudriere() {
  if (getState().isBusy) return;

  runHotspotPuzzle({
    kicker: "Zone III · Consigne de Sécurité",
    title: "L'Établi du Magasin à Poudre",
    instruction: "L'un de ces quatre objets (Bronze, Cuir, Bois, Fer) est strictement banni des magasins à poudre car il peut provoquer une étincelle fatale. Cliquez sur l'objet interdit pour l'écarter.",
    hint: "Le bronze, le cuir et le bois sont autorisés dans les poudrières. Seul le fer produit des étincelles au choc !",
    image: "assets/images/items/objets_materiaux.webp",
    hotspots: [
      {
        label: "Clé en Bronze",
        left: "5%", top: "6%", width: "27%", height: "86%",
        correct: false,
        errorText: "Le bronze ne produit pas d'étincelle : Vauban faisait justement forger les serrures des poudrières en bronze."
      },
      {
        label: "Bourse en Cuir",
        left: "32%", top: "18%", width: "24%", height: "64%",
        correct: false,
        errorText: "Le cuir est souple et parfaitement sûr dans un magasin à poudre."
      },
      {
        label: "Manche en Bois",
        left: "56%", top: "10%", width: "19%", height: "78%",
        correct: false,
        errorText: "Les maillets et outils en bois étaient autorisés pour manipuler les barils sans risque."
      },
      {
        label: "Pointe en Fer",
        left: "75%", top: "12%", width: "21%", height: "76%",
        correct: true,
        successText: "Exact ! Le fer est formellement banni des magasins à poudre."
      }
    ],
    onSuccess: () => {
      setBusy(true);
      playSound("bruit_metal_leger");
      setTimeout(() => {
        playSound("succes");
        UI.message(
          "C'est exact : le fer est banni des poudrières royales pour éviter toute étincelle. En l'écartant, vous libérez le loquet de sécurité de la porte en bronze.",
          () => {
            setBusy(false);
            changeScene("poudriere_ok");
          },
          null,
          { kicker: "Sécurité Assurée", title: "Porte de Bronze Débloquée" }
        );
      }, 650);
    }
  });
}

// 2. LE GRAND PUITS (Roue à écureuil -> 9 tours)
export function enigmeGrandPuits() {
  if (getState().isBusy) return;

  runWellWinchPuzzle({
    onSuccess: () => {
      setBusy(true);
      setTimeout(() => {
        playSound("seau_eau_plein");
        playSound("succes");
        UI.message(
          "Après 9 tours vigoureux de la roue à écureuil, le seau surgit des 117 mètres de profondeur ! L'eau est trouble mais précieuse pour actionner les citernes.",
          () => {
            setBusy(false);
            changeScene("puits_eau_trouvee");
          },
          null,
          { kicker: "117 Mètres Remontés", title: "Le Seau Atteint la Surface" }
        );
      }, 1600);
    }
  });
}

// 3. LES VALVES DES CITERNES (Simulateur 10L / 3L -> 7L)
export function enigmeValves() {
  if (getState().isBusy) return;

  runHydraulicValvesPuzzle({
    onSuccess: () => {
      setBusy(true);
      playSound("eau_versee");
      setTimeout(() => {
        playSound("succes");
        UI.message(
          "Le niveau est parfait : 7 litres dans la citerne principale ! Le contrepoids s'équilibre et la grande porte souterraine pivote vers la lumière du jour.",
          () => {
            setBusy(false);
            changeScene("zone3_terminee");
          },
          null,
          { kicker: "Zone III Achevée", title: "Contrepoids Équilibré" }
        );
      }, 900);
    }
  });
}
