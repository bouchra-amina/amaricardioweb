let selectedQuestionId = null;
window.allQuestions = []; 

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
        
        window.allQuestions = questions;

        const container = document.getElementById("questionsContainer");
        container.innerHTML = "";

        // Si le tableau est vide (ou si la jointure SQL n'a rien renvoyé)
        if (!questions || questions.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <p>Aucune demande de patient trouvée dans le système.</p>
                    <small>Vérifie que le patient avec l'ID 1 existe bien dans la table 'patients'.</small>
                </div>
            `;
            return;
        }

        questions.forEach(q => {
            const preview = q.question ? (q.question.length > 100 ? q.question.substring(0, 100) + "..." : q.question) : "Pas de message";
            const statusClass = q.status === 'answered' ? 'status answered' : 'status pending';
            const statusText = q.status === 'answered' ? 'Répondu' : 'En attente';

            container.innerHTML += `
                <div class="card" style="background: white; padding: 20px; margin-bottom: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3>${q.full_name || "Patient N° " + q.patients_id}</h3>
                    <p><strong>Sujet :</strong> ${q.subject || "Sans sujet"}</p>
                    <p class="preview-text"><em>"${preview}"</em></p>
                    
                    <div class="${statusClass}" style="margin: 10px 0; display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                        ${statusText}
                    </div>

                    <p class="response-box"><b>Réponse :</b> ${
                        q.response ? q.response : "<i>Pas encore répondu</i>"
                    }</p>

                    <button class="btn" onclick="prepareModal(${q.id})" style="cursor: pointer;">
                        Répondre / Voir
                    </button>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erreur loadQuestions:", err);
        document.getElementById("questionsContainer").innerHTML = "<p style='color: red;'>Erreur lors du chargement des données de l'API.</p>";
    }
}

// =========================
// PRÉPARER ET OUVRIR LE MODAL
// =========================
function prepareModal(id) {
    const q = window.allQuestions.find(item => item.id === id);
    if (!q) return;

    selectedQuestionId = id;
    document.getElementById("modal").classList.remove("hidden");

    document.getElementById("questionText").innerHTML = `
        <p><b>Patient :</b> ${q.full_name || "Patient N° " + q.patients_id}</p>
        <p><b>Sujet :</b> ${q.subject || "Sans sujet"}</p>
        <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
        <p class="full-question-text"><b>Message :</b><br>${q.question}</p>
    `;

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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                questionId: selectedQuestionId,
                response: response
            })
        });

        if (res.ok) {
            alert("Réponse enregistrée avec succès !");
            closeModal();
            loadQuestions();
        } else {
            alert("Erreur lors de l'enregistrement.");
        }

    } catch (err) {
        console.error("Erreur sendResponse:", err);
    }
}
