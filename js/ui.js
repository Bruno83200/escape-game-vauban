// js/ui.js

export const UI = {
    // 1. Message simple (MAJ pour accepter une illustration)
    message: function(text, callback = null, imagePath = null) {
        const modal = document.getElementById('custom-modal');
        const modalText = document.getElementById('modal-text');
        const inputArea = document.getElementById('modal-input-area');
        const modalBtn = document.getElementById('modal-btn');
        const modalImg = document.getElementById('modal-illustration');

        modalText.innerText = text;
        
        // Gestion de l'image
        if (imagePath) {
            modalImg.src = imagePath;
            modalImg.style.display = 'block';
        } else {
            modalImg.style.display = 'none';
        }

        inputArea.style.display = 'none';
        modal.style.display = 'flex';

        modalBtn.onclick = () => {
            modal.style.display = 'none';
            if (callback) callback();
        };
    },

    // 2. Question avec saisie
    ask: function(text, callback, imagePath = null) {
        const modal = document.getElementById('custom-modal');
        const modalText = document.getElementById('modal-text');
        const inputArea = document.getElementById('modal-input-area');
        const inputField = document.getElementById('modal-input-field');
        const modalBtn = document.getElementById('modal-btn');
        const modalImg = document.getElementById('modal-illustration');

        modalText.innerText = text;
        inputField.value = "";
        
        if (imagePath) {
            modalImg.src = imagePath;
            modalImg.style.display = 'block';
        } else {
            modalImg.style.display = 'none';
        }

        inputArea.style.display = 'block';
        modal.style.display = 'flex';
        inputField.focus();

        modalBtn.onclick = () => {
            const val = inputField.value;
            modal.style.display = 'none';
            callback(val);
        };
    },

    // 3. AFFICHAGE DE L'OBJET TROUVÉ (Celle qui manquait)
    showItem: function(title, text, imagePath, callback = null) {
        const modal = document.getElementById('item-modal');
        const modalTitle = document.getElementById('item-modal-title');
        const modalText = document.getElementById('item-modal-text');
        const modalImg = document.getElementById('item-modal-img');
        const modalBtn = document.getElementById('item-modal-btn');

        if (modalTitle) modalTitle.innerText = title;
        if (modalText) modalText.innerText = text;
        if (modalImg) modalImg.src = imagePath;
        
        modal.style.display = 'flex';

        modalBtn.onclick = () => {
            modal.style.display = 'none';
            if (callback) callback();
        };
    }

};

// On exporte checkAnswer séparément pour qu'il soit accessible par { checkAnswer }
export function checkAnswer(input, validAnswers) {
    const clean = s => s.normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "") 
                        .toUpperCase()
                        .trim()
                        .replace(/\s+/g, " ");
    
    const target = clean(input);
    return validAnswers.map(clean).includes(target);
}