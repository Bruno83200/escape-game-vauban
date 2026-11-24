// js/engine/state.js — État central de l'expédition

const state = {
  currentUser: null,
  userData: {
    inventory: [],
    discoveredClues: [],
    pseudo: "Explorateur",
    currentScene: "pont_dormant"
  },
  currentActiveScene: null,
  lastZone: null,
  isBusy: false
};

export const gameData = state;
export const getState = () => state;

export function setCurrentUser(val) {
  state.currentUser = val;
}

export function setUserData(val) {
  state.userData = {
    inventory: [],
    discoveredClues: [],
    pseudo: "Explorateur",
    currentScene: "pont_dormant",
    ...state.userData,
    ...val
  };
  if (!Array.isArray(state.userData.inventory)) state.userData.inventory = [];
  if (!Array.isArray(state.userData.discoveredClues)) state.userData.discoveredClues = [];
}

export function setCurrentActiveScene(val) {
  state.currentActiveScene = val;
}

export function setLastZone(val) {
  state.lastZone = val;
}

export function setBusy(val) {
  state.isBusy = val;
}

export const userData = state.userData;
