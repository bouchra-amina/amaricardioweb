let selectedQuestionId = null;
window.allQuestions = []; // Tableau global pour stocker les questions de manière sécurisée

document.addEventListener("DOMContentLoaded", () => {
    loadQuestions();
});

// =========================
// CHARGER QUESTIONS (API)
// =========================
async function loadQuestions() {
    try {
        const res = await fetch("https://amaricardioweb-production.up.railway.app/api/questions");
        const questions = await res.json();
        
        // On sauvegarde les questions dans notre variable globale
        window.allQuestions = questions;

        const container = document.getElementById("questionsContainer");
        container.innerHTML = "";

        if (questions.length === 0) {
            container.innerHTML = "<p class='no-data'>Aucune demande de patient pour le moment.</p>";
            return;
        }

        questions.forEach(q => {
            // Extrait le début de la demande (100 caractères max)
            const preview = q.question && q.question.length > 100
                ? q.question.substring(0, 100) + "..."
                : q.question;

            // Gestion de l'affichage du badge de statut
            const statusClass = q.status === 'answered' ? 'status answered' : 'status pending';
            const statusText = q.status === 'answered' ? 'Répondu' : 'En attente';

            container.innerHTML += `
                <div class="card">
                    <h3>${q.full_name || "Patient inconnu"}</h3>
                    <p><strong>Sujet :</strong> ${q.subject || "Sans sujet"}</p>
                    <p class="preview-text">"${preview}"</p>
                    
                    <div class="${statusClass}">
                        ${statusText}
                    </div>

                    <p class="response-box"><b>Réponse :</b> ${
                        q.response ? q.response : "<i>Pas encore répondu</i>"
                    }</p>

                    <button class="btn" onclick="prepareModal(${q.id})">
                        Répondre / Voir
                    </button>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erreur loadQuestions:", err);
    }
}

// =========================
// PRÉPARER ET OUVRIR LE MODAL
// =========================
function prepareModal(id) {
    // On retrouve la question dans notre tableau global grâce à son ID
    const q = window.allQuestions.find(item => item.id === id);
    if (!q) return;

    selectedQuestionId = id;

    // Affiche le modal en retirant la classe hidden
    document.getElementById("modal").classList.remove("hidden");

    // Rempli les textes proprement sans casser le HTML
    document.getElementById("questionText").innerHTML = `
        <p><b>Patient :</b> ${q.full_name || "Inconnu"}</p>
        <p><b>Sujet :</b> ${q.subject || "Sans sujet"}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
        <p class="full-question-text"><b>Message du patient :</b><br>${q.question}</p>
    `;

    // Si le médecin a déjà répondu, on pré-remplit le textarea avec son ancienne réponse
    document.getElementById("responseText").value = q.response || "";
}

// =========================
// FERMER MODAL
// =========================
function closeModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("responseText").value = "";
    selectedQuestionId = null;
}

// =========================
// ENVOYER RÉPONSE
// =========================
async function sendResponse() {
    const response = document.getElementById("responseText").value.trim();

    if (!response) {
        alert("Veuillez écrire une réponse avant d'envoyer.");
        return;
    }

    try {
        const res = await fetch("https://amaricardioweb-production.up.railway.app/api/repondre", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                questionId: selectedQuestionId,
                response: response
            })
        });

        const result = await res.json();
        
        alert("Réponse enregistrée avec succès !");
        closeModal();
        loadQuestions(); // Recharge la liste immédiatement pour voir le statut mis à jour

    } catch (err) {
        console.error("Erreur sendResponse:", err);
        alert("Une erreur est survenue lors de l'envoi.");
    }
}
