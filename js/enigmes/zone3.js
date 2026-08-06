// js/enigmes/zone3.js
import { UI, checkAnswer } from "../ui.js"; // Ajout de checkAnswer pour la robustesse
import { getState, setBusy } from "../engine/state.js"; 
import { playSound } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import { ajouterObjet } from "../engine/inventory.js";

// --- ÉNIGME 1 : LA POUDRIÈRE ---
export function enigmePoudriere() {
    if (getState().isBusy) return; // ✅ Corrigé
    UI.ask("L'un de ces matériaux (Bronze, Cuir, Bois, Fer) est strictement interdit ici car il peut créer une étincelle fatale. Lequel est-ce ?", async (reponse) => {
        if (checkAnswer(reponse, ["FER"])) {
            setBusy(true);
            playSound('bruit_metal_leger');
            setTimeout(() => {
                playSound('succes');
                UI.message("C'est exact. Le fer est banni des magasins à poudre. Le mécanisme de sécurité se libère.", () => {
                    setBusy(false);
                    changeScene("poudriere_ok");
                });
            }, 1000);
        } else {
            playSound('erreur');
            UI.message("Ce matériau est utilisé ici sans danger. Cherchez l'alliage capable de provoquer un désastre.");
        }
    }, "assets/images/items/objets_materiaux.webp");
}

// --- ÉNIGME 2 : LA ROUE DU PUITS ---
export function enigmeGrandPuits() {
    if (getState().isBusy) return; // ✅ ÉTAIT EN ERREUR (CORRIGÉ)

    UI.ask("Combien de tours de roue (diamètre 4m) sont nécessaires pour remonter le seau de 117m de profondeur ?", async (reponse) => {
        // Utilisation de checkAnswer pour accepter "9" ou "neuf" proprement
        if (checkAnswer(reponse, ["9", "neuf", "9 tours", "neuf tours"])) {
            setBusy(true);
            playSound('bruit_roue_bois');

            UI.message("Vous actionnez la roue. Le bois craque lourdement dans le silence du puits...");

            setTimeout(() => {
                playSound('seau_eau_plein');
                playSound('succes');
                
                UI.message("Le seau arrive enfin à la surface ! L'eau est trouble mais précieuse.", () => {
                    setBusy(false);
                    changeScene("puits_eau_trouvee");
                });
            }, 4000);

        } else {
            playSound('erreur');
            UI.message("La roue tourne un peu mais le seau n'atteint pas la surface. Revoyez votre calcul.");
        }
    }, "assets/images/items/puits_dimensions.webp");
}

// --- ÉNIGME 3 : LES VALVES ---
export function enigmeValves() {
    if (getState().isBusy) return; // ✅ ÉTAIT EN ERREUR (CORRIGÉ)

    UI.ask("Une fois le seau de 3L rempli depuis la citerne de 10L, quel est le volume final (en litres) restant dans la citerne ?", async (reponse) => {
        if (checkAnswer(reponse, ["7", "sept"])) { // Ajout de "sept" via checkAnswer
            setBusy(true);
            playSound('bruit_valve_metal');
            setTimeout(() => {
                playSound('eau_versee');
                setTimeout(() => {
                    playSound('succes');
                    UI.message("Le niveau est parfait : 7 litres. Le contrepoids s'équilibre et la porte s'ouvre !", () => {
                        setBusy(false);
                        changeScene("zone3_terminee");
                    });
                }, 1500);
            }, 1000);
        } else {
            playSound('erreur');
            UI.message("Le poids n'est pas correct. La porte reste close. Calculez ce qu'il reste dans la citerne.");
        }
    }, "assets/images/items/schema_valves.webp");
}