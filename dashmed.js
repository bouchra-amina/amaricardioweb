let selectedQuestionId = null;

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

        const container = document.getElementById("questionsContainer");
        container.innerHTML = "";

        questions.forEach(q => {

            const preview = q.question.length > 100
                ? q.question.substring(0, 100) + "..."
                : q.question;

            container.innerHTML += `
                <div class="card">

                    <h3>${q.full_name || "Patient inconnu"}</h3>

                    <p><strong>Sujet :</strong> ${q.subject || "Sans sujet"}</p>

                    <p>${preview}</p>

                    <div class="status">
                        Statut : ${q.status}
                    </div>

                    <p><b>Réponse :</b> ${
                        q.response ? q.response : "Pas encore répondu"
                    }</p>

                    <button class="btn" onclick='openModal(${q.id}, ${JSON.stringify(q.question)}, ${JSON.stringify(q.full_name)}, ${JSON.stringify(q.subject)})'>
                        Répondre
                    </button>

                </div>
            `;
        });

    } catch (err) {
        console.error("Erreur loadQuestions:", err);
    }
}

// =========================
// OUVRIR MODAL
// =========================
function openModal(id, question, patientName, subject) {
    selectedQuestionId = id;

    document.getElementById("modal").classList.remove("hidden");

    document.getElementById("questionText").innerHTML = `
        <p><b>Patient :</b> ${patientName}</p>
        <p><b>Sujet :</b> ${subject || "Sans sujet"}</p>
        <hr>
        <p>${question}</p>
    `;
}

// =========================
// FERMER MODAL
// =========================
function closeModal() {
    document.getElementById("modal").classList.add("hidden");
    document.getElementById("responseText").value = "";
}

// =========================
// ENVOYER RÉPONSE
// =========================
async function sendResponse() {

    const response = document.getElementById("responseText").value.trim();

    if (!response) {
        alert("Écris une réponse");
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

        alert(result.message);

        closeModal();
        loadQuestions();

    } catch (err) {
        console.error("Erreur sendResponse:", err);
    }
}
