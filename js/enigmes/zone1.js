// js/enigmes/zone1.js
import { UI, checkAnswer } from "../ui.js";
import { gameData, getState, setBusy } from "../engine/state.js";
import { playSound } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import { ajouterObjet } from "../engine/inventory.js";

export function enigmeBlason() {
    if (getState().isBusy) return;

    UI.ask("Quatre blasons sont gravés. Lequel représente l'allégeance de la cité (Croix, Lys, Aigle, Lion) ?", async (reponse) => {
        if (checkAnswer(reponse, ["Aigle", "Besançon", "Besancon"])) {
            setBusy(true);
            playSound('succes');
            setTimeout(() => {
                playSound('herse_ouverture');
                UI.message("Le blason de Besançon s'enclenche parfaitement. La herse s'élève !", () => {
                    setBusy(false);
                    changeScene("pont_ouvert");
                });
            }, 1000);
        } else {
            playSound('erreur');
            UI.message("Le mécanisme ne réagit pas. Ce blason n'est pas celui de la cité impériale.");
        }
    }, "assets/images/items/blasons_indice.webp");
}

export async function ramasserFrottis() {
    if (getState().isBusy) return;
    setBusy(true);
    await ajouterObjet("Frottis");
    UI.showItem("Frottis de graphite", "Vous avez trouvé de quoi révéler les inscriptions gravées.", "assets/images/items/frottis_item.webp", () => {
        setBusy(false);
    });
}

export function utiliserFrottis() {
    if (getState().isBusy) return;
    
    const inventaire = gameData.userData.inventory || [];
    if (!inventaire.includes("Frottis")) {
        UI.message("Vous n'avez rien pour faire apparaître les gravures du mur.");
        return;
    }

    UI.ask("Utilisez le frottis sur le mur. Quel code à 4 chiffres apparaît ?", async (reponse) => {
        if (checkAnswer(reponse, ["1674"])) {
            setBusy(true); 
            playSound('bruit_frottement_papier');
            setTimeout(() => {
                playSound('succes');
                UI.message("Le code 1674 est correct. Un escalier dérobé apparaît !", () => {
                    setBusy(false); 
                    changeScene("courtine_devoilee");
                });
            }, 1200);
        } else { 
            playSound('erreur'); 
            UI.message("Le code semble incorrect ou illisible."); 
        }
    });
}

export function lireArchives() {
    playSound('bruit_frottement_papier');
    UI.message("Vos notes indiquent : 'La muraille fut gravée par les ingénieurs royaux l'année où Besançon devint française à l'issue du siège de Louis XIV !'", 
        null, "assets/images/items/archives_item.webp");
}

export function choisirGuerite() {
    if (getState().isBusy) return;
    
    UI.ask("Laquelle de ces guérites (A, B ou C) surveille directement le cours du Doubs ?", async (reponse) => {
        if (checkAnswer(reponse, ["C", "Guerite C", "Guérite C"])) {
            setBusy(true); 
            playSound('succes');
            setTimeout(async () => {
                playSound('clic_serrure');
                await ajouterObjet("Clé de la Porte de Garde");
                UI.showItem("Clé de la Garde", "Félicitations ! La Zone 1 est terminée.", "assets/images/items/cle_garde_item.webp", () => {
                    UI.message("Vous quittez le Front Saint-Étienne pour vous enfoncer sur les remparts...", () => {
                        setBusy(false);
                        changeScene("vauban_statue");
                    });
                });
            }, 1000);
        } else { 
            playSound('erreur'); 
            UI.message("Cette guérite surveille une autre direction. Cherchez encore."); 
        }
    }, "assets/images/items/guetteur_indice.webp");
}
