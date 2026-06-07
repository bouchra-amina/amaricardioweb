
// Simulation patient (plus tard remplacé par backend)
let patient = {
    nom: "Patient"
};

// Affichage bienvenue
document.getElementById("welcome").innerText =
    "Bonjour " + patient.nom + " 👋";

// Liste des questions (simulation)
let questions = [];

// Ajouter question
document.getElementById("questionForm").addEventListener("submit", function(e){
    e.preventDefault();

    let subject = document.getElementById("subject").value;
    let question = document.getElementById("question").value;

    let newQuestion = {
        subject,
        question,
        status: "En attente",
        response: ""
    };

    questions.push(newQuestion);

    document.getElementById("message").innerText =
        "Votre demande a été envoyée ✔";

    document.getElementById("questionForm").reset();

    renderQuestions();
});

// Affichage des questions
function renderQuestions(){
    let container = document.getElementById("questionsList");
    container.innerHTML = "";

    questions.forEach((q, index) => {
        container.innerHTML += `
            <div class="question">
                <strong>${q.subject}</strong>
                <p>${q.question}</p>
                <div class="status">Statut : ${q.status}</div>
            </div>
        `;
    });
}

