// js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js"; 
import { UI } from "./ui.js";

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLoginMode = false; // Par défaut, on est en mode inscription

document.addEventListener('DOMContentLoaded', () => {
    const toggleLink = document.getElementById('toggle-link');
    const submitBtn = document.getElementById('submit-auth');
    const formTitle = document.getElementById('form-title');
    const groupPseudo = document.getElementById('group-pseudo');

    // Basculer entre Connexion et Inscription
    if (toggleLink) {
        toggleLink.onclick = () => {
            isLoginMode = !isLoginMode;
            formTitle.innerText = isLoginMode ? "CONNEXION" : "REJOINDRE L'EXPÉDITION";
            toggleLink.innerText = isLoginMode ? "Nouvel explorateur ? S'inscrire" : "Déjà inscrit ? Se connecter";
            groupPseudo.style.display = isLoginMode ? "none" : "block";
            submitBtn.innerText = isLoginMode ? "SE CONNECTER" : "PÉNÉTRER DANS LA CITADELLE";
        };
    }

    // Gestion du clic sur le bouton principal
    if (submitBtn) {
        submitBtn.onclick = async () => {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const pseudo = document.getElementById('pseudo').value;

            if (!email || !password) {
                UI.message("L'Académie exige un email et un code secret pour vous laisser passer.");
                return;
            }

            try {
                if (isLoginMode) {
                    // --- CAS CONNEXION ---
                    await signInWithEmailAndPassword(auth, email, password);
                    UI.message("Ravi de vous revoir. La Citadelle vous attend...", () => {
                        window.location.href = "game.html";
                    });
                } else {
                    // --- CAS INSCRIPTION ---
                    if (!pseudo) { 
                        UI.message("L'Histoire doit retenir votre nom. Veuillez saisir un pseudo."); 
                        return; 
                    }

                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;

                    // On crée le document de sauvegarde dans Firestore
                    await setDoc(doc(db, "users", user.uid), {
                        pseudo: pseudo,
                        currentScene: "pont_dormant", // La première scène du scénario
                        inventory: [],
                        createdAt: new Date()
                    });

                    UI.message(`Bienvenue, explorateur ${pseudo}. L'aventure commence !`, () => {
                        window.location.href = "game.html";
                    });
                }
            } catch (error) {
                console.error("Erreur Auth:", error);
                let msg = "Une erreur est survenue lors de l'authentification.";
                if (error.code === "auth/email-already-in-use") msg = "Ce courrier est déjà enregistré à l'Académie.";
                if (error.code === "auth/invalid-credential") msg = "Vos codes secrets sont incorrects.";
                if (error.code === "auth/weak-password") msg = "Votre code secret doit comporter au moins 6 caractères.";
                
                UI.message(msg);
            }
        };
    }
});