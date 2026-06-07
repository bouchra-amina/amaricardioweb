// Simulation des questions patients (plus tard API + DB)
let questions = [
    {
        patient: "Ahmed",
        subject: "Douleurs thoraciques",
        message: "J'ai des douleurs depuis 2 jours",
        status: "En attente",
        response: ""
    },
    {
        patient: "Fatima",
        subject: "Palpitations",
        message: "Battements rapides du cœur",
        status: "En attente",
        response: ""
    }
];

let selectedIndex = null;

// Afficher questions
function render(){
    let container = document.getElementById("questionsContainer");
    container.innerHTML = "";

    questions.forEach((q, index) => {

        container.innerHTML += `
            <div class="card">
                <h3>${q.patient}</h3>
                <p><strong>Sujet :</strong> ${q.subject}</p>
                <p>${q.message}</p>
                <div class="status">Statut : ${q.status}</div>

                <button class="btn" onclick="openModal(${index})">
                    Répondre
                </button>
            </div>
        `;
    });
}

render();

// Ouvrir modal
function openModal(index){
    selectedIndex = index;

    document.getElementById("modal").classList.remove("hidden");

    document.getElementById("questionText").innerText =
        questions[index].message;
}

// Fermer modal
function closeModal(){
    document.getElementById("modal").classList.add("hidden");
}

// Envoyer réponse
function sendResponse(){
    let response = document.getElementById("responseText").value;

    questions[selectedIndex].response = response;
    questions[selectedIndex].status = "Répondu";

    document.getElementById("responseText").value = "";

    closeModal();
    render();
}