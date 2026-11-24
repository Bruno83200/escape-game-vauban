// js/ui.js — Interface Parchemin, Loupe Plein Écran, Carnet d'Architecte & Utilitaires

import { ITEM_CATALOG, CLUE_CATALOG, ZONES, scenes, SCENE_ORDER } from "./data/scenes.js";
import { gameData } from "./engine/state.js";

let toastTimer = null;

function initLightboxOnce() {
  const lb = document.getElementById("lightbox-modal");
  if (!lb || lb.dataset.bound) return;
  lb.dataset.bound = "1";

  const img = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  const zoomBtn = document.getElementById("lightbox-zoom-toggle");

  const close = () => {
    lb.classList.remove("is-open");
    img.classList.remove("is-zoomed");
  };

  closeBtn?.addEventListener("click", close);
  lb.addEventListener("click", (e) => {
    if (e.target === lb) close();
  });

  const toggleZoom = () => img.classList.toggle("is-zoomed");
  zoomBtn?.addEventListener("click", toggleZoom);
  img?.addEventListener("click", toggleZoom);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lb.classList.contains("is-open")) {
      close();
    }
  });
}

function getAllDiscoveredClues() {
  const set = new Set(gameData.userData?.discoveredClues || []);
  const currentIdx = SCENE_ORDER.indexOf(gameData.currentActiveScene || gameData.userData?.currentScene || "pont_dormant");

  // Auto-déblocage cohérent pour les comptes existants déjà avancés dans le jeu
  if (currentIdx >= SCENE_ORDER.indexOf("courtine_devoilee")) set.add("archives_chronologie");
  if (currentIdx >= SCENE_ORDER.indexOf("courtine_calcul")) set.add("inscription_latine");
  if (currentIdx >= SCENE_ORDER.indexOf("victoire")) set.add("guerite_reine");

  return Array.from(set).filter((id) => CLUE_CATALOG[id]);
}

export const UI = {
  openLightbox(imagePath, caption = "") {
    initLightboxOnce();
    const lb = document.getElementById("lightbox-modal");
    const img = document.getElementById("lightbox-img");
    const cap = document.getElementById("lightbox-caption");
    if (!lb || !img) return;
    img.src = imagePath;
    img.classList.remove("is-zoomed");
    if (cap) cap.textContent = caption || "Cliquez sur l'image pour zoomer";
    lb.classList.add("is-open");
  },

  toast(message) {
    const el = document.getElementById("folio-toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-shown"), 3200);
  },

  message(text, callback = null, imagePath = null, options = {}) {
    const modal = document.getElementById("custom-modal");
    const modalText = document.getElementById("modal-text");
    const modalBtn = document.getElementById("modal-btn");
    const modalThumb = document.getElementById("modal-thumb-wrap");
    const modalImg = document.getElementById("modal-illustration");
    const modalTitle = document.getElementById("modal-title-text");
    const modalKicker = document.getElementById("modal-kicker");
    const modalRow = document.getElementById("modal-body-row");
    const modalExtra = document.getElementById("modal-extra");

    if (!modal || !modalText || !modalBtn) {
      if (callback) callback();
      return;
    }

    if (modalKicker) modalKicker.textContent = options.kicker || "Note de l'Architecte";
    if (modalTitle) modalTitle.textContent = options.title || "Citadelle de Besançon";
    modalText.textContent = text;
    if (modalExtra) modalExtra.innerHTML = options.extraHtml || "";
    modalBtn.textContent = options.buttonText || "Continuer";

    if (imagePath && modalThumb && modalImg) {
      modalImg.src = imagePath;
      modalThumb.style.display = "block";
      modalRow?.classList.remove("stacked");
      modalThumb.onclick = () => UI.openLightbox(imagePath, options.title || "Document d'archive");
    } else if (modalThumb) {
      modalThumb.style.display = "none";
      modalRow?.classList.add("stacked");
    }

    modal.classList.add("is-open");

    const closeAndRun = () => {
      modal.classList.remove("is-open");
      modalBtn.onclick = null;
      if (callback) callback();
    };

    modalBtn.onclick = closeAndRun;
    modalBtn.focus();
  },

  showItem(title, text, imagePath, callback = null) {
    const modal = document.getElementById("item-modal");
    const modalTitle = document.getElementById("item-modal-title");
    const modalText = document.getElementById("item-modal-text");
    const modalImg = document.getElementById("item-modal-img");
    const modalMedia = document.getElementById("item-modal-media");
    const modalBtn = document.getElementById("item-modal-btn");

    if (!modal) {
      if (callback) callback();
      return;
    }

    if (modalTitle) modalTitle.textContent = title;
    if (modalText) modalText.textContent = text;
    if (modalImg) modalImg.src = imagePath;
    if (modalMedia) {
      modalMedia.onclick = () => UI.openLightbox(imagePath, title);
    }

    modal.classList.add("is-open");

    modalBtn.onclick = () => {
      modal.classList.remove("is-open");
      modalBtn.onclick = null;
      if (callback) callback();
    };
    modalBtn.focus();
  },

  renderInventory(items = []) {
    const container = document.getElementById("inventory-slots");
    if (!container) return;

    container.innerHTML = "";
    if (!items || items.length === 0) {
      container.innerHTML = `<span class="inventory-empty">Aucun objet recueilli pour l'instant</span>`;
      return;
    }

    items.forEach((itemName) => {
      const meta = ITEM_CATALOG[itemName] || {
        title: itemName,
        image: "assets/images/items/papyrus.webp",
        description: "Objet conservé dans votre sac d'explorateur."
      };

      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "inv-chip";
      chip.title = `Examiner : ${meta.title}`;
      chip.innerHTML = `<img src="${meta.image}" alt="" /><span>${meta.title}</span>`;
      chip.onclick = () => {
        UI.showItem(meta.title, meta.description, meta.image);
      };
      container.appendChild(chip);
    });
  },

  updateJournalBadge() {
    const badge = document.getElementById("journal-badge");
    if (!badge) return;
    const count = getAllDiscoveredClues().length + (gameData.userData?.inventory?.length || 0);
    badge.textContent = String(count);
    badge.classList.toggle("has-items", count > 0);
  },

  openJournal(defaultTab = "clues") {
    const modal = document.getElementById("journal-modal");
    const content = document.getElementById("journal-content");
    const closeBtn = document.getElementById("journal-close");
    if (!modal || !content) return;

    const tabs = modal.querySelectorAll(".journal-tab");

    const renderTab = (tabName) => {
      tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.jtab === tabName));

      if (tabName === "clues") {
        const clueIds = getAllDiscoveredClues();
        if (clueIds.length === 0) {
          content.innerHTML = `
            <div class="journal-empty">
              Votre carnet d'archives est encore vierge.<br/>
              Explorez la Citadelle et consultez les documents anciens pour y consigner vos relevés.
            </div>`;
          return;
        }
        content.innerHTML = `<div class="clue-grid"></div>`;
        const grid = content.querySelector(".clue-grid");
        clueIds.forEach((id) => {
          const clue = CLUE_CATALOG[id];
          const card = document.createElement("article");
          card.className = "clue-card";
          card.innerHTML = `
            <div class="clue-card-img" title="Cliquer pour examiner à la loupe">
              <img src="${clue.image}" alt="${clue.title}" />
            </div>
            <div class="clue-card-body">
              <h4>${clue.title}</h4>
              <p>${clue.text}</p>
            </div>`;
          card.querySelector(".clue-card-img").onclick = () => UI.openLightbox(clue.image, clue.title);
          grid.appendChild(card);
        });
      } else if (tabName === "route") {
        const activeScene = scenes[gameData.currentActiveScene] || scenes.pont_dormant;
        const currentZone = activeScene.zone || 1;
        const isVictory = gameData.currentActiveScene === "victoire" || gameData.currentActiveScene === "hall_of_fame";

        content.innerHTML = `<div class="route-timeline"></div>`;
        const list = content.querySelector(".route-timeline");
        ZONES.forEach((z) => {
          const done = isVictory || z.id < currentZone;
          const active = !isVictory && z.id === currentZone;
          const statusClass = done ? "done" : active ? "current" : "locked";
          const statusLabel = done ? "Franchie ✓" : active ? "En cours" : "À découvrir";

          const row = document.createElement("div");
          row.className = `route-zone-card ${done ? "is-done" : active ? "is-current" : ""}`;
          row.innerHTML = `
            <div class="route-zone-info">
              <h4>Zone ${z.roman} — ${z.name}</h4>
              <p>${z.desc}</p>
            </div>
            <span class="route-status ${statusClass}">${statusLabel}</span>`;
          list.appendChild(row);
        });
      } else if (tabName === "bag") {
        const items = gameData.userData?.inventory || [];
        if (items.length === 0) {
          content.innerHTML = `
            <div class="journal-empty">
              Votre sac d'explorateur est vide pour le moment.<br/>
              Fouillez les remparts et les guérites pour recueillir les instruments de Vauban.
            </div>`;
          return;
        }
        content.innerHTML = `<div class="clue-grid"></div>`;
        const grid = content.querySelector(".clue-grid");
        items.forEach((name) => {
          const meta = ITEM_CATALOG[name] || {
            title: name,
            image: "assets/images/items/papyrus.webp",
            description: "Pièce consignée lors de votre exploration."
          };
          const card = document.createElement("article");
          card.className = "clue-card";
          card.innerHTML = `
            <div class="clue-card-img" title="Cliquer pour examiner">
              <img src="${meta.image}" alt="${meta.title}" />
            </div>
            <div class="clue-card-body">
              <h4>${meta.title}</h4>
              <p>${meta.description}</p>
            </div>`;
          card.querySelector(".clue-card-img").onclick = () => UI.openLightbox(meta.image, meta.title);
          grid.appendChild(card);
        });
      }
    };

    tabs.forEach((t) => {
      t.onclick = () => renderTab(t.dataset.jtab);
    });

    closeBtn.onclick = () => modal.classList.remove("is-open");
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove("is-open");
    };

    renderTab(defaultTab);
    modal.classList.add("is-open");
  }
};

export function checkAnswer(input, validAnswers) {
  const clean = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .trim()
      .replace(/\s+/g, " ");

  const target = clean(input);
  return validAnswers.map(clean).includes(target);
}
