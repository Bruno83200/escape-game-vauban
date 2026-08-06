// js/engine/scenes-engine.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from "../config.js";
import { scenes } from "../data/scenes.js";
import { UI } from "../ui.js";
import { stopAllSounds, stopAllAmbiance, sounds } from "./audio.js";
import { gameData, setUserData, setCurrentUser, setCurrentActiveScene } from "./state.js";

// IMPORTATION DES ÉNIGMES
import { enigmeBlason, ramasserFrottis, utiliserFrottis, choisirGuerite, lireArchives } from "../enigmes/zone1.js";
import { enigmeVauban, enigmeMiroirs, revelerLatin, enigmeVolume, enigmeMorse } from "../enigmes/zone2.js";
import { enigmePoudriere, enigmeGrandPuits, enigmeValves } from "../enigmes/zone3.js";
import { enigmeTraite, enigmeFinale, voirIndicesGuerite, enregistrerVictoire, demandeRejouer, ramasserLentille, enigmeSolaire } from "../enigmes/zone4.js";

const enigmaFunctions = { 
    "enigmeBlason": enigmeBlason, "ramasserFrottis": ramasserFrottis, "utiliserFrottis": utiliserFrottis, 
    "choisirGuerite": choisirGuerite, "lireArchives": lireArchives, "enigmeVauban": enigmeVauban, 
    "enigmeMiroirs": enigmeMiroirs, "revelerLatin": revelerLatin, "enigmeVolume": enigmeVolume, 
    "enigmeMorse": enigmeMorse, "enigmePoudriere": enigmePoudriere, "enigmeGrandPuits": enigmeGrandPuits,
    "enigmeValves": enigmeValves, "enigmeTraite": enigmeTraite, "enigmeFinale": enigmeFinale,  "ramasserLentille": ramasserLentille,
    "enigmeSolaire": enigmeSolaire, "voirIndicesGuerite": voirIndicesGuerite, "enregistrerVictoire": enregistrerVictoire, "demandeRejouer": demandeRejouer
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (!userDoc.exists()) {
            window.location.href = "index.html";
            return;
        }

        setUserData(userDoc.data());
        
        const nameElem = document.getElementById('player-name');
        if (nameElem) nameElem.innerText = gameData.userData.pseudo; 
        
        const startScene = gameData.userData.currentScene || "pont_dormant";
        renderScene(startScene);
    } else {
        window.location.href = "index.html";
    }
});

export function renderScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) return;

    setCurrentActiveScene(sceneId);

    if (scene.ambience && sounds[scene.ambience]) {
        if (sounds[scene.ambience].paused) {
            stopAllAmbiance();
            sounds[scene.ambience].loop = (scene.ambience !== "fanfare_victoire");
            sounds[scene.ambience].play().catch(() => {});
        }
    }

    document.getElementById('scene-container').style.backgroundImage = `url('${scene.image}')`;
    document.getElementById('description-text').innerText = scene.text;
    
    const grid = document.getElementById('choices-grid');
    grid.innerHTML = "";

    scene.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = "btn-main";
        btn.style.width = "auto";
        btn.innerText = choice.text;
        
        btn.onclick = () => {
            if (choice.next) changeScene(choice.next);
            if (choice.action && enigmaFunctions[choice.action]) {
                enigmaFunctions[choice.action]();
            }
        };
        grid.appendChild(btn);
    });

    // Sécurité Inventaire
    const invList = document.getElementById('inventory-list');
    if (invList) {
        const items = gameData.userData.inventory || [];
        invList.innerText = items.length > 0 ? items.join(", ") : "Vide";
    }
}

export async function changeScene(newSceneId) {
    stopAllSounds(); 
    const user = auth.currentUser;
    if (!user) return;

    gameData.userData.currentScene = newSceneId;
    
    try {
        await updateDoc(doc(db, "users", user.uid), { currentScene: newSceneId });
        renderScene(newSceneId);
    } catch (error) {
        console.error("Erreur de sauvegarde Firebase:", error);
        renderScene(newSceneId);
    }
}

window.logout = () => signOut(auth);

function checkOrientation() {
    const rotateElem = document.getElementById('rotate-device');
    if (rotateElem) {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        rotateElem.style.display = isPortrait ? "flex" : "none";
    }
}

window.addEventListener('resize', checkOrientation);
checkOrientation();