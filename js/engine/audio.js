// js/engine/audio.js

export const sounds = {
    // --- AMBIANCES (Boucles) ---
    ambiance_vent_citadelle: new Audio('assets/audio/ambiance_vent_citadelle.mp3'),    
    succes: new Audio('assets/audio/succes.mp3'),
    erreur: new Audio('assets/audio/erreur.mp3'),
    herse_ouverture: new Audio('assets/audio/herse_ouverture.mp3'),
    bruit_frottement_papier: new Audio('assets/audio/bruit_frottement_papier.mp3'),
    clic_serrure: new Audio('assets/audio/clic_serrure.mp3'),
    ambiance_remparts_vent: new Audio('assets/audio/ambiance_remparts_vent.mp3'),
    bruit_compas_metal: new Audio('assets/audio/bruit_compas_metal.mp3'),
    ambiance_galerie: new Audio('assets/audio/ambiance_galerie.mp3'),
    bruit_verre: new Audio('assets/audio/bruit_verre.mp3'),
    clic_coffre: new Audio('assets/audio/clic_coffre.mp3'),
    son_morse_liberte: new Audio('assets/audio/son_morse_liberte.mp3'),
    ouverture_grille: new Audio('assets/audio/ouverture_grille.mp3'),
    ambiance_poudriere: new Audio('assets/audio/ambiance_poudriere.mp3'),
    bruit_metal_leger: new Audio('assets/audio/bruit_metal_leger.mp3'),
    ambiance_grand_puits: new Audio('assets/audio/ambiance_grand_puits.mp3'),
    bruit_roue_bois: new Audio('assets/audio/bruit_roue_bois.mp3'),
    seau_eau_plein: new Audio('assets/audio/seau_eau_plein.mp3'),
    ambiance_citernes: new Audio('assets/audio/ambiance_citernes.mp3'),
    bruit_valve_metal: new Audio('assets/audio/bruit_valve_metal.mp3'),
    eau_versee: new Audio('assets/audio/eau_versee.mp3'),
    ambiance_final: new Audio('assets/audio/ambiance_final.mp3'),
    bruit_page_papier: new Audio('assets/audio/bruit_page_papier.mp3'),
    bruit_canon_deplace: new Audio('assets/audio/bruit_canon_deplace.mp3'),
    fanfare_victoire: new Audio('assets/audio/fanfare_victoire.mp3'),
    bruit_feu: new Audio('assets/audio/bruit_feu.mp3'),
    corde_rupture: new Audio('assets/audio/corde_rupture.mp3'),
};

// RÉGLAGES PRÉCIS DES VOLUMES (Ajuste selon tes fichiers)
sounds.ambiance_vent_citadelle.volume = 0.6; // On baisse le vent pour laisser la place aux effets
sounds.succes.volume = 0.6;
sounds.erreur.volume = 0.5;
sounds.herse_ouverture.volume = 1.0; 
sounds.bruit_frottement_papier.volume = 0.6;
sounds.clic_serrure.volume = 0.8;
sounds.ambiance_remparts_vent.volume = 0.4;
sounds.bruit_compas_metal.volume = 0.7;
sounds.ambiance_galerie.volume = 0.4; // Plus bas pour l'écho des grottes
sounds.bruit_verre.volume = 0.6;
sounds.clic_coffre.volume = 0.7;
sounds.son_morse_liberte.volume = 0.9;
sounds.ouverture_grille.volume = 0.7;
sounds.ambiance_poudriere.volume = 0.3;
sounds.bruit_metal_leger.volume = 0.6;
sounds.ambiance_grand_puits.volume = 0.5;
sounds.bruit_roue_bois.volume = 0.6;
sounds.seau_eau_plein.volume = 0.7;
sounds.ambiance_citernes.volume = 0.4;
sounds.bruit_valve_metal.volume = 0.6;
sounds.eau_versee.volume = 0.5;
sounds.ambiance_final.volume = 0.4;
sounds.bruit_page_papier.volume = 0.6;
sounds.bruit_canon_deplace.volume = 0.6;
sounds.fanfare_victoire.volume = 0.3;
sounds.bruit_feu.volume = 0.5;
sounds.corde_rupture.volume = 0.6;


export function playSound(name) {
    if (sounds[name]) {
        sounds[name].currentTime = 0;
        sounds[name].play().catch(e => console.warn("Audio bloqué par le navigateur : cliquez sur la page d'abord."));
    }
}

export function stopAllAmbiance() {
    Object.values(sounds).forEach(s => {
        if (s.loop) {
            s.pause();
            s.currentTime = 0;
            s.loop = false;
        }
    });
}

export function stopAllSounds() {
    Object.values(sounds).forEach(s => {
        s.pause();
        s.currentTime = 0;
    });
}