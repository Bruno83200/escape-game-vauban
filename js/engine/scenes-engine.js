// js/engine/scenes-engine.js — Moteur de scènes, transitions photo & HUD Vauban

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { firebaseConfig } from "../config.js";
import { scenes, ZONES } from "../data/scenes.js";
import { UI } from "../ui.js";
import {
  stopAllSounds,
  playAmbience,
  resumePendingAmbience,
  toggleMute,
  getMuted
} from "./audio.js";
import {
  gameData,
  setUserData,
  setCurrentUser,
  setCurrentActiveScene,
  setLastZone
} from "./state.js";

// Énigmes des 4 Zones
import { enigmeBlason, ramasserFrottis, utiliserFrottis, choisirGuerite, lireArchives } from "../enigmes/zone1.js";
import { enigmeVauban, enigmeMiroirs, revelerLatin, enigmeVolume, enigmeMorse } from "../enigmes/zone2.js";
import { enigmePoudriere, enigmeGrandPuits, enigmeValves } from "../enigmes/zone3.js";
import {
  enigmeTraite,
  enigmeFinale,
  voirIndicesGuerite,
  enregistrerVictoire,
  demandeRejouer,
  ramasserLentille,
  enigmeSolaire
} from "../enigmes/zone4.js";

const enigmaFunctions = {
  enigmeBlason,
  ramasserFrottis,
  utiliserFrottis,
  choisirGuerite,
  lireArchives,
  enigmeVauban,
  enigmeMiroirs,
  revelerLatin,
  enigmeVolume,
  enigmeMorse,
  enigmePoudriere,
  enigmeGrandPuits,
  enigmeValves,
  enigmeTraite,
  enigmeFinale,
  ramasserLentille,
  enigmeSolaire,
  voirIndicesGuerite,
  enregistrerVictoire,
  demandeRejouer
};

// Icônes vectorielles légères pour les boutons d'action
const CHOICE_ICONS = {
  shield:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>`,
  arrow:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>`,
  scroll:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/></svg>`,
  search:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`,
  eye:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  sun:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  ruler:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2M11.5 9.5l2-2M8.5 6.5l2-2M17.5 15.5l2-2"/></svg>`,
  radio:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5M19.1 4.9c3.9 3.9 3.9 10.2 0 14.1M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><circle cx="12" cy="12" r="2"/></svg>`,
  gear:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`,
  droplet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  key:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></svg>`,
  award:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let activeLayer = "a";
let zoneBannerTimer = null;

function crossfadeBackground(imageUrl) {
  const layerA = document.getElementById("scene-layer-a");
  const layerB = document.getElementById("scene-layer-b");
  if (!layerA || !layerB) return;

  const incoming = activeLayer === "a" ? layerB : layerA;
  const outgoing = activeLayer === "a" ? layerA : layerB;

  if (outgoing.dataset.src === imageUrl) return;

  incoming.style.backgroundImage = `url('${imageUrl}')`;
  incoming.dataset.src = imageUrl;

  requestAnimationFrame(() => {
    incoming.classList.add("is-visible");
    outgoing.classList.remove("is-visible");
    activeLayer = activeLayer === "a" ? "b" : "a";
  });
}

function renderZoneStepper(currentZoneId, isVictory) {
  const stepper = document.getElementById("zone-stepper");
  if (!stepper) return;

  stepper.innerHTML = "";
  ZONES.forEach((z, idx) => {
    const done = isVictory || z.id < currentZoneId;
    const active = !isVictory && z.id === currentZoneId;

    const stepWrap = document.createElement("div");
    stepWrap.className = "zone-step";
    stepWrap.innerHTML = `
      <span class="zone-node ${done ? "is-done" : active ? "is-active" : ""}" title="Zone ${z.roman} : ${z.name}">
        ${done ? "✓" : z.roman}
      </span>
      ${idx < ZONES.length - 1 ? `<span class="zone-connector ${done ? "is-done" : ""}"></span>` : ""}`;
    stepper.appendChild(stepWrap);
  });
}

function announceZone(zoneObj) {
  const banner = document.getElementById("zone-announcement");
  const kicker = document.getElementById("zone-announcement-kicker");
  const title = document.getElementById("zone-announcement-title");
  if (!banner || !zoneObj) return;

  kicker.textContent = `ZONE ${zoneObj.roman} SUR IV`;
  title.textContent = zoneObj.name;
  banner.classList.add("is-shown");

  clearTimeout(zoneBannerTimer);
  zoneBannerTimer = setTimeout(() => banner.classList.remove("is-shown"), 3200);
}

function syncAudioButtonUI() {
  const muted = getMuted();
  const btn = document.getElementById("btn-audio");
  const iconOn = document.getElementById("icon-audio-on");
  const iconOff = document.getElementById("icon-audio-off");
  if (!btn) return;
  btn.classList.toggle("is-muted", muted);
  if (iconOn) iconOn.style.display = muted ? "none" : "block";
  if (iconOff) iconOff.style.display = muted ? "block" : "none";
}

function bindGlobalHUD() {
  document.getElementById("btn-journal")?.addEventListener("click", () => UI.openJournal("clues"));

  document.getElementById("btn-audio")?.addEventListener("click", () => {
    const muted = toggleMute();
    syncAudioButtonUI();
    UI.toast(muted ? "Son coupé" : "Ambiance sonore activée");
  });

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    stopAllSounds();
    signOut(auth);
  });

  const collapseBtn = document.getElementById("btn-collapse-folio");
  const collapseLabel = document.getElementById("collapse-label");
  const dock = document.getElementById("folio-dock");
  collapseBtn?.addEventListener("click", () => {
    const collapsed = dock.classList.toggle("is-collapsed");
    if (collapseLabel) collapseLabel.textContent = collapsed ? "Afficher le carnet" : "Vue photo";
  });

  // Déblocage audio automatique au premier geste utilisateur
  const unlockAudio = () => {
    resumePendingAmbience();
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };
  window.addEventListener("pointerdown", unlockAudio, { once: true });
  window.addEventListener("keydown", unlockAudio, { once: true });

  syncAudioButtonUI();
}

export function renderScene(sceneId) {
  const scene = scenes[sceneId] || scenes.pont_dormant;
  if (!scene) return;

  setCurrentActiveScene(sceneId);

  const zoneObj = ZONES.find((z) => z.id === scene.zone) || ZONES[0];
  const isVictory = sceneId === "victoire" || sceneId === "hall_of_fame";

  if (gameData.lastZone !== zoneObj.id) {
    setLastZone(zoneObj.id);
    announceZone(zoneObj);
  }

  // Ambiance sonore
  if (scene.ambience) {
    playAmbience(scene.ambience);
  }

  // Transition fluide de la photographie
  crossfadeBackground(scene.image);

  // Mise à jour du ruban supérieur & du folio
  const zoneLabelEl = document.getElementById("zone-label");
  const sceneTitleEl = document.getElementById("scene-title");
  const stepPillEl = document.getElementById("folio-step-pill");
  const folioSubEl = document.getElementById("folio-subtitle");
  const descEl = document.getElementById("description-text");
  const hintBtn = document.getElementById("btn-scene-hint");

  if (zoneLabelEl) zoneLabelEl.textContent = `Zone ${zoneObj.roman} · ${zoneObj.name}`;
  if (sceneTitleEl) sceneTitleEl.textContent = scene.title;
  if (stepPillEl) {
    stepPillEl.textContent = isVictory
      ? "Épilogue Royal"
      : `Folio ${String(scene.step || 1).padStart(2, "0")} / 21`;
  }
  if (folioSubEl) folioSubEl.textContent = scene.title;
  if (descEl) descEl.textContent = scene.text;

  // Préchargement silencieux des prochaines photographies pour des fondus instantanés
  scene.choices.forEach((choice) => {
    if (choice.next && scenes[choice.next]?.image) {
      const preload = new Image();
      preload.src = scenes[choice.next].image;
    }
  });

  // Indice de scène optionnel
  if (hintBtn) {
    if (scene.hint) {
      hintBtn.style.display = "inline-flex";
      hintBtn.onclick = () => {
        UI.message(scene.hint, null, null, {
          kicker: "Coup de Pouce de Vauban",
          title: scene.title,
          buttonText: "Compris"
        });
      };
    } else {
      hintBtn.style.display = "none";
      hintBtn.onclick = null;
    }
  }

  renderZoneStepper(zoneObj.id, isVictory);

  // Boutons d'actions
  const grid = document.getElementById("choices-grid");
  if (grid) {
    grid.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = choice.primary ? "btn-royal" : "btn-parchment";
      const iconHtml = choice.icon && CHOICE_ICONS[choice.icon] ? CHOICE_ICONS[choice.icon] : "";
      btn.innerHTML = `${iconHtml}<span>${choice.text}</span>`;

      btn.onclick = () => {
        if (choice.next) changeScene(choice.next);
        if (choice.action && enigmaFunctions[choice.action]) {
          enigmaFunctions[choice.action]();
        }
      };
      grid.appendChild(btn);
    });
  }

  // Inventaire & badge du carnet
  UI.renderInventory(gameData.userData.inventory || []);
  UI.updateJournalBadge();
}

export async function changeScene(newSceneId) {
  const user = auth.currentUser;
  gameData.userData.currentScene = newSceneId;

  // Déplie le folio si le joueur l'avait replié pour admirer la photo
  const dock = document.getElementById("folio-dock");
  const collapseLabel = document.getElementById("collapse-label");
  if (dock?.classList.contains("is-collapsed")) {
    dock.classList.remove("is-collapsed");
    if (collapseLabel) collapseLabel.textContent = "Vue photo";
  }

  if (user) {
    try {
      await updateDoc(doc(db, "users", user.uid), { currentScene: newSceneId });
    } catch (error) {
      console.error("Erreur de sauvegarde Firebase:", error);
    }
  }
  renderScene(newSceneId);
}

window.logout = () => {
  stopAllSounds();
  return signOut(auth);
};

// Initialisation HUD & authentification obligatoire Firebase
bindGlobalHUD();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  setCurrentUser(user);
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      window.location.href = "index.html";
      return;
    }

    setUserData(userDoc.data());
    const nameElem = document.getElementById("player-name");
    if (nameElem) nameElem.textContent = gameData.userData.pseudo || "Explorateur";

    const startScene = gameData.userData.currentScene || "pont_dormant";
    renderScene(startScene);
  } catch (err) {
    console.error("Erreur de chargement du profil:", err);
    window.location.href = "index.html";
  }
});
