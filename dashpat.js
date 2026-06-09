document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "/login.html";
        return;
    }

    const userId = user.id;

    // 👤 Welcome message dynamique
    document.getElementById("welcome").innerText =
        `Bienvenue, ${user.full_name}`;

    const form = document.getElementById("questionForm");
    const messageBox = document.getElementById("message");

    loadQuestions(userId);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const sujet = document.getElementById("subject").value.trim();
        const message = document.getElementById("question").value.trim();

        if (!sujet || !message) {
            showToast("Veuillez remplir tous les champs ❌", "error");
            return;
        }

        const data = {
            patientId: userId,
            sujet,
            message
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

        const filtered = data.filter(q => q.patientId == userId);

        const container = document.getElementById("questionsList");
        container.innerHTML = "";

        filtered.forEach(q => {
            container.innerHTML += `
                <div class="question">
                    <strong>${q.sujet}</strong>
                    <p>${q.message}</p>
                    <small>Status: ${q.status}</small>
                    <p><b>Réponse:</b> ${q.reponse || "Pas encore répondu"}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);
    }
}

// =========================
// POPUP NOTIFICATION (TOAST)
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
    toast.style.animation = "fadeIn 0.3s ease";

    if (type === "success") {
        toast.style.background = "#16a34a";
    } else {
        toast.style.background = "#dc2626";
    }

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 2500);
}
