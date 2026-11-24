// js/minigames/workbench.js — Les 12 ateliers interactifs & instruments de Vauban

import { UI, checkAnswer } from "../ui.js";
import { playSound, stopSound, sounds } from "../engine/audio.js";

let activeCleanup = null;

function closeWorkbench() {
  const modal = document.getElementById("workbench-modal");
  if (typeof activeCleanup === "function") {
    try { activeCleanup(); } catch (_) {}
    activeCleanup = null;
  }
  modal?.classList.remove("is-open");
}

function openWorkbench({ kicker, title, instruction, hint = "", onCleanup = null }) {
  closeWorkbench();

  const modal = document.getElementById("workbench-modal");
  const kickerEl = document.getElementById("workbench-kicker");
  const titleEl = document.getElementById("workbench-title");
  const instrEl = document.getElementById("workbench-instruction");
  const stageEl = document.getElementById("workbench-stage");
  const statusEl = document.getElementById("workbench-status");
  const footerEl = document.getElementById("workbench-footer");
  const hintBtn = document.getElementById("workbench-hint-btn");
  const hintBox = document.getElementById("workbench-hint-box");
  const closeBtn = document.getElementById("workbench-close");

  kickerEl.textContent = kicker || "Atelier d'Ingénieur";
  titleEl.textContent = title || "Épreuve de Vauban";
  instrEl.textContent = instruction || "";
  stageEl.innerHTML = "";
  footerEl.innerHTML = "";
  statusEl.className = "workbench-status";
  statusEl.textContent = "";

  if (hint) {
    hintBtn.style.display = "inline-flex";
    hintBox.textContent = `Indice de Vauban : ${hint}`;
    hintBox.classList.remove("is-open");
    hintBtn.onclick = () => hintBox.classList.toggle("is-open");
  } else {
    hintBtn.style.display = "none";
    hintBox.classList.remove("is-open");
  }

  const keyHandler = (e) => {
    if (e.key === "Escape") {
      const lb = document.getElementById("lightbox-modal");
      if (lb && lb.classList.contains("is-open")) return;
      closeWorkbench();
    }
  };
  document.addEventListener("keydown", keyHandler);

  activeCleanup = () => {
    document.removeEventListener("keydown", keyHandler);
    if (typeof onCleanup === "function") onCleanup();
  };

  closeBtn.onclick = closeWorkbench;
  modal.onclick = (e) => {
    if (e.target === modal) closeWorkbench();
  };

  modal.classList.add("is-open");

  return {
    stageEl,
    footerEl,
    close: closeWorkbench,
    setCleanup(fn) {
      const prev = activeCleanup;
      activeCleanup = () => {
        try { fn(); } catch (_) {}
        if (prev) prev();
      };
    },
    setStatus(text, type = "info") {
      statusEl.textContent = text;
      statusEl.className = `workbench-status is-${type}`;
      if (type === "error") {
        statusEl.classList.remove("shake-error");
        void statusEl.offsetWidth;
        statusEl.classList.add("shake-error");
      }
    }
  };
}

/* ==========================================================================
   1. SÉLECTION DIRECTE SUR PLANCHE PHOTO (Blasons, Guérites A/B/C, Poudrière)
   ========================================================================== */
export function runHotspotPuzzle({
  kicker,
  title,
  instruction,
  hint,
  image,
  wide = false,
  hotspots,
  onSuccess
}) {
  const wb = openWorkbench({ kicker, title, instruction, hint });
  let solved = false;

  wb.stageEl.innerHTML = `
    <div class="hotspot-stage ${wide ? "wide" : ""}">
      <img src="${image}" alt="${title}" />
      <button type="button" class="plate-zoom-btn" id="hs-zoom">🔍 Examiner à la loupe</button>
    </div>`;

  const stage = wb.stageEl.querySelector(".hotspot-stage");
  wb.stageEl.querySelector("#hs-zoom").onclick = () => UI.openLightbox(image, title);

  hotspots.forEach((hs) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hotspot-btn";
    btn.style.left = hs.left;
    btn.style.top = hs.top;
    btn.style.width = hs.width;
    btn.style.height = hs.height;
    btn.innerHTML = `<span class="hotspot-tag">${hs.label}</span>`;

    btn.onclick = () => {
      if (solved) return;
      if (hs.correct) {
        solved = true;
        btn.classList.add("is-correct");
        wb.setStatus(hs.successText || "Mécanisme enclenché !", "success");
        setTimeout(() => {
          wb.close();
          onSuccess(hs);
        }, 700);
      } else {
        playSound("erreur");
        btn.classList.add("is-wrong");
        wb.setStatus(hs.errorText || "Ce n'est pas le bon élément. Observez attentivement.", "error");
        setTimeout(() => btn.classList.remove("is-wrong"), 850);
      }
    };
    stage.appendChild(btn);
  });

  wb.footerEl.innerHTML = `
    <span class="folio-tag">Cliquez directement sur l'élément choisi</span>
    <button type="button" class="btn-parchment" id="hs-cancel">Refermer</button>`;
  wb.footerEl.querySelector("#hs-cancel").onclick = wb.close;
}

/* ==========================================================================
   2. FROTTIS AU GRAPHITE SUR PIERRE (Courtine Saint-Étienne -> 1674)
   ========================================================================== */
export function runGraphiteRubbingPuzzle({ onSuccess }) {
  const wb = openWorkbench({
    kicker: "Zone I · Relevé Lapidaire",
    title: "Frottis de la Courtine Saint-Étienne",
    instruction: "Frottez votre bâton de graphite sur la pierre (à la souris ou au doigt) pour faire apparaître la date gravée, puis réglez le verrou de pierre à 4 chiffres.",
    hint: "Frottez le centre de la dalle : l'année de conquête de Besançon par Louis XIV apparaît — 1674."
  });

  wb.stageEl.innerHTML = `
    <div class="rubbing-layout">
      <div>
        <div class="rubbing-canvas-box">
          <canvas id="rubbing-canvas" width="520" height="300"></canvas>
        </div>
        <div class="rubbing-meter">
          <span>Progression du frottis</span>
          <div class="rubbing-bar"><div id="rubbing-fill" class="rubbing-bar-fill"></div></div>
          <strong id="rubbing-pct">0%</strong>
        </div>
      </div>

      <div class="dial-bank">
        <div class="dial-bank-title">Verrou de la Courtine</div>
        <div id="rubbing-dials" class="dial-row"></div>
        <div class="dial-keyboard-hint">Astuce : utilisez les flèches ou tapez les chiffres au clavier</div>
      </div>
    </div>`;

  // --- Construction du canvas de pierre + masque à gratter au graphite ---
  const canvas = wb.stageEl.querySelector("#rubbing-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  // Offscreen 1 : texture de pierre révélée avec 1674 gravé en relief
  const revealCanvas = document.createElement("canvas");
  revealCanvas.width = W;
  revealCanvas.height = H;
  const rctx = revealCanvas.getContext("2d");

  const grad = rctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, "#ede4d0");
  grad.addColorStop(0.5, "#dfd2b5");
  grad.addColorStop(1, "#cbb995");
  rctx.fillStyle = grad;
  rctx.fillRect(0, 0, W, H);

  // Grain minéral graphite
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const a = Math.random() * 0.16;
    rctx.fillStyle = Math.random() > 0.45 ? `rgba(38,32,26,${a})` : `rgba(255,250,240,${a})`;
    rctx.fillRect(x, y, 2, 1.5);
  }

  // Cadre lapidaire & traits de maçon
  rctx.strokeStyle = "rgba(45, 36, 28, 0.45)";
  rctx.lineWidth = 3;
  rctx.strokeRect(24, 24, W - 48, H - 48);
  rctx.lineWidth = 1;
  rctx.strokeRect(32, 32, W - 64, H - 64);

  // Hachures graphite de fond
  rctx.strokeStyle = "rgba(42, 36, 32, 0.22)";
  rctx.lineWidth = 1.6;
  for (let x = -H; x < W + H; x += 9) {
    rctx.beginPath();
    rctx.moveTo(x, 36);
    rctx.lineTo(x + 90, H - 36);
    rctx.stroke();
  }

  // Inscription gravée "1674" façon frottis au fusain
  rctx.save();
  rctx.font = "700 104px Cinzel, Georgia, serif";
  rctx.textAlign = "center";
  rctx.textBaseline = "middle";
  rctx.fillStyle = "rgba(250, 244, 232, 0.92)";
  rctx.fillText("1 6 7 4", W / 2 + 2, H / 2 - 4);
  rctx.lineWidth = 3.5;
  rctx.strokeStyle = "#2b241e";
  rctx.strokeText("1 6 7 4", W / 2, H / 2 - 6);
  rctx.font = "italic 600 20px 'Cormorant Garamond', Georgia, serif";
  rctx.fillStyle = "#3b3026";
  rctx.fillText("ANNO DOMINI · BESANÇON · LOUIS XIV", W / 2, H - 56);
  rctx.restore();

  // Offscreen 2 : feuille vierge couvrant la gravure
  const coverCanvas = document.createElement("canvas");
  coverCanvas.width = W;
  coverCanvas.height = H;
  const cctx = coverCanvas.getContext("2d");

  const cgrad = cctx.createLinearGradient(0, 0, W, H);
  cgrad.addColorStop(0, "#d7cbb4");
  cgrad.addColorStop(1, "#c5b598");
  cctx.fillStyle = cgrad;
  cctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 1400; i++) {
    cctx.fillStyle = `rgba(92, 74, 52, ${Math.random() * 0.1})`;
    cctx.fillRect(Math.random() * W, Math.random() * H, 3, 2);
  }

  cctx.fillStyle = "rgba(74, 58, 43, 0.45)";
  cctx.font = "italic 600 22px 'Cormorant Garamond', Georgia, serif";
  cctx.textAlign = "center";
  cctx.fillText("Frottez ici avec le bâton de graphite…", W / 2, H / 2);

  function composite() {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(revealCanvas, 0, 0);
    ctx.drawImage(coverCanvas, 0, 0);
  }
  composite();

  // Suivi de zone grattée (grille 16x8 dans le rectangle central des chiffres)
  const cells = new Set();
  const totalCells = 42;
  let drawing = false;
  let lastSoundAt = 0;
  const fillEl = wb.stageEl.querySelector("#rubbing-fill");
  const pctEl = wb.stageEl.querySelector("#rubbing-pct");

  function rubAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    const y = ((clientY - rect.top) / rect.height) * H;

    cctx.save();
    cctx.globalCompositeOperation = "destination-out";
    // Coup de fusain organique incliné
    for (let k = 0; k < 5; k++) {
      const ox = (Math.random() - 0.5) * 18;
      const oy = (Math.random() - 0.5) * 14;
      cctx.beginPath();
      cctx.ellipse(x + ox, y + oy, 22, 11, -0.45, 0, Math.PI * 2);
      cctx.fillStyle = "rgba(0,0,0,0.42)";
      cctx.fill();
    }
    cctx.restore();
    composite();

    if (x > 70 && x < W - 70 && y > 70 && y < H - 70) {
      const gx = Math.floor((x - 70) / ((W - 140) / 14));
      const gy = Math.floor((y - 70) / ((H - 140) / 3));
      cells.add(`${gx}_${gy}`);
      const pct = Math.min(100, Math.round((cells.size / totalCells) * 100));
      fillEl.style.width = `${pct}%`;
      pctEl.textContent = `${pct}%`;
    }

    const now = Date.now();
    if (now - lastSoundAt > 950) {
      lastSoundAt = now;
      playSound("bruit_frottement_papier");
    }
  }

  canvas.addEventListener("pointerdown", (e) => {
    drawing = true;
    canvas.setPointerCapture(e.pointerId);
    rubAt(e.clientX, e.clientY);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drawing) return;
    rubAt(e.clientX, e.clientY);
  });
  canvas.addEventListener("pointerup", () => { drawing = false; });
  canvas.addEventListener("pointercancel", () => { drawing = false; });

  // --- Verrou à 4 molettes ---
  const dialMount = wb.stageEl.querySelector("#rubbing-dials");
  const dialCtrl = mountDialWheels(dialMount, {
    digits: 4,
    initial: [1, 6, 0, 0],
    onSubmit: validate
  });
  wb.setCleanup(dialCtrl.cleanup);

  function validate() {
    const val = dialCtrl.getValue();
    if (checkAnswer(val, ["1674"])) {
      wb.setStatus("Le code 1674 déverrouille la pierre : un escalier dérobé s'ouvre !", "success");
      setTimeout(() => {
        wb.close();
        onSuccess();
      }, 650);
    } else {
      playSound("erreur");
      wb.setStatus("Le verrou ne cède pas. Frottez davantage la dalle pour lire les 4 chiffres gravés.", "error");
    }
  }

  wb.footerEl.innerHTML = `
    <button type="button" class="btn-parchment" id="rub-cancel">Refermer</button>
    <button type="button" class="btn-royal" id="rub-submit">Valider la date gravée</button>`;
  wb.footerEl.querySelector("#rub-cancel").onclick = wb.close;
  wb.footerEl.querySelector("#rub-submit").onclick = validate;
}

/* ==========================================================================
   3. SERRURES & CADRANS À MOLETTES EN LAITON (4706, 440, 10081678)
   ========================================================================== */
function mountDialWheels(container, { digits, groups = null, labels = null, initial = null, compact = false, onSubmit = null }) {
  const values = initial && initial.length === digits ? [...initial] : new Array(digits).fill(0);
  const digitEls = [];
  let cursor = 0;

  container.innerHTML = "";
  for (let i = 0; i < digits; i++) {
    if (groups && groups[i]) {
      const sep = document.createElement("span");
      sep.className = "dial-sep";
      sep.textContent = groups[i];
      container.appendChild(sep);
    }

    const wheel = document.createElement("div");
    wheel.className = `dial-wheel ${compact ? "compact" : ""}`;

    const up = document.createElement("button");
    up.type = "button";
    up.className = "dial-step-btn";
    up.textContent = "▲";
    up.setAttribute("aria-label", `Augmenter le chiffre ${i + 1}`);

    const face = document.createElement("div");
    face.className = "dial-digit";
    face.textContent = String(values[i]);

    const down = document.createElement("button");
    down.type = "button";
    down.className = "dial-step-btn";
    down.textContent = "▼";
    down.setAttribute("aria-label", `Diminuer le chiffre ${i + 1}`);

    const step = (delta) => {
      values[i] = (values[i] + delta + 10) % 10;
      face.textContent = String(values[i]);
      cursor = i;
    };

    up.onclick = () => step(1);
    down.onclick = () => step(-1);
    face.addEventListener("wheel", (e) => {
      e.preventDefault();
      step(e.deltaY < 0 ? 1 : -1);
    }, { passive: false });

    wheel.append(up, face, down);
    if (labels && labels[i]) {
      const lbl = document.createElement("span");
      lbl.className = "dial-unit-label";
      lbl.textContent = labels[i];
      wheel.appendChild(lbl);
    }
    container.appendChild(wheel);
    digitEls.push(face);
  }

  const keyHandler = (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
    if (/^[0-9]$/.test(e.key)) {
      values[cursor] = Number(e.key);
      digitEls[cursor].textContent = e.key;
      cursor = (cursor + 1) % digits;
    } else if (e.key === "Backspace") {
      cursor = (cursor - 1 + digits) % digits;
      values[cursor] = 0;
      digitEls[cursor].textContent = "0";
    } else if (e.key === "Enter" && typeof onSubmit === "function") {
      e.preventDefault();
      onSubmit();
    }
  };
  document.addEventListener("keydown", keyHandler);

  return {
    getValue: () => values.join(""),
    cleanup: () => document.removeEventListener("keydown", keyHandler)
  };
}

export function runDialLockPuzzle({
  kicker,
  title,
  instruction,
  hint,
  image,
  imageCaption,
  dialTitle,
  digits,
  groups = null,
  labels = null,
  compact = false,
  scratchpadHtml = "",
  validAnswers,
  errorText,
  successText,
  submitLabel = "Actionner le mécanisme",
  onSuccess
}) {
  const wb = openWorkbench({ kicker, title, instruction, hint });

  wb.stageEl.innerHTML = `
    <div class="workbench-split">
      <div class="workbench-plate">
        <img src="${image}" alt="${imageCaption || title}" />
        <button type="button" class="plate-zoom-btn" id="dial-zoom">🔍 Loupe</button>
      </div>
      <div>
        <div class="dial-bank">
          <div class="dial-bank-title">${dialTitle}</div>
          <div id="dial-mount" class="dial-row"></div>
          <div class="dial-keyboard-hint">Tournez les molettes ou tapez directement les chiffres au clavier</div>
          ${scratchpadHtml}
        </div>
      </div>
    </div>`;

  wb.stageEl.querySelector("#dial-zoom").onclick = () => UI.openLightbox(image, imageCaption || title);

  let solved = false;
  function validate() {
    if (solved) return;
    const val = dialCtrl.getValue();
    if (checkAnswer(val, validAnswers)) {
      solved = true;
      wb.setStatus(successText || "Combinaison exacte ! Le mécanisme cède.", "success");
      setTimeout(() => {
        wb.close();
        onSuccess(val);
      }, 650);
    } else {
      playSound("erreur");
      wb.setStatus(errorText || "Le mécanisme reste bloqué. Vérifiez votre relevé.", "error");
    }
  }

  const dialCtrl = mountDialWheels(wb.stageEl.querySelector("#dial-mount"), {
    digits,
    groups,
    labels,
    compact,
    onSubmit: validate
  });
  wb.setCleanup(dialCtrl.cleanup);

  wb.footerEl.innerHTML = `
    <button type="button" class="btn-parchment" id="dial-cancel">Refermer</button>
    <button type="button" class="btn-royal" id="dial-submit">${submitLabel}</button>`;
  wb.footerEl.querySelector("#dial-cancel").onclick = wb.close;
  wb.footerEl.querySelector("#dial-submit").onclick = validate;
}

/* ==========================================================================
   4. GALERIE 110 — OPTIQUE DES 3 MIROIRS PIVOTANTS (Séquence D - G - C)
   ========================================================================== */
export function runMirrorsPuzzle({ onSuccess }) {
  const wb = openWorkbench({
    kicker: "Zone II · Dispositif Optique",
    title: "Les Trois Miroirs de la Galerie 110",
    instruction: "Orientez chacun des trois miroirs pivotants (Gauche, Centre ou Droite) afin de guider le rayon solaire jusqu'au mur gravé au fond de la galerie.",
    hint: "Observez les ricochets en direct : réglez le Miroir 1 sur D (Droite), le Miroir 2 sur G (Gauche) et le Miroir 3 sur C (Centre)."
  });

  const angles = ["C", "C", "C"]; // G, C, D — solution : D, G, C

  wb.stageEl.innerHTML = `
    <div class="workbench-split">
      <div class="workbench-plate">
        <img src="assets/images/items/miroirs_dispositif.webp" alt="Dispositif des trois miroirs" />
        <button type="button" class="plate-zoom-btn" id="mir-zoom">🔍 Loupe</button>
      </div>
      <div>
        <div class="optics-chamber">
          <svg class="optics-svg" viewBox="0 0 420 270" aria-label="Chambre optique de la Galerie 110">
            <defs>
              <filter id="beamGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <!-- Parois de la galerie -->
            <rect x="8" y="8" width="404" height="254" rx="6" fill="none" stroke="rgba(200,154,69,0.28)" stroke-dasharray="4 4" />
            <!-- Puits de lumière supérieur -->
            <rect x="64" y="4" width="32" height="10" rx="2" fill="#ffe6a0" />
            <text x="80" y="28" fill="#d9bc7a" font-family="Cinzel, serif" font-size="9" text-anchor="middle">PUITS SOLAIRE</text>

            <!-- Cible murale du fond -->
            <rect id="target-wall" x="348" y="182" width="54" height="62" rx="4" fill="#231d17" stroke="#b07f2e" stroke-width="1.5" />
            <text id="target-inscription" x="375" y="209" fill="#5e4e3c" font-family="Cinzel, serif" font-size="7.5" font-weight="700" text-anchor="middle">LUX IN</text>
            <text id="target-inscription-2" x="375" y="222" fill="#5e4e3c" font-family="Cinzel, serif" font-size="7.5" font-weight="700" text-anchor="middle">TENEBRIS</text>

            <!-- Faisceau dynamique -->
            <polyline id="light-beam" points="80,14 80,105" fill="none" stroke="#ffd86b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#beamGlow)" />
            <circle id="beam-end" cx="80" cy="105" r="5" fill="#fff5cc" filter="url(#beamGlow)" />

            <!-- Miroir 1 (80, 105) -->
            <g id="svg-m0" transform="translate(80,105)" style="cursor:pointer;">
              <circle r="24" fill="rgba(200,154,69,0.12)" stroke="rgba(200,154,69,0.45)" stroke-dasharray="3 2" />
              <line id="bar-m0" x1="-22" y1="0" x2="22" y2="0" stroke="#e5c67e" stroke-width="5" stroke-linecap="round" />
              <circle r="4" fill="#1b3a5c" stroke="#e5c67e" stroke-width="1.5" />
              <text y="38" fill="#e7d8b8" font-family="Cinzel, serif" font-size="10" text-anchor="middle">M1</text>
            </g>

            <!-- Miroir 2 (275, 105) -->
            <g id="svg-m1" transform="translate(275,105)" style="cursor:pointer;">
              <circle r="24" fill="rgba(200,154,69,0.12)" stroke="rgba(200,154,69,0.45)" stroke-dasharray="3 2" />
              <line id="bar-m1" x1="-22" y1="0" x2="22" y2="0" stroke="#e5c67e" stroke-width="5" stroke-linecap="round" />
              <circle r="4" fill="#1b3a5c" stroke="#e5c67e" stroke-width="1.5" />
              <text y="38" fill="#e7d8b8" font-family="Cinzel, serif" font-size="10" text-anchor="middle">M2</text>
            </g>

            <!-- Miroir 3 (185, 212) -->
            <g id="svg-m2" transform="translate(185,212)" style="cursor:pointer;">
              <circle r="24" fill="rgba(200,154,69,0.12)" stroke="rgba(200,154,69,0.45)" stroke-dasharray="3 2" />
              <line id="bar-m2" x1="-22" y1="0" x2="22" y2="0" stroke="#e5c67e" stroke-width="5" stroke-linecap="round" />
              <circle r="4" fill="#1b3a5c" stroke="#e5c67e" stroke-width="1.5" />
              <text y="38" fill="#e7d8b8" font-family="Cinzel, serif" font-size="10" text-anchor="middle">M3</text>
            </g>
          </svg>
        </div>

        <div class="mirror-controls-row" id="mirror-controls"></div>
      </div>
    </div>`;

  wb.stageEl.querySelector("#mir-zoom").onclick = () =>
    UI.openLightbox("assets/images/items/miroirs_dispositif.webp", "Système de miroirs de la Galerie 110");

  const controlsRow = wb.stageEl.querySelector("#mirror-controls");
  const beamEl = wb.stageEl.querySelector("#light-beam");
  const beamEndEl = wb.stageEl.querySelector("#beam-end");
  const targetWall = wb.stageEl.querySelector("#target-wall");
  const targetTxt1 = wb.stageEl.querySelector("#target-inscription");
  const targetTxt2 = wb.stageEl.querySelector("#target-inscription-2");

  const rotDeg = { G: -38, C: 0, D: 38 };
  const btnGroups = [];

  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "mirror-ctrl-card";
    card.innerHTML = `<div class="m-label">Miroir ${i + 1}</div><div class="mirror-seg"></div>`;
    const seg = card.querySelector(".mirror-seg");
    const btns = {};

    ["G", "C", "D"].forEach((pos) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = pos;
      b.onclick = () => {
        angles[i] = pos;
        playSound("bruit_verre");
        updateOptics();
      };
      seg.appendChild(b);
      btns[pos] = b;
    });

    wb.stageEl.querySelector(`#svg-m${i}`).onclick = () => {
      const order = ["G", "C", "D"];
      angles[i] = order[(order.indexOf(angles[i]) + 1) % 3];
      playSound("bruit_verre");
      updateOptics();
    };

    btnGroups.push(btns);
    controlsRow.appendChild(card);
  }

  let solved = false;
  function updateOptics() {
    for (let i = 0; i < 3; i++) {
      const bar = wb.stageEl.querySelector(`#bar-m${i}`);
      bar.setAttribute("transform", `rotate(${rotDeg[angles[i]]})`);
      ["G", "C", "D"].forEach((p) => {
        btnGroups[i][p].classList.toggle("is-active", angles[i] === p);
      });
    }

    // Calcul du trajet lumineux réel
    const pts = [[80, 14], [80, 105]];
    let hitTarget = false;

    if (angles[0] === "G") {
      pts.push([14, 155]);
    } else if (angles[0] === "C") {
      pts.push([80, 255]);
    } else if (angles[0] === "D") {
      pts.push([275, 105]);
      if (angles[1] === "C") {
        pts.push([406, 105]);
      } else if (angles[1] === "D") {
        pts.push([355, 22]);
      } else if (angles[1] === "G") {
        pts.push([185, 212]);
        if (angles[2] === "G") {
          pts.push([24, 212]);
        } else if (angles[2] === "D") {
          pts.push([265, 260]);
        } else if (angles[2] === "C") {
          pts.push([352, 212]);
          hitTarget = true;
        }
      }
    }

    beamEl.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
    const last = pts[pts.length - 1];
    beamEndEl.setAttribute("cx", last[0]);
    beamEndEl.setAttribute("cy", last[1]);

    targetWall.setAttribute("fill", hitTarget ? "#4a3818" : "#231d17");
    targetWall.setAttribute("stroke", hitTarget ? "#ffe28a" : "#b07f2e");
    targetTxt1.setAttribute("fill", hitTarget ? "#fff1ba" : "#5e4e3c");
    targetTxt2.setAttribute("fill", hitTarget ? "#fff1ba" : "#5e4e3c");

    const seqEl = wb.footerEl.querySelector("#mir-seq");
    if (seqEl) seqEl.textContent = angles.join(" - ");

    if (hitTarget) {
      wb.setStatus("Le faisceau atteint le mur du fond ! Séquence alignée : D · G · C.", "success");
    } else if (!solved) {
      wb.setStatus("Ajustez les trois miroirs pour conduire le faisceau vers l'inscription murale.", "info");
    }
  }

  wb.footerEl.innerHTML = `
    <span class="folio-tag">Séquence actuelle : <strong id="mir-seq">C - C - C</strong></span>
    <div style="display:flex;gap:10px;">
      <button type="button" class="btn-parchment" id="mir-cancel">Refermer</button>
      <button type="button" class="btn-royal" id="mir-validate">Verrouiller les miroirs</button>
    </div>`;

  updateOptics();

  wb.footerEl.querySelector("#mir-cancel").onclick = wb.close;
  wb.footerEl.querySelector("#mir-validate").onclick = () => {
    if (solved) return;
    if (angles.join("") === "DGC") {
      solved = true;
      wb.setStatus("Alignement parfait ! La galerie 110 s'illumine dans un éclat cristallin.", "success");
      setTimeout(() => {
        wb.close();
        onSuccess();
      }, 700);
    } else {
      playSound("erreur");
      wb.setStatus("La lumière se perd encore contre les parois de pierre. Ajustez les angles.", "error");
    }
  };
}

/* ==========================================================================
   5. POSTE RADIO MORSE INTERACTIF (LIBERTÉ)
   ========================================================================== */
export function runMorseRadioPuzzle({ onSuccess }) {
  const wb = openWorkbench({
    kicker: "Zone II · Transmission Résistance",
    title: "Le Poste Radio du Chemin de Ronde",
    instruction: "Écoutez le signal Morse émis par le poste radio, observez le voyant lumineux et décodez le mot de 7 lettres à l'aide de l'alphabet ci-contre.",
    hint: "Le message en Morse épelle un mot emblématique de 7 lettres : L (·−··) I (··) B (−···) E (·) R (·−·) T (−) É (·)."
  });

  wb.stageEl.innerHTML = `
    <div class="workbench-split">
      <div class="workbench-plate">
        <img src="assets/images/items/code_morse.webp" alt="Alphabet Morse" />
        <button type="button" class="plate-zoom-btn" id="morse-zoom">🔍 Loupe</button>
      </div>
      <div>
        <div class="radio-console">
          <div class="radio-top">
            <div class="radio-lamp-wrap">
              <div id="radio-lamp" class="radio-lamp"></div>
              <div>
                <div class="radio-freq">POSTE RÉSEAU VAUBAN · 7.14 MHz</div>
                <div id="radio-state" style="font-size:0.76rem;color:#c9b89c;">Signal prêt</div>
              </div>
            </div>
            <button type="button" class="btn-parchment" id="morse-play-btn" style="padding:7px 14px;font-size:0.72rem;">▶ Écouter</button>
          </div>
          <div class="radio-wave">
            <canvas id="morse-wave-canvas" width="360" height="46"></canvas>
          </div>
          <div style="font-size:0.75rem;color:#cdb996;text-align:center;">
            Mot transmis (7 lettres) :
          </div>
        </div>

        <div class="morse-slots" id="morse-slots"></div>
      </div>
    </div>`;

  wb.stageEl.querySelector("#morse-zoom").onclick = () =>
    UI.openLightbox("assets/images/items/code_morse.webp", "Guide de l'Alphabet Morse");

  const lamp = wb.stageEl.querySelector("#radio-lamp");
  const playBtn = wb.stageEl.querySelector("#morse-play-btn");
  const stateLabel = wb.stageEl.querySelector("#radio-state");
  const waveCanvas = wb.stageEl.querySelector("#morse-wave-canvas");
  const wctx = waveCanvas.getContext("2d");

  const morseAudio = sounds.son_morse_liberte;
  let rafId = null;
  let audioCtx = null;
  let analyser = null;
  let freqData = null;

  // Patron visuel de secours synchronisé au rythme LIBERTE si WebAudio Analyser indisponible
  const morsePattern = [
    1,0,1,1,1,0,1,0,1,0,0,0, // L
    1,0,1,0,0,0,             // I
    1,1,1,0,1,0,1,0,1,0,0,0, // B
    1,0,0,0,                 // E
    1,0,1,1,1,0,1,0,0,0,     // R
    1,1,1,0,0,0,             // T
    1,0,0,0,0,0              // E
  ];

  function setupAnalyser() {
    if (analyser || !morseAudio) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!morseAudio._vaubanAnalyser) {
        audioCtx = new AC();
        const src = audioCtx.createMediaElementSource(morseAudio);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
        morseAudio._vaubanCtx = audioCtx;
        morseAudio._vaubanAnalyser = analyser;
      } else {
        audioCtx = morseAudio._vaubanCtx;
        analyser = morseAudio._vaubanAnalyser;
      }
      freqData = new Uint8Array(analyser.frequencyBinCount);
    } catch (_) {
      analyser = null;
    }
  }

  function drawWave() {
    const playing = morseAudio && !morseAudio.paused && !morseAudio.ended;
    wctx.fillStyle = "#0e0b08";
    wctx.fillRect(0, 0, waveCanvas.width, waveCanvas.height);

    let level = 0;
    if (playing && analyser && freqData) {
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) sum += freqData[i];
      level = sum / (freqData.length * 255);
    } else if (playing) {
      const idx = Math.floor((morseAudio.currentTime * 6.5)) % morsePattern.length;
      level = morsePattern[idx] ? 0.65 : 0.04;
    }

    lamp.classList.toggle("is-lit", playing && level > 0.14);

    wctx.strokeStyle = playing && level > 0.14 ? "#ffcf5c" : "rgba(200,154,69,0.4)";
    wctx.lineWidth = 2;
    wctx.beginPath();
    const mid = waveCanvas.height / 2;
    const t = performance.now() * 0.025;
    for (let x = 0; x < waveCanvas.width; x += 3) {
      const amp = playing ? level * 18 : 1;
      const y = mid + Math.sin(x * 0.14 + t) * amp * Math.sin((x / waveCanvas.width) * Math.PI);
      if (x === 0) wctx.moveTo(x, y);
      else wctx.lineTo(x, y);
    }
    wctx.stroke();

    if (playing) {
      rafId = requestAnimationFrame(drawWave);
    } else {
      lamp.classList.remove("is-lit");
      playBtn.textContent = "▶ Réécouter";
      stateLabel.textContent = "Transmission en pause";
    }
  }

  function startMorse() {
    setupAnalyser();
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    playSound("son_morse_liberte");
    playBtn.textContent = "■ Stop";
    stateLabel.textContent = "Réception en cours…";
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(drawWave);
  }

  playBtn.onclick = () => {
    if (morseAudio && !morseAudio.paused) {
      stopSound("son_morse_liberte");
      cancelAnimationFrame(rafId);
      drawWave();
    } else {
      startMorse();
    }
  };

  wb.setCleanup(() => {
    cancelAnimationFrame(rafId);
    stopSound("son_morse_liberte");
  });

  // Lancement auto à l'ouverture
  startMorse();

  // 7 cases de décodage
  const slotsWrap = wb.stageEl.querySelector("#morse-slots");
  const inputs = [];
  for (let i = 0; i < 7; i++) {
    const inp = document.createElement("input");
    inp.type = "text";
    inp.maxLength = 1;
    inp.className = "morse-letter-input";
    inp.setAttribute("aria-label", `Lettre ${i + 1}`);
    inp.addEventListener("input", () => {
      inp.value = inp.value.toUpperCase().replace(/[^A-ZÉÈÊ]/g, "");
      if (inp.value && i < 6) inputs[i + 1].focus();
    });
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !inp.value && i > 0) {
        inputs[i - 1].focus();
      } else if (e.key === "Enter") {
        validate();
      }
    });
    slotsWrap.appendChild(inp);
    inputs.push(inp);
  }
  setTimeout(() => inputs[0]?.focus(), 120);

  let solved = false;
  function validate() {
    if (solved) return;
    const word = inputs.map((el) => el.value).join("");
    if (checkAnswer(word, ["LIBERTE", "LIBERTÉ"])) {
      solved = true;
      stopSound("son_morse_liberte");
      wb.setStatus("Mot « LIBERTÉ » authentifié ! La grille électronique se déverrouille.", "success");
      setTimeout(() => {
        wb.close();
        onSuccess();
      }, 650);
    } else {
      playSound("erreur");
      wb.setStatus("Le code ne correspond pas. Réécoutez le rythme et consultez la table Morse.", "error");
    }
  }

  wb.footerEl.innerHTML = `
    <button type="button" class="btn-parchment" id="morse-cancel">Refermer</button>
    <button type="button" class="btn-royal" id="morse-submit">Transmettre le décodage</button>`;
  wb.footerEl.querySelector("#morse-cancel").onclick = wb.close;
  wb.footerEl.querySelector("#morse-submit").onclick = validate;
}

/* ==========================================================================
   6. GRAND PUITS — TREUIL À ROUE D'ÉCUREUIL (117 m, Ø 4 m -> 9 tours)
   ========================================================================== */
export function runWellWinchPuzzle({ onSuccess }) {
  const wb = openWorkbench({
    kicker: "Zone III · Génie Hydraulique",
    title: "La Roue à Écureuil du Grand Puits",
    instruction: "Calculez le nombre entier de tours de roue (Ø 4 m) nécessaires pour remonter le seau depuis 117 mètres de profondeur, réglez le treuil et actionnez-le.",
    hint: "Périmètre d'un tour = π × 4 m ≈ 12,57 m. Pour 117 m : 117 ÷ 12,57 ≈ 9,3 → 9 tours de roue."
  });

  let turns = 1;
  let solved = false;

  wb.stageEl.innerHTML = `
    <div class="workbench-split">
      <div class="workbench-plate">
        <img src="assets/images/items/puits_dimensions.webp" alt="Coupe verticale du Grand Puits (117 m, Ø 4 m)" />
        <button type="button" class="plate-zoom-btn" id="well-zoom">🔍 Loupe</button>
      </div>
      <div class="well-machine">
        <div class="dial-bank-title" style="margin-bottom:4px;">Treuil en Chêne — Ø 4 m</div>
        <div class="well-visual-row">
          <svg class="well-wheel-svg" viewBox="0 0 200 200" id="well-wheel" title="Cliquer pour ajouter un tour">
            <g id="well-rotor" class="well-wheel-rotor">
              <circle cx="100" cy="100" r="82" fill="none" stroke="#7d5324" stroke-width="14" />
              <circle cx="100" cy="100" r="76" fill="none" stroke="#c89a45" stroke-width="2" />
              <circle cx="100" cy="100" r="22" fill="#5e3c18" stroke="#dfb86b" stroke-width="3" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="#7d5324" stroke-width="8" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="#7d5324" stroke-width="8" />
              <line x1="42" y1="42" x2="158" y2="158" stroke="#7d5324" stroke-width="7" />
              <line x1="158" y1="42" x2="42" y2="158" stroke="#7d5324" stroke-width="7" />
              <circle cx="100" cy="100" r="8" fill="#dfb86b" />
            </g>
          </svg>

          <div class="well-shaft" aria-label="Puits de 117 mètres">
            <div id="well-rope" class="well-rope" style="height:132px;"></div>
            <div id="well-bucket" class="well-bucket" style="top:132px;"></div>
          </div>
        </div>

        <div class="well-counter-row">
          <button type="button" class="btn-parchment" id="well-minus" style="padding:8px 14px;">− 1 tour</button>
          <div id="well-turns-display" class="well-turns-badge">1 tour</div>
          <button type="button" class="btn-parchment" id="well-plus" style="padding:8px 14px;">+ 1 tour</button>
        </div>

        <div style="font-family:var(--font-serif);font-size:1rem;color:var(--ink-700);">
          Profondeur : <strong>117 m</strong> · Diamètre de la roue : <strong>4 m</strong>
        </div>
      </div>
    </div>`;

  wb.stageEl.querySelector("#well-zoom").onclick = () =>
    UI.openLightbox("assets/images/items/puits_dimensions.webp", "Coupe du Grand Puits — Profondeur 117 m, Ø 4 m");

  const rotor = wb.stageEl.querySelector("#well-rotor");
  const rope = wb.stageEl.querySelector("#well-rope");
  const bucket = wb.stageEl.querySelector("#well-bucket");
  const display = wb.stageEl.querySelector("#well-turns-display");

  function updateVisual() {
    rotor.style.transform = `rotate(${turns * 40}deg)`;
    const progress = Math.min(1, turns / 9.3);
    const y = Math.round(138 - progress * 124);
    rope.style.height = `${Math.max(12, y)}px`;
    bucket.style.top = `${Math.max(12, y)}px`;
    display.textContent = turns > 1 ? `${turns} tours` : `${turns} tour`;
  }

  wb.stageEl.querySelector("#well-plus").onclick = () => {
    if (solved) return;
    turns = Math.min(15, turns + 1);
    updateVisual();
  };
  wb.stageEl.querySelector("#well-minus").onclick = () => {
    if (solved) return;
    turns = Math.max(1, turns - 1);
    updateVisual();
  };
  wb.stageEl.querySelector("#well-wheel").onclick = () => {
    if (solved) return;
    turns = turns >= 15 ? 1 : turns + 1;
    updateVisual();
  };

  updateVisual();

  wb.footerEl.innerHTML = `
    <button type="button" class="btn-parchment" id="well-cancel">Refermer</button>
    <button type="button" class="btn-royal" id="well-submit">Actionner le treuil</button>`;
  wb.footerEl.querySelector("#well-cancel").onclick = wb.close;
  wb.footerEl.querySelector("#well-submit").onclick = () => {
    if (solved) return;
    if (turns === 9) {
      solved = true;
      wb.setStatus("9 tours ! Le bois craque lourdement tandis que le seau remonte les 117 mètres…", "success");
      playSound("bruit_roue_bois");
      setTimeout(() => {
        wb.close();
        onSuccess();
      }, 900);
    } else {
      playSound("erreur");
      const msg = turns < 9
        ? "Le seau reste trop bas dans les profondeurs du puits. Ajoutez des tours."
        : "Trop de tours : la corde force contre la poulie ! Réduisez légèrement.";
      wb.setStatus(msg, "error");
    }
  };
}

/* ==========================================================================
   7. CITERNES — SIMULATEUR HYDRAULIQUE (10 L / 3 L -> 7 L)
   ========================================================================== */
export function runHydraulicValvesPuzzle({ onSuccess }) {
  const wb = openWorkbench({
    kicker: "Zone III · Équilibre du Contrepoids",
    title: "Les Valves des Citernes Souterraines",
    instruction: "La citerne principale de 10 L est pleine. Utilisez les valves et le seau de 3 L pour obtenir exactement 7 litres dans la citerne, puis engagez le contrepoids.",
    hint: "Ouvrez la vanne « Soutirer vers le seau (10 L → 3 L) » : la citerne passe aussitôt à 7 litres exacts !"
  });

  let cistern = 10;
  let bucket = 0;
  let solved = false;

  wb.stageEl.innerHTML = `
    <div class="workbench-split">
      <div class="workbench-plate">
        <img src="assets/images/items/schema_valves.webp" alt="Schéma hydraulique 10L / 7L / 3L" />
        <button type="button" class="plate-zoom-btn" id="valv-zoom">🔍 Loupe</button>
      </div>
      <div class="hydraulic-bench">
        <div class="vessels-stage">
          <div class="vessel-col">
            <div class="vessel-tank">
              <div class="vessel-target-line"><span>Cible 7 L</span></div>
              <div id="water-cistern" class="vessel-water" style="height:100%;"></div>
            </div>
            <div id="readout-cistern" class="vessel-readout">10 / 10 L</div>
            <div class="vessel-name">Citerne principale</div>
          </div>

          <div class="vessel-col">
            <div class="vessel-tank bucket-small">
              <div id="water-bucket" class="vessel-water" style="height:0%;"></div>
            </div>
            <div id="readout-bucket" class="vessel-readout">0 / 3 L</div>
            <div class="vessel-name">Seau de mesure</div>
          </div>
        </div>

        <div class="valve-buttons">
          <button type="button" class="btn-parchment" id="v-pour-bucket">Soutirer (10 L → 3 L)</button>
          <button type="button" class="btn-parchment" id="v-pour-cistern">Reverser (3 L → 10 L)</button>
          <button type="button" class="btn-parchment" id="v-empty-bucket">Vider le seau</button>
          <button type="button" class="btn-parchment" id="v-refill">Remplir (10 L)</button>
        </div>
      </div>
    </div>`;

  wb.stageEl.querySelector("#valv-zoom").onclick = () =>
    UI.openLightbox("assets/images/items/schema_valves.webp", "Protocole de transvasement des citernes");

  const wCistern = wb.stageEl.querySelector("#water-cistern");
  const wBucket = wb.stageEl.querySelector("#water-bucket");
  const rCistern = wb.stageEl.querySelector("#readout-cistern");
  const rBucket = wb.stageEl.querySelector("#readout-bucket");

  function renderLevels() {
    wCistern.style.height = `${(cistern / 10) * 100}%`;
    wBucket.style.height = `${(bucket / 3) * 100}%`;
    rCistern.textContent = `${cistern} / 10 L`;
    rBucket.textContent = `${bucket} / 3 L`;
    if (cistern === 7) {
      wb.setStatus("Niveau d'équilibre atteint : exactement 7 litres dans la citerne ! Engagez le contrepoids.", "success");
    } else if (!solved) {
      wb.setStatus(`Citerne actuelle : ${cistern} L (objectif : 7 L pour équilibrer le contrepoids).`, "info");
    }
  }

  wb.stageEl.querySelector("#v-pour-bucket").onclick = () => {
    if (solved) return;
    const space = 3 - bucket;
    const transfer = Math.min(cistern, space);
    if (transfer > 0) {
      cistern -= transfer;
      bucket += transfer;
      playSound("bruit_valve_metal");
      setTimeout(() => playSound("eau_versee"), 180);
      renderLevels();
    }
  };

  wb.stageEl.querySelector("#v-pour-cistern").onclick = () => {
    if (solved) return;
    const space = 10 - cistern;
    const transfer = Math.min(bucket, space);
    if (transfer > 0) {
      bucket -= transfer;
      cistern += transfer;
      playSound("eau_versee");
      renderLevels();
    }
  };

  wb.stageEl.querySelector("#v-empty-bucket").onclick = () => {
    if (solved || bucket === 0) return;
    bucket = 0;
    playSound("eau_versee");
    renderLevels();
  };

  wb.stageEl.querySelector("#v-refill").onclick = () => {
    if (solved) return;
    cistern = 10;
    bucket = 0;
    playSound("bruit_valve_metal");
    renderLevels();
  };

  wb.footerEl.innerHTML = `
    <button type="button" class="btn-parchment" id="valv-cancel">Refermer</button>
    <button type="button" class="btn-royal" id="valv-engage">Engager le contrepoids</button>`;
  wb.footerEl.querySelector("#valv-cancel").onclick = wb.close;
  wb.footerEl.querySelector("#valv-engage").onclick = () => {
    if (solved) return;
    if (cistern === 7) {
      solved = true;
      playSound("bruit_valve_metal");
      wb.setStatus("Contrepoids parfaitement équilibré à 7 litres ! La porte massive pivote…", "success");
      setTimeout(() => {
        wb.close();
        onSuccess();
      }, 750);
    } else {
      playSound("erreur");
      wb.setStatus(`La citerne contient actuellement ${cistern} L au lieu des 7 L requis. Ajustez les valves.`, "error");
    }
  };
}

/* ==========================================================================
   8. TRAITÉ DE VAUBAN — RECONSTITUTION DES 3 FRAGMENTS DÉCHIRÉS (ARTILLERIE)
   ========================================================================== */
export function runTreatiseAssemblyPuzzle({ onSuccess }) {
  const wb = openWorkbench({
    kicker: "Zone IV · Archives du Front Royal",
    title: "Le Traité Déchiré de Vauban",
    instruction: "Assemblez les trois morceaux de parchemin déchirés dans le bon ordre (en cliquant ou en les glissant dans les emplacements) pour reconstituer le mot clé militaire.",
    hint: "Les trois fragments ARTI + LLE + RIE forment le mot ARTILLERIE."
  });

  const fragments = [
    { id: "lle", text: "LLE" },
    { id: "rie", text: "RIE" },
    { id: "arti", text: "ARTI" }
  ];
  const slots = [null, null, null];
  let solved = false;

  wb.stageEl.innerHTML = `
    <div class="workbench-split">
      <div class="workbench-plate">
        <img src="assets/images/items/traite_vauban_dechire.webp" alt="Traité de l'attaque et de la défense des places" />
        <button type="button" class="plate-zoom-btn" id="tr-zoom">🔍 Loupe</button>
      </div>
      <div class="treatise-desk">
        <div class="treatise-slots-row" id="tr-slots"></div>
        <div class="treatise-assembled" id="tr-preview">_ _ _ · _ _ _ · _ _ _</div>
        <div class="scrap-tray" id="tr-tray"></div>
        <div style="text-align:center;font-size:0.78rem;color:var(--ink-500);">
          Cliquez sur un fragment pour le placer (ou glissez-déposez) · Cliquez sur un emplacement pour le retirer
        </div>
      </div>
    </div>`;

  wb.stageEl.querySelector("#tr-zoom").onclick = () =>
    UI.openLightbox("assets/images/items/traite_vauban_dechire.webp", "Traité de l'attaque et de la défense des places");

  const slotsEl = wb.stageEl.querySelector("#tr-slots");
  const trayEl = wb.stageEl.querySelector("#tr-tray");
  const previewEl = wb.stageEl.querySelector("#tr-preview");

  function renderDesk() {
    slotsEl.innerHTML = "";
    trayEl.innerHTML = "";

    slots.forEach((fragId, idx) => {
      const slotDiv = document.createElement("div");
      slotDiv.className = "paper-slot";
      slotDiv.dataset.slot = String(idx);

      slotDiv.addEventListener("dragover", (e) => {
        e.preventDefault();
        slotDiv.classList.add("is-over");
      });
      slotDiv.addEventListener("dragleave", () => slotDiv.classList.remove("is-over"));
      slotDiv.addEventListener("drop", (e) => {
        e.preventDefault();
        slotDiv.classList.remove("is-over");
        const droppedId = e.dataTransfer.getData("text/plain");
        if (!droppedId) return;
        const oldIdx = slots.indexOf(droppedId);
        if (oldIdx !== -1) slots[oldIdx] = null;
        slots[idx] = droppedId;
        playSound("bruit_page_papier");
        renderDesk();
      });

      if (fragId) {
        const frag = fragments.find((f) => f.id === fragId);
        const scrap = document.createElement("div");
        scrap.className = "paper-scrap";
        scrap.draggable = true;
        scrap.textContent = frag.text;
        scrap.title = "Cliquer pour retirer";
        scrap.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", frag.id));
        scrap.onclick = () => {
          if (solved) return;
          slots[idx] = null;
          playSound("bruit_page_papier");
          renderDesk();
        };
        slotDiv.appendChild(scrap);
      } else {
        slotDiv.innerHTML = `<span class="paper-slot-num">Fragment ${idx + 1}</span>`;
      }
      slotsEl.appendChild(slotDiv);
    });

    fragments.forEach((frag) => {
      if (slots.includes(frag.id)) return;
      const scrap = document.createElement("div");
      scrap.className = "paper-scrap";
      scrap.draggable = true;
      scrap.textContent = frag.text;
      scrap.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", frag.id));
      scrap.onclick = () => {
        if (solved) return;
        const nextEmpty = slots.indexOf(null);
        if (nextEmpty !== -1) {
          slots[nextEmpty] = frag.id;
          playSound("bruit_page_papier");
          renderDesk();
        }
      };
      trayEl.appendChild(scrap);
    });

    const word = slots.map((id) => (id ? fragments.find((f) => f.id === id).text : "···")).join("");
    previewEl.textContent = word;
  }

  renderDesk();

  wb.footerEl.innerHTML = `
    <button type="button" class="btn-parchment" id="tr-reset">Mélanger</button>
    <button type="button" class="btn-royal" id="tr-validate">Valider le mot clé</button>`;

  wb.footerEl.querySelector("#tr-reset").onclick = () => {
    if (solved) return;
    slots[0] = slots[1] = slots[2] = null;
    renderDesk();
  };

  wb.footerEl.querySelector("#tr-validate").onclick = () => {
    if (solved) return;
    const word = slots.map((id) => (id ? fragments.find((f) => f.id === id).text : "")).join("");
    if (checkAnswer(word, ["ARTILLERIE"])) {
      solved = true;
      wb.setStatus("« ARTILLERIE » ! Les canons pivotent dans un grondement sourd…", "success");
      setTimeout(() => {
        wb.close();
        onSuccess();
      }, 700);
    } else {
      playSound("erreur");
      wb.setStatus("Ce mot ne correspond pas au traité de Vauban. Réagencez les 3 morceaux.", "error");
    }
  };
}

/* ==========================================================================
   9. ALIGNEMENT SOLAIRE — FOCALISATION À LA LENTILLE SUR LA CORDE
   ========================================================================== */
export function runSolarLensPuzzle({ onSuccess }) {
  const wb = openWorkbench({
    kicker: "Zone IV · Optique Solaire",
    title: "Concentrer les Rayons avec la Lentille de Vauban",
    instruction: "Déplacez la lentille de verre sur le point lumineux de la corde de chanvre et maintenez la focalisation jusqu'à l'embrasement.",
    hint: "Visez l'éclat doré du soleil sur la corde, légèrement à gauche du centre de l'image, et restez immobile pendant 2 secondes."
  });

  wb.stageEl.innerHTML = `
    <div class="solar-stage" id="solar-stage">
      <img src="assets/images/scenes/alignement_solaire.webp" alt="Corde de chanvre baignée de soleil" />
      <div id="solar-lens" class="solar-lens-ring" style="left:75%;top:72%;">
        <div id="solar-spot" class="solar-focal-spot"></div>
      </div>
    </div>
    <div class="solar-burn-hud">
      <span class="folio-tag">Combustion</span>
      <div class="solar-heat-bar"><div id="solar-heat-fill" class="solar-heat-fill"></div></div>
      <strong id="solar-heat-pct" style="min-width:44px;text-align:right;font-family:var(--font-display);color:var(--wax-600);">0%</strong>
    </div>`;

  const stage = wb.stageEl.querySelector("#solar-stage");
  const lens = wb.stageEl.querySelector("#solar-lens");
  const spot = wb.stageEl.querySelector("#solar-spot");
  const heatFill = wb.stageEl.querySelector("#solar-heat-fill");
  const heatPct = wb.stageEl.querySelector("#solar-heat-pct");

  // Point solaire exact sur alignement_solaire.webp (lueur sur la corde : ~38%, ~43%)
  const TARGET_X = 0.385;
  const TARGET_Y = 0.43;

  let lensX = 0.75;
  let lensY = 0.72;
  let heat = 0;
  let solved = false;
  let firePlaying = false;
  let rafId = null;

  function moveLensFromClient(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    lensX = Math.max(0.06, Math.min(0.94, (clientX - rect.left) / rect.width));
    lensY = Math.max(0.08, Math.min(0.92, (clientY - rect.top) / rect.height));
    lens.style.left = `${lensX * 100}%`;
    lens.style.top = `${lensY * 100}%`;
  }

  stage.addEventListener("pointermove", (e) => {
    if (solved) return;
    moveLensFromClient(e.clientX, e.clientY);
  });
  stage.addEventListener("pointerdown", (e) => {
    if (solved) return;
    stage.setPointerCapture(e.pointerId);
    moveLensFromClient(e.clientX, e.clientY);
  });

  function tick() {
    if (solved) return;
    const dist = Math.hypot(lensX - TARGET_X, lensY - TARGET_Y);
    const inFocus = dist < 0.095;

    // Taille et éclat du foyer optique
    const focusRatio = Math.max(0, 1 - dist / 0.22);
    const spotSize = 44 - focusRatio * 30;
    spot.style.width = `${spotSize}px`;
    spot.style.height = `${spotSize}px`;
    spot.style.opacity = String(0.35 + focusRatio * 0.65);

    if (inFocus) {
      heat = Math.min(100, heat + 0.85);
      if (!firePlaying) {
        firePlaying = true;
        playSound("bruit_feu");
        wb.setStatus("Un point blanc éblouissant embrase la corde de chanvre ! Maintenez le foyer…", "info");
      }
    } else {
      heat = Math.max(0, heat - 0.35);
      if (firePlaying && heat < 5) {
        firePlaying = false;
        stopSound("bruit_feu");
      }
    }

    heatFill.style.width = `${Math.round(heat)}%`;
    heatPct.textContent = `${Math.round(heat)}%`;

    if (heat >= 100) {
      solved = true;
      stopSound("bruit_feu");
      playSound("corde_rupture");
      wb.setStatus("La corde cède net ! La herse s'abat et libère le passage dérobé.", "success");
      setTimeout(() => {
        wb.close();
        onSuccess();
      }, 950);
      return;
    }

    rafId = requestAnimationFrame(tick);
  }
  rafId = requestAnimationFrame(tick);

  wb.setCleanup(() => {
    cancelAnimationFrame(rafId);
    stopSound("bruit_feu");
  });

  wb.footerEl.innerHTML = `
    <span class="folio-tag">Déplacez ou touchez l'éclat solaire sur la corde pour maintenir le foyer</span>
    <button type="button" class="btn-parchment" id="solar-cancel">Refermer</button>`;

  wb.footerEl.querySelector("#solar-cancel").onclick = wb.close;
}
