// js/auth.js — Authentification obligatoire Firebase (Académie Royale)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { UI } from "./ui.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLoginMode = false;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("auth-form");
  const tabRegister = document.getElementById("tab-register");
  const tabLogin = document.getElementById("tab-login");
  const formTitle = document.getElementById("form-title");
  const formSubtitle = document.getElementById("form-subtitle");
  const groupPseudo = document.getElementById("group-pseudo");
  const submitBtn = document.getElementById("submit-auth");
  const feedback = document.getElementById("auth-feedback");
  const passwordInput = document.getElementById("password");
  const togglePwdBtn = document.getElementById("toggle-password");

  const setFeedback = (msg, type = "") => {
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.className = "auth-feedback" + (type ? ` is-${type}` : "");
  };

  const setMode = (login) => {
    isLoginMode = login;
    tabRegister.classList.toggle("is-active", !login);
    tabRegister.setAttribute("aria-selected", String(!login));
    tabLogin.classList.toggle("is-active", login);
    tabLogin.setAttribute("aria-selected", String(login));

    groupPseudo.style.display = login ? "none" : "block";
    formTitle.textContent = login ? "REPRENDRE L'EXPÉDITION" : "REJOINDRE L'EXPÉDITION";
    formSubtitle.textContent = login
      ? "Présentez vos codes de l'Académie pour rouvrir votre carnet"
      : "Enregistrez votre carnet pour sauvegarder votre avancée";
    submitBtn.querySelector("span").textContent = login
      ? "Se connecter à la Citadelle"
      : "Pénétrer dans la Citadelle";
    setFeedback("");
  };

  tabRegister?.addEventListener("click", () => setMode(false));
  tabLogin?.addEventListener("click", () => setMode(true));

  togglePwdBtn?.addEventListener("click", () => {
    const isPwd = passwordInput.type === "password";
    passwordInput.type = isPwd ? "text" : "password";
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setFeedback("");

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const pseudo = document.getElementById("pseudo").value.trim();

    if (!email || !password) {
      setFeedback("L'Académie exige un courrier électronique et un code secret pour vous laisser passer.", "error");
      return;
    }

    if (!isLoginMode && !pseudo) {
      setFeedback("L'Histoire doit retenir votre nom. Veuillez saisir votre nom d'explorateur.", "error");
      return;
    }

    submitBtn.disabled = true;
    const labelSpan = submitBtn.querySelector("span");
    const prevLabel = labelSpan.textContent;
    labelSpan.textContent = "Vérification du sceau…";

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
        UI.message(
          "Ravi de vous revoir au pied des remparts. Votre carnet d'architecte vous attend…",
          () => { window.location.href = "game.html"; },
          null,
          { kicker: "Accréditation Validée", title: "Bon retour à Besançon", buttonText: "Ouvrir mon carnet" }
        );
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          pseudo,
          currentScene: "pont_dormant",
          inventory: [],
          discoveredClues: [],
          createdAt: new Date()
        });

        UI.message(
          `Bienvenue, explorateur ${pseudo}. Votre carnet est scellé : les portes de la Citadelle s'ouvrent devant vous !`,
          () => { window.location.href = "game.html"; },
          null,
          { kicker: "Nouveau Carnet Ouvert", title: "L'Expédition Commence", buttonText: "Entrer sur le Pont Dormant" }
        );
      }
    } catch (error) {
      console.error("Erreur Auth:", error);
      let msg = "Une erreur est survenue lors de l'authentification.";
      if (error.code === "auth/email-already-in-use") {
        msg = "Ce courrier est déjà enregistré à l'Académie. Passez sur l'onglet « Déjà Inscrit » pour vous connecter.";
      } else if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        msg = "Vos codes secrets sont incorrects. Vérifiez votre email et votre mot de passe.";
      } else if (error.code === "auth/invalid-email") {
        msg = "Le format de votre courrier électronique semble invalide.";
      } else if (error.code === "auth/weak-password") {
        msg = "Votre code secret doit comporter au moins 6 caractères.";
      } else if (error.code === "auth/too-many-requests") {
        msg = "Trop de tentatives. Patientez quelques instants avant de réessayer.";
      }
      setFeedback(msg, "error");
    } finally {
      submitBtn.disabled = false;
      labelSpan.textContent = prevLabel;
    }
  });
});
