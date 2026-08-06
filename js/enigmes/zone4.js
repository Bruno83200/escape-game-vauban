// js/enigmes/zone4.js
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { gameData, getState, setBusy } from "../engine/state.js";
import { playSound } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import { UI, checkAnswer } from "../ui.js";
import { ajouterObjet } from "../engine/inventory.js"; 

// 1. ÉNIGME DU TRAITÉ (LE MOT ARTILLERIE)
export function enigmeTraite() {
    if (getState().isBusy) return;

    UI.ask("Une fois les morceaux réunis, quel mot lié au génie militaire apparaît en majuscules ?", async (reponse) => {
        if (checkAnswer(reponse, ["ARTILLERIE"])) {
            setBusy(true);
            playSound('bruit_page_papier');
            setTimeout(() => {
                playSound('bruit_canon_deplace');
                playSound('succes');
                UI.message("Le mécanisme des canons s'enclenche ! Une trappe apparaît sous l'affût.", () => {
                    setBusy(false);
                    changeScene("alignement_solaire");
                });
            }, 1500);
        } else {
            playSound('erreur');
            UI.message("Ce mot ne figure pas sur le traité. Regardez bien les morceaux du puzzle.");
        }
    }, "assets/images/items/traite_vauban_dechire.webp");
}

// 2. INSPECTION DE LA GUÉRITE
export function voirIndicesGuerite() {
    if (getState().isBusy) return;
    UI.message("En observant les briques de la guérite de la Reine, vous remarquez des chiffres gravés : 10, 08 et 1678.", null, "assets/images/items/guerite_indices.webp");
}

// 3. RAMASSER LA LENTILLE
export async function ramasserLentille() {
    if (getState().isBusy) return;
    setBusy(true);
    await ajouterObjet("Lentille de verre");
    UI.showItem("Lentille de Vauban", "Une loupe puissante utilisée par les ingénieurs pour lire les cartes fines.", "assets/images/items/lentille_indice.webp", () => {
        setBusy(false);
    });
}

// 4. ÉNIGME DE L'ALIGNEMENT SOLAIRE
export function enigmeSolaire() {
    if (getState().isBusy) return;

    // Sécurité si userData n'est pas encore chargé
    if (!gameData.userData || !gameData.userData.inventory.includes("Lentille de verre")) {
        UI.message("Vous n'avez rien pour concentrer les rayons du soleil.");
        return;
    }

    UI.message("Vous placez la lentille. Un point blanc éblouissant apparaît sur la corde de chanvre. Une fumée commence à s'élever...", () => {
        setBusy(true);
        playSound('bruit_feu');
        
        setTimeout(() => {
            playSound('corde_rupture');
            playSound('succes');
            UI.message("La corde cède ! La herse s'abat, libérant enfin l'accès au passage dérobé.", () => {
                setBusy(false);
                changeScene("front_secours");
            });
        }, 3000);
    });
}

// 5. ÉNIGME FINALE (LA DATE)
export function enigmeFinale() {
    if (getState().isBusy) return;
    UI.ask("Saisissez la date historique du traité (Format: JJMMAAAA) :", async (reponse) => {
        if (checkAnswer(reponse, ["10081678"])) {
            setBusy(true);
            playSound('succes');
            UI.message("10 Août 1678... La date est correcte. Le Secret du Lys Noir est préservé !", () => {
                setBusy(false);
                changeScene("victoire");
            });
        } else {
            playSound('erreur');
            UI.message("Le code est erroné. Combinez les chiffres trouvés sur les briques.");
        }
    });
}

// 6. TABLEAU D'HONNEUR (FIREBASE)
export async function enregistrerVictoire() {
    if (getState().isBusy) return;
    setBusy(true);

    try {
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            // Utilisation de la fonction doc() importée de Firebase
            await setDoc(doc(db, "winners", user.uid), {
                pseudo: gameData.userData.pseudo || "Explorateur Anonyme",
                date: new Date()
            }, { merge: true });
        }

        const q = query(collection(db, "winners"), orderBy("date", "desc"), limit(5));
        const querySnapshot = await getDocs(q); 
        
        let listeVainqueurs = "LES GARDIENS DU SECRET :\n\n";
        // Renommé 'doc' en 'docSnap' pour éviter le conflit avec la fonction doc()
        querySnapshot.forEach((docSnap) => {
            listeVainqueurs += `- ${docSnap.data().pseudo}\n`;
        });

        UI.message(listeVainqueurs, () => {
            setBusy(false);
            changeScene("hall_of_fame");
        }, "assets/images/items/papyrus.webp");

    } catch (error) {
        console.error("Erreur Hall of Fame:", error);
        setBusy(false);
        changeScene("hall_of_fame");
    }
}

// 7. FONCTION REJOUER
export function demandeRejouer() {
    UI.message("Si vous souhaitez recommencer l'aventure, adressez un mail à bruno83200.6929@gmail.com avec le titre du jeu et votre pseudo afin que je puisse réinitialiser votre progression.", () => {
        window.location.href = "index.html";
    });
}