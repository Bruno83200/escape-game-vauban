// js/engine/state.js

const state = {
    currentUser: null,
    userData: { 
        inventory: [],
        pseudo: "Explorateur",
        currentScene: "pont_dormant"
    },
    currentActiveScene: null,
    isBusy: false
};

// On exporte l'objet global pour un accès direct
export const gameData = state;

// On exporte une fonction pour récupérer l'état
export const getState = () => state;

// Setters pour modifier l'état proprement
export function setCurrentUser(val) { state.currentUser = val; }
export function setUserData(val) { 
    // On fusionne les données pour ne pas perdre les références
    state.userData = { ...state.userData, ...val }; 
}
export function setCurrentActiveScene(val) { state.currentActiveScene = val; }
export function setBusy(val) { state.isBusy = val; }

// Pour la compatibilité avec tes anciens imports
export const userData = state.userData;