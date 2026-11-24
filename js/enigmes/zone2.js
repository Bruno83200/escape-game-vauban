// js/enigmes/zone2.js — Zone II : Les Remparts & la Galerie 110

import { UI } from "../ui.js";
import { getState, setBusy } from "../engine/state.js";
import { playSound } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import { enregistrerIndice } from "../engine/inventory.js";
import {
  runDialLockPuzzle,
  runMirrorsPuzzle,
  runMorseRadioPuzzle
} from "../minigames/workbench.js";

// 1. ÉNIGME VAUBAN (Compas 47° N / 06° E)
export function enigmeVauban() {
  if (getState().isBusy) return;

  runDialLockPuzzle({
    kicker: "Zone II · Instruments de Géodésie",
    title: "Le Compas de Bronze de Vauban",
    instruction: "Le compas de l'ingénieur pointe deux nombres gravés sur ses branches (Latitude Nord et Longitude Est de Besançon). Réglez les molettes de laiton sur ces coordonnées.",
    hint: "Examinez les deux nombres gravés sur les pointes du compas de bronze : 47° Nord et 06° Est (4706).",
    image: "assets/images/items/vauban_zoom_plan.webp",
    imageCaption: "Détail du compas de bronze de la statue de Vauban",
    dialTitle: "Coordonnées Géodésiques",
    digits: 4,
    groups: { 2: "°N · " },
    labels: ["Lat.", "Lat.", "Lon.", "Lon."],
    validAnswers: ["4706"],
    errorText: "Ces coordonnées ne déverrouillent pas le mécanisme du plan. Zoomez sur les branches du compas.",
    successText: "47° Nord et 06° Est : un déclic métallique libère le passage !",
    submitLabel: "Aligner le compas",
    onSuccess: () => {
      setBusy(true);
      playSound("bruit_compas_metal");
      setTimeout(() => {
        playSound("succes");
        UI.message(
          "Les coordonnées 47° Nord et 06° Est correspondent parfaitement à la Citadelle… Un clic mécanique ouvre l'accès vers la Galerie 110 !",
          () => {
            setBusy(false);
            changeScene("galerie_entree");
          },
          null,
          { kicker: "Coordonnées Authentifiées", title: "Accès à la Galerie 110" }
        );
      }, 650);
    }
  });
}

// 2. ÉNIGME MIROIRS (Galerie 110 -> DGC)
export function enigmeMiroirs() {
  if (getState().isBusy) return;

  runMirrorsPuzzle({
    onSuccess: () => {
      setBusy(true);
      playSound("bruit_verre");
      setTimeout(() => {
        playSound("succes");
        UI.message(
          "Le rayon ricoche de miroir en miroir dans un éclat cristallin. La Galerie 110 s'illumine enfin !",
          () => {
            setBusy(false);
            changeScene("galerie_eclairee");
          },
          null,
          { kicker: "Optique Alignée", title: "La Galerie s'Illumine" }
        );
      }, 650);
    }
  });
}

// 3. RÉVÉLATION LATIN
export async function revelerLatin() {
  await enregistrerIndice("inscription_latine");
  UI.message(
    "L'inscription gravée dans le calcaire proclame : « LUX IN TENEBRIS » (La lumière dans les ténèbres).",
    null,
    "assets/images/items/inscription_latine.webp",
    { kicker: "Relevé Épigraphique Consigné", title: "LUX IN TENEBRIS" }
  );
}

// 4. ÉNIGME VOLUME (Coffre d'artillerie -> 440 m³)
export function enigmeVolume() {
  if (getState().isBusy) return;

  runDialLockPuzzle({
    kicker: "Zone II · Calcul d'Ingénieur",
    title: "Le Coffre d'Artillerie de la Courtine",
    instruction: "Étudiez le plan coté de Vauban et calculez le volume total de cette section de courtine (en m³) pour déverrouiller le coffre.",
    hint: "Longueur = 10 m, Hauteur = 8 m, Largeur = 5,5 m → 10 × 8 × 5,5 = 440 m³.",
    image: "assets/images/items/schema_rempart.webp",
    imageCaption: "Profil de la Courtine — 1678 (Longueur 10 m · Hauteur 8 m · Largeur 5,5 m)",
    dialTitle: "Serrure du Coffre (Volume en m³)",
    digits: 3,
    labels: ["C", "D", "U"],
    scratchpadHtml: `
      <div class="calc-scratchpad">
        <strong>Formule du volume :</strong> Longueur × Hauteur × Largeur<br/>
        <span style="font-size:0.9rem;color:var(--ink-500);">Relevez les trois cotes inscrites sur la planche d'architecte ci-contre.</span>
      </div>`,
    validAnswers: ["440"],
    errorText: "Le coffre reste scellé. Vérifiez votre produit : Longueur × Hauteur × Épaisseur.",
    successText: "440 m³ ! Le loquet du coffre d'artillerie saute !",
    submitLabel: "Déverrouiller le coffre",
    onSuccess: () => {
      setBusy(true);
      playSound("clic_coffre");
      setTimeout(() => {
        playSound("succes");
        UI.message(
          "Le loquet du coffre cède ! Le chiffre 440 était bien la clé mathématique des plans de Vauban.",
          () => {
            setBusy(false);
            changeScene("chemin_ronde");
          },
          null,
          { kicker: "Coffre Ouvert", title: "Plans de Défense Récupérés" }
        );
      }, 650);
    }
  });
}

// 5. ÉNIGME MORSE (Poste Radio -> LIBERTÉ)
export function enigmeMorse() {
  if (getState().isBusy) return;

  runMorseRadioPuzzle({
    onSuccess: () => {
      setBusy(true);
      playSound("ouverture_grille");
      setTimeout(() => {
        playSound("succes");
        UI.message(
          "Le message « LIBERTÉ » est authentifié. La grille de la cour intérieure s'ouvre devant vous !",
          () => {
            setBusy(false);
            changeScene("entree_zone3");
          },
          null,
          { kicker: "Zone II Achevée", title: "Signal Authentifié" }
        );
      }, 650);
    }
  });
}
