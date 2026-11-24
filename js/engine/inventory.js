// js/engine/inventory.js — Inventaire visuel & Carnet d'archives synchronisés Firestore

import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { gameData } from "./state.js";
import { UI } from "../ui.js";

export async function ajouterObjet(nomObjet) {
  const data = gameData.userData;
  if (!Array.isArray(data.inventory)) data.inventory = [];

  if (!data.inventory.includes(nomObjet)) {
    data.inventory.push(nomObjet);
    UI.renderInventory(data.inventory);
    UI.updateJournalBadge();

    try {
      const user = getAuth().currentUser;
      if (user) {
        await updateDoc(doc(getFirestore(), "users", user.uid), {
          inventory: data.inventory
        });
      }
    } catch (err) {
      console.warn("Synchronisation inventaire différée :", err);
    }
  }
}

export async function enregistrerIndice(clueId) {
  const data = gameData.userData;
  if (!Array.isArray(data.discoveredClues)) data.discoveredClues = [];

  if (!data.discoveredClues.includes(clueId)) {
    data.discoveredClues.push(clueId);
    UI.updateJournalBadge();
    UI.toast("Archive consignée dans votre Carnet d'Architecte.");

    try {
      const user = getAuth().currentUser;
      if (user) {
        await updateDoc(doc(getFirestore(), "users", user.uid), {
          discoveredClues: data.discoveredClues
        });
      }
    } catch (err) {
      console.warn("Synchronisation carnet différée :", err);
    }
  }
}
