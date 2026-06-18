document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "/login.html";
        return;
    }

    const userId = user.id;

    document.getElementById("welcome").innerText =
        `Bienvenue, ${user.full_name}`;

    const form = document.getElementById("questionForm");

    loadQuestions(userId);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const subject = document.getElementById("subject").value.trim();
        const question = document.getElementById("question").value.trim();

        if (!subject || !question) {
            showToast("Veuillez remplir tous les champs ❌", "error");
            return;
        }

        const data = {
            patients_id: userId,
            subject,
            question
        };

        try {
            const res = await fetch("https://amaricardioweb-production.up.railway.app/api/question", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                form.reset();
                loadQuestions(userId);
                showToast("Question envoyée avec succès ✅", "success");
            } else {
                showToast(result.message || "Erreur serveur", "error");
            }

        } catch (error) {
            console.error(error);
            showToast("Erreur réseau ❌", "error");
        }
    });

});

// =========================
// LOAD QUESTIONS (OPTIMISÉ)
// =========================
async function loadQuestions(userId) {

    try {
        const res = await fetch("https://amaricardioweb-production.up.railway.app/api/questions");

        const data = await res.json();

        const container = document.getElementById("questionsList");
        container.innerHTML = "";

        // filtrage propre côté frontend (OK pour ton projet actuel)
        const myQuestions = data.filter(q => q.patients_id === userId);

        if (myQuestions.length === 0) {
            container.innerHTML = `<p>Aucune question pour le moment.</p>`;
            return;
        }

        myQuestions.forEach(q => {

            const shortQuestion = q.question.length > 120
                ? q.question.substring(0, 120) + "..."
                : q.question;

            container.innerHTML += `
                <div class="question-card">
                    <div class="question-header">
                        <strong>${q.subject || "Sans sujet"}</strong>
                        <span class="status ${q.status}">${q.status}</span>
                    </div>

                    <p>${shortQuestion}</p>

                    <div class="response">
                        <b>Réponse :</b>
                        <p>${q.response || "Pas encore répondu"}</p>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error("Erreur loadQuestions:", error);
        showToast("Erreur chargement des questions", "error");
    }
}

// =========================
// TOAST NOTIFICATION
// =========================
function showToast(message, type) {

    const toast = document.createElement("div");

    toast.innerText = message;

    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 18px";
    toast.style.borderRadius = "10px";
    toast.style.color = "white";
    toast.style.zIndex = "9999";
    toast.style.fontSize = "14px";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    toast.style.transition = "0.3s ease";

    toast.style.background = type === "success" ? "#16a34a" : "#dc2626";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}
