// js/enigmes/zone4.js — Zone IV : Le Front Royal & Le Secret du Lys Noir

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { gameData, getState, setBusy } from "../engine/state.js";
import { playSound } from "../engine/audio.js";
import { changeScene } from "../engine/scenes-engine.js";
import { UI } from "../ui.js";
import { ajouterObjet, enregistrerIndice } from "../engine/inventory.js";
import {
  runTreatiseAssemblyPuzzle,
  runSolarLensPuzzle,
  runDialLockPuzzle
} from "../minigames/workbench.js";

// 1. ÉNIGME DU TRAITÉ (Reconstitution des 3 fragments -> ARTILLERIE)
export function enigmeTraite() {
  if (getState().isBusy) return;

  runTreatiseAssemblyPuzzle({
    onSuccess: () => {
      setBusy(true);
      playSound("bruit_canon_deplace");
      setTimeout(() => {
        playSound("succes");
        UI.message(
          "Le mot « ARTILLERIE » enclenche le mécanisme des affûts ! Les canons pivotent et découvrent une trappe menant au bastion ensoleillé.",
          () => {
            setBusy(false);
            changeScene("alignement_solaire");
          },
          null,
          { kicker: "Traité Reconstitué", title: "Canons Orientés" }
        );
      }, 900);
    }
  });
}

// 2. RAMASSER LA LENTILLE
export async function ramasserLentille() {
  if (getState().isBusy) return;
  setBusy(true);
  await ajouterObjet("Lentille de verre");
  playSound("bruit_verre");
  UI.showItem(
    "Lentille de Vauban",
    "Une loupe puissante sertie de laiton, utilisée par les ingénieurs royaux pour examiner les plans fins — et capable de concentrer le soleil de midi.",
    "assets/images/items/lentille_indice.webp",
    () => { setBusy(false); }
  );
}

// 3. ÉNIGME DE L'ALIGNEMENT SOLAIRE (Focalisation interactive sur la corde)
export function enigmeSolaire() {
  if (getState().isBusy) return;

  const inv = gameData.userData?.inventory || [];
  if (!inv.includes("Lentille de verre")) {
    playSound("erreur");
    UI.message(
      "Le soleil frappe durement la corde de chanvre, mais vous n'avez aucun instrument pour en concentrer les rayons. Cherchez d'abord dans la guérite.",
      null,
      null,
      { kicker: "Instrument Manquant", title: "Foyer Solaire Impossible" }
    );
    return;
  }

  runSolarLensPuzzle({
    onSuccess: () => {
      setBusy(true);
      playSound("succes");
      UI.message(
        "La corde embrasée cède brusquement ! La dernière herse s'abat et libère l'accès au Front de Secours.",
        () => {
          setBusy(false);
          changeScene("front_secours");
        },
        null,
        { kicker: "Passage Ouvert", title: "La Corde Rompt !" }
      );
    }
  });
}

// 4. INSPECTION DE LA GUÉRITE DE LA REINE
export async function voirIndicesGuerite() {
  if (getState().isBusy) return;
  await enregistrerIndice("guerite_reine");
  UI.message(
    "En observant les briques rouges de la guérite de la Reine, vous distinguez trois nombres profondément gravés : 10, 08 et 1678 — la date du traité de Nimègue.",
    null,
    "assets/images/items/guerite_indices.webp",
    { kicker: "Indice Consigné au Carnet", title: "La Guérite de la Reine" }
  );
}

// 5. ÉNIGME FINALE (Cryptex Royal à 8 molettes -> 10081678)
export function enigmeFinale() {
  if (getState().isBusy) return;

  const hasSeenBricks = (gameData.userData?.discoveredClues || []).includes("guerite_reine");
  const refImg = hasSeenBricks
    ? "assets/images/items/guerite_indices.webp"
    : "assets/images/items/papyrus.webp";
  const refCaption = hasSeenBricks
    ? "Briques gravées de la Guérite de la Reine (10 · 08 · 1678)"
    : "Inspectez la Guérite de la Reine pour relever la date exacte";

  runDialLockPuzzle({
    kicker: "Zone IV · Ultime Verrou Royal",
    title: "Le Cryptex du Front de Secours",
    instruction: "Réglez les 8 molettes de laiton sur la date historique du traité par lequel la Citadelle devint française (Format : JJ · MM · AAAA).",
    hint: "Les briques de la Guérite de la Reine indiquent le 10 août 1678 : entrez 10 08 1678.",
    image: refImg,
    imageCaption: refCaption,
    dialTitle: "Date du Traité (JJ · MM · AAAA)",
    digits: 8,
    compact: true,
    groups: { 2: " / ", 4: " / " },
    labels: ["J", "J", "M", "M", "A", "A", "A", "A"],
    validAnswers: ["10081678"],
    errorText: "Le cryptex reste scellé. Combinez les chiffres gravés sur les briques de la Guérite de la Reine (JJMMAAAA).",
    successText: "10 Août 1678 — Le sceau du Lys Noir s'ouvre !",
    submitLabel: "Sceller le Secret du Lys Noir",
    onSuccess: () => {
      setBusy(true);
      playSound("succes");
      UI.message(
        "10 Août 1678… Traité de Nimègue ! Le mécanisme royal cède : vous avez percé et préservé le Secret du Lys Noir !",
        () => {
          setBusy(false);
          changeScene("victoire");
        },
        "assets/images/items/papyrus.webp",
        { kicker: "Victoire Royale", title: "Le Secret du Lys Noir est Préservé" }
      );
    }
  });
}

// 6. TABLEAU D'HONNEUR (FIREBASE)
export async function enregistrerVictoire() {
  if (getState().isBusy) return;
  setBusy(true);

  let extraHtml = "";
  try {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      await setDoc(
        doc(db, "winners", user.uid),
        {
          pseudo: gameData.userData.pseudo || "Explorateur Anonyme",
          date: new Date()
        },
        { merge: true }
      );
    }

    const q = query(collection(db, "winners"), orderBy("date", "desc"), limit(8));
    const querySnapshot = await getDocs(q);

    const rows = [];
    let rank = 1;
    querySnapshot.forEach((docSnap) => {
      const d = docSnap.data();
      let dateStr = "";
      if (d.date && typeof d.date.toDate === "function") {
        dateStr = d.date.toDate().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
      }
      const safePseudo = String(d.pseudo || "Explorateur").replace(/[<>&"]/g, "");
      rows.push(`
        <li class="hof-item">
          <span class="hof-rank"><span class="hof-medal">${rank++}</span>${safePseudo}</span>
          <span class="hof-date">${dateStr}</span>
        </li>`);
    });

    if (rows.length > 0) {
      extraHtml = `<ul class="hof-list">${rows.join("")}</ul>`;
    }
  } catch (error) {
    console.error("Erreur Hall of Fame:", error);
  }

  UI.message(
    "Votre nom figure désormais parmi les Gardiens du Secret du Lys Noir :",
    () => {
      setBusy(false);
      if (gameData.currentActiveScene !== "hall_of_fame") {
        changeScene("hall_of_fame");
      }
    },
    "assets/images/items/papyrus.webp",
    {
      kicker: "Registre de la Citadelle",
      title: "Les Gardiens du Secret",
      extraHtml,
      buttonText: "Fermer le registre"
    }
  );
}

// 7. FONCTION REJOUER (Préserve la procédure souhaitée par l'auteur)
export function demandeRejouer() {
  UI.message(
    "Si vous souhaitez recommencer l'aventure, adressez un mail à bruno83200.6929@gmail.com avec le titre du jeu et votre pseudo afin que je puisse réinitialiser votre progression.",
    () => {
      window.location.href = "index.html";
    },
    null,
    {
      kicker: "Nouvelle Expédition",
      title: "Réinitialiser votre Carnet",
      buttonText: "Retour à l'accueil"
    }
  );
}
