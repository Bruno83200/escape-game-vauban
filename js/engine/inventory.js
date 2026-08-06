// js/engine/inventory.js
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { gameData } from "./state.js"; // On utilise gameData

export async function ajouterObjet(nomObjet) {
    const data = gameData.userData;
    if (!data.inventory.includes(nomObjet)) {
        data.inventory.push(nomObjet);
        const user = getAuth().currentUser;
        await updateDoc(doc(getFirestore(), "users", user.uid), { 
            inventory: data.inventory 
        });
        document.getElementById('inventory-list').innerText = data.inventory.join(", ");
    }
}