// REGROUPEMENT DES IMPORTS (Une seule ligne par fichier source)
import { UI, checkAnswer } from "../ui.js";
import { getState, setBusy } from "../engine/state.js"; 
import { playSound, sounds } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import { ajouterObjet } from "../engine/inventory.js";

// 1. ÉNIGME VAUBAN
export function enigmeVauban() {
    if (getState().isBusy) return;

    UI.ask("Le compas de l'ingénieur pointe deux nombres clés sur le plan (Indice : Latitude et Longitude). Quels sont-ils ?", async (reponse) => {
        // Utilisation de checkAnswer pour plus de souplesse (ex: "47 06")
        if (checkAnswer(reponse, ["4706", "47 06", "47-06"])) {
            setBusy(true);
            playSound('bruit_compas_metal');
            
            setTimeout(() => {
                playSound('succes');
                UI.message("Les coordonnées 47° Nord et 06° Est correspondent parfaitement... Un clic mécanique retentit !", () => {
                    setBusy(false);
                    changeScene("galerie_entree");
                });
            }, 1000);
        } else {
            playSound('erreur');
            UI.message("Ces nombres ne semblent pas déverrouiller le mécanisme du plan.");
        }
    }, "assets/images/items/vauban_zoom_plan.webp");
}

// 2. ÉNIGME MIROIRS
export function enigmeMiroirs() {
    if (getState().isBusy) return;
    UI.ask("Trois miroirs doivent être orientés (G, D, C). Quelle séquence de 3 lettres guidera la lumière ?", async (reponse) => {
        if (checkAnswer(reponse, ["DGC"])) {
            setBusy(true);
            playSound('bruit_verre');
            setTimeout(() => {
                playSound('succes');
                UI.message("Le rayon ricoche de miroir en miroir avec un sifflement cristallin. La galerie s'illumine !", () => {
                    setBusy(false);
                    changeScene("galerie_eclairee");
                });
            }, 1500);
        } else {
            playSound('erreur');
            UI.message("La lumière se perd contre les parois de pierre. Ce n'est pas la bonne orientation.");
        }
    }, "assets/images/items/miroirs_dispositif.webp");
}

// 3. RÉVÉLATION LATIN
export function revelerLatin() {
    UI.message("L'inscription dit : 'LUX IN TENEBRIS' (La lumière dans les ténèbres).", null, "assets/images/items/inscription_latine.webp");
}

// 4. ÉNIGME VOLUME
export function enigmeVolume() {
    if (getState().isBusy) return;
    UI.ask("Calculez le volume de cette section de courtine (en m³).", async (reponse) => {
        if (checkAnswer(reponse, ["440"])) {
            setBusy(true);
            playSound('clic_coffre');
            setTimeout(() => {
                playSound('succes');
                UI.message("Le loquet du coffre cède ! Le chiffre 440 était bien la clé mathématique.", () => {
                    setBusy(false);
                    changeScene("chemin_ronde");
                });
            }, 1000);
        } else {
            playSound('erreur');
            UI.message("Le coffre reste scellé. Vérifiez vos calculs (Hauteur x Longueur x Épaisseur).");
        }
    }, "assets/images/items/schema_rempart.webp");
}

// 5. ÉNIGME MORSE
export function enigmeMorse() {
    if (getState().isBusy) return;
    
    playSound('son_morse_liberte');

    UI.ask("Traduisez le mot transmis en Morse pour déverrouiller le passage.", async (reponse) => {
        if (checkAnswer(reponse, ["LIBERTE", "LIBERTÉ"])) {
            setBusy(true);
            if (sounds.son_morse_liberte) sounds.son_morse_liberte.pause();
            playSound('ouverture_grille');
            
            setTimeout(() => {
                playSound('succes');
                UI.message("Le message est authentifié. La grille se déverrouille !", () => {
                    setBusy(false);
                    changeScene("entree_zone3");
                });
            }, 1000);
        } else {
            playSound('erreur');
            UI.message("Le code ne correspond pas. Écoutez attentivement le rythme.");
        }
    }, "assets/images/items/code_morse.webp");
}