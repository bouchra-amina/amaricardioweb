document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "/login.html";
        return;
    }

    const userId = user.id;

    const form = document.getElementById("questionForm");
    const messageBox = document.getElementById("message");

    loadQuestions(userId);

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const sujet = document.getElementById("subject").value.trim();
        const message = document.getElementById("question").value.trim();

        if (!sujet || !message) {
            messageBox.innerText = "Veuillez remplir tous les champs";
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
                messageBox.innerText = result.message;
                form.reset();
                loadQuestions(userId);
            } else {
                messageBox.innerText = result.message;
            }

        } catch (error) {
            console.error(error);
            messageBox.innerText = "Erreur réseau";
        }
    });

});

// =========================
// LOAD QUESTIONS FIXED
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
        console.error("loadQuestions error:", error);
        document.getElementById("questionsList").innerHTML =
            "<p>Erreur de chargement des questions</p>";
    }
}
