// js/engine/audio.js — Gestionnaire sonore immersif avec fondu & contrôle muet

const AUDIO_SPEC = {
  // Ambiances par zone
  ambiance_vent_citadelle: { src: "assets/audio/ambiance_vent_citadelle.mp3", vol: 0.52 },
  ambiance_remparts_vent:  { src: "assets/audio/ambiance_remparts_vent.mp3",  vol: 0.38 },
  ambiance_galerie:        { src: "assets/audio/ambiance_galerie.mp3",        vol: 0.42 },
  ambiance_poudriere:      { src: "assets/audio/ambiance_poudriere.mp3",      vol: 0.32 },
  ambiance_grand_puits:    { src: "assets/audio/ambiance_grand_puits.mp3",    vol: 0.48 },
  ambiance_citernes:       { src: "assets/audio/ambiance_citernes.mp3",       vol: 0.40 },
  ambiance_final:          { src: "assets/audio/ambiance_final.mp3",          vol: 0.40 },
  fanfare_victoire:        { src: "assets/audio/fanfare_victoire.mp3",        vol: 0.36 },

  // Effets sonores
  succes:                  { src: "assets/audio/succes.mp3",                  vol: 0.62 },
  erreur:                  { src: "assets/audio/erreur.mp3",                  vol: 0.48 },
  herse_ouverture:         { src: "assets/audio/herse_ouverture.mp3",         vol: 0.92 },
  bruit_frottement_papier: { src: "assets/audio/bruit_frottement_papier.mp3", vol: 0.58 },
  clic_serrure:            { src: "assets/audio/clic_serrure.mp3",            vol: 0.80 },
  bruit_compas_metal:      { src: "assets/audio/bruit_compas_metal.mp3",      vol: 0.72 },
  bruit_verre:             { src: "assets/audio/bruit_verre.mp3",             vol: 0.55 },
  clic_coffre:             { src: "assets/audio/clic_coffre.mp3",             vol: 0.72 },
  son_morse_liberte:       { src: "assets/audio/son_morse_liberte.mp3",       vol: 0.88 },
  ouverture_grille:        { src: "assets/audio/ouverture_grille.mp3",        vol: 0.72 },
  bruit_metal_leger:       { src: "assets/audio/bruit_metal_leger.mp3",       vol: 0.64 },
  bruit_roue_bois:         { src: "assets/audio/bruit_roue_bois.mp3",         vol: 0.64 },
  seau_eau_plein:          { src: "assets/audio/seau_eau_plein.mp3",          vol: 0.72 },
  bruit_valve_metal:       { src: "assets/audio/bruit_valve_metal.mp3",       vol: 0.62 },
  eau_versee:              { src: "assets/audio/eau_versee.mp3",              vol: 0.54 },
  bruit_page_papier:       { src: "assets/audio/bruit_page_papier.mp3",       vol: 0.62 },
  bruit_canon_deplace:     { src: "assets/audio/bruit_canon_deplace.mp3",     vol: 0.64 },
  bruit_feu:               { src: "assets/audio/bruit_feu.mp3",               vol: 0.55 },
  corde_rupture:           { src: "assets/audio/corde_rupture.mp3",           vol: 0.68 }
};

export const sounds = {};
const targetVolumes = {};
let isMuted = localStorage.getItem("vauban_muted") === "1";
let currentAmbienceKey = null;

for (const [key, cfg] of Object.entries(AUDIO_SPEC)) {
  const audio = new Audio(cfg.src);
  audio.preload = "none";
  audio.volume = isMuted ? 0 : cfg.vol;
  audio.muted = isMuted;
  sounds[key] = audio;
  targetVolumes[key] = cfg.vol;
}

export function getMuted() {
  return isMuted;
}

export function toggleMute() {
  isMuted = !isMuted;
  localStorage.setItem("vauban_muted", isMuted ? "1" : "0");
  for (const [key, audio] of Object.entries(sounds)) {
    audio.muted = isMuted;
    if (!isMuted) audio.volume = targetVolumes[key];
  }
  if (!isMuted && currentAmbienceKey && sounds[currentAmbienceKey]?.paused) {
    sounds[currentAmbienceKey].play().catch(() => {});
  }
  return isMuted;
}

export function playSound(name) {
  const audio = sounds[name];
  if (!audio) return;
  audio.muted = isMuted;
  audio.volume = isMuted ? 0 : targetVolumes[name];
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export function stopSound(name) {
  const audio = sounds[name];
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function playAmbience(name) {
  if (!name || !sounds[name]) return;
  if (currentAmbienceKey === name && !sounds[name].paused) return;

  stopAllAmbiance();
  currentAmbienceKey = name;

  const audio = sounds[name];
  audio.loop = name !== "fanfare_victoire";
  audio.muted = isMuted;
  audio.currentTime = 0;

  if (isMuted) {
    audio.volume = 0;
    return;
  }

  // Fondu d'entrée doux sur 700 ms
  const target = targetVolumes[name] ?? 0.45;
  audio.volume = 0.02;
  audio.play().then(() => {
    const start = performance.now();
    const fade = (now) => {
      if (currentAmbienceKey !== name || isMuted) return;
      const t = Math.min(1, (now - start) / 700);
      audio.volume = target * t;
      if (t < 1) requestAnimationFrame(fade);
    };
    requestAnimationFrame(fade);
  }).catch(() => {});
}

export function resumePendingAmbience() {
  if (isMuted || !currentAmbienceKey) return;
  const audio = sounds[currentAmbienceKey];
  if (audio && audio.paused) {
    audio.volume = targetVolumes[currentAmbienceKey] ?? 0.45;
    audio.play().catch(() => {});
  }
}

export function stopAllAmbiance() {
  Object.keys(sounds).forEach((k) => {
    if (k.startsWith("ambiance_") || k === "fanfare_victoire") {
      sounds[k].pause();
      sounds[k].currentTime = 0;
      sounds[k].loop = false;
    }
  });
  currentAmbienceKey = null;
}

export function stopAllSounds() {
  Object.values(sounds).forEach((s) => {
    s.pause();
    s.currentTime = 0;
  });
  currentAmbienceKey = null;
}
