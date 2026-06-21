document.addEventListener("DOMContentLoaded", () => {

    const user = JSON.parse(localStorage.getItem("user"));

    // Redirection propre sans le slash initial si les fichiers sont au même niveau
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userId = user.id;

    // Attention : Assure-toi que ton serveur renvoie bien .full_name et pas .nom
    document.getElementById("welcome").innerText = `Bienvenue, ${user.full_name || user.nom || "Patient"},dans votre espace patient sécurisé`;

    const form = document.getElementById("questionForm");

    // Chargement initial des demandes du patient
    loadQuestions(userId);

    // Soumission du formulaire
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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            if (res.ok) {
                form.reset();
                loadQuestions(userId);
                // Utilisation du popup pour une validation claire
                showPopup("Votre demande a été envoyée avec succès.");
            } else {
                showToast(result.message || "Erreur serveur", "error");
            }

        } catch (error) {
            console.error(error);
            showToast("Erreur réseau ❌", "error");
        }
    });

    // Liaison du bouton de fermeture du popup s'il existe dans le HTML
    const closeBtn = document.getElementById("closePopupBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", closePopup);
    }
});


// =========================
// LOAD QUESTIONS
// =========================
async function loadQuestions(userId) {
    try {
        const res = await fetch("https://amaricardioweb-production.up.railway.app/api/questions");
        const data = await res.json();

        const container = document.getElementById("questionsList");
        container.innerHTML = "";

        // Filtrage des questions de l'utilisateur connecté
        const myQuestions = data.filter(q => q.patients_id === userId);

        if (myQuestions.length === 0) {
            container.innerHTML = `<p>Aucune question pour le moment.</p>`;
            return;
        }

        myQuestions.forEach(q => {
            const shortQuestion = q.question.length > 120
                ? q.question.substring(0, 120) + "..."
                : q.question;

            // Gestion de l'affichage du statut avec une classe CSS dynamique
            container.innerHTML += `
                <div class="question-card">
                    <div class="question-header">
                        <strong>${q.subject || "Sans sujet"}</strong>
                        <span class="status ${q.status}">${q.status === 'pending' ? 'En attente' : 'Répondu'}</span>
                    </div>

                    <p>${shortQuestion}</p>

                    <div class="response">
                        <b>Réponse du Dr Amari :</b>
                        <p>${q.response || "Pas encore de réponse"}</p>
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
// GESTION DU POPUP HTML
// =========================
function showPopup(message) {
    const popup = document.getElementById("popup");
    const popupMessage = document.getElementById("popupMessage");
    if (popup && popupMessage) {
        popupMessage.textContent = message;
        popup.classList.remove("hidden");
    }
}

function closePopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        popup.classList.add("hidden");
    }
}

// =========================
// TOAST NOTIFICATION (UI PRO)
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
    toast.style.transition = "opacity 0.3s ease";
    toast.style.opacity = "1";

    toast.style.background = type === "success" ? "#16a34a" : "#dc2626";

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
