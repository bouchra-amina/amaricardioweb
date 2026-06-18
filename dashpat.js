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
// LOAD QUESTIONS
// =========================
async function loadQuestions(userId) {

    try {
        const res = await fetch("https://amaricardioweb-production.up.railway.app/api/questions");

        const data = await res.json();

        // filtrage local (OK temporaire, mais mieux côté backend)
        const filtered = data.filter(q => q.patients_id == userId);

        const container = document.getElementById("questionsList");
        container.innerHTML = "";

        filtered.forEach(q => {
            container.innerHTML += `
                <div class="question">
                    <strong>${q.subject}</strong>
                    <p>${q.question}</p>
                    <small>Status: ${q.status}</small>
                    <p><b>Réponse:</b> ${q.response || "Pas encore répondu"}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}

// =========================
// TOAST
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

    toast.style.background = type === "success" ? "#16a34a" : "#dc2626";

    document.body.appendChild(toast);

    setTimeout(() => toast.remove(), 2500);
}
