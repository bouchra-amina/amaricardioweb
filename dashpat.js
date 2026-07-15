// ======================================================
// DASHBOARD PATIENT - CABINET DR AMARI
// Partie 1
// ======================================================

const API_URL = "https://amaricardioweb-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {

    // ==========================
    // Récupération utilisateur
    // ==========================

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const userId = user.id;

    // ==========================
    // Message de bienvenue
    // ==========================

    const welcome = document.getElementById("welcome");

    if (welcome) {

        welcome.innerHTML =
            `Bonjour ${user.full_name || user.nom || "Patient"} 👋`;

    }

    // ==========================
    // Compteur caractères
    // ==========================

    const textarea = document.getElementById("question");
    const counter = document.getElementById("count");

    if (textarea && counter) {

        textarea.addEventListener("input", () => {

            counter.innerHTML =
                `${textarea.value.length} / 500 caractères`;

        });

    }

    // ==========================
    // Déconnexion
    // ==========================

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", (e) => {

            const confirmation =
                confirm("Voulez-vous vraiment vous déconnecter ?");

            if (!confirmation) {

                e.preventDefault();
                return;

            }

            localStorage.removeItem("user");

        });

    }

    // ==========================
    // Chargement des demandes
    // ==========================

    loadQuestions(userId);

    // ==========================
    // Envoi formulaire
    // ==========================

    const form = document.getElementById("questionForm");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const subject =
            document.getElementById("subject").value.trim();

        const question =
            document.getElementById("question").value.trim();

        if (!subject || !question) {

            showToast(
                "Veuillez remplir tous les champs.",
                "error"
            );

            return;

        }

        const submitBtn =
            document.getElementById("submitBtn");

        submitBtn.disabled = true;
        submitBtn.innerHTML =
            `<i class="fa-solid fa-spinner fa-spin"></i> Envoi...`;

        try {

            const response = await fetch(
                `${API_URL}/api/question`,
                {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        patients_id: userId,
                        subject,
                        question

                    })

                }
            );

            const result = await response.json();

            if (response.ok) {

                form.reset();

                counter.innerHTML =
                    "0 / 500 caractères";

                showPopup(
                    "Votre demande a été envoyée avec succès. Le Dr Amari vous répondra dès que possible."
                );

                loadQuestions(userId);

            }

            else {

                showToast(
                    result.message || "Erreur serveur",
                    "error"
                );

            }

        }

        catch (error) {

            console.error(error);

            showToast(
                "Erreur réseau.",
                "error"
            );

        }

        finally {

            submitBtn.disabled = false;

            submitBtn.innerHTML =
                `<i class="fa-solid fa-paper-plane"></i> Envoyer la demande`;

        }

    });

    // ==========================
    // Fermeture popup
    // ==========================

    const closePopupBtn =
        document.getElementById("closePopupBtn");

    if (closePopupBtn) {

        closePopupBtn.addEventListener("click", () => {

            closePopup();

        });

    }

});
// ======================================================
// DASHBOARD PATIENT - CABINET DR AMARI
// Partie 2
// ======================================================


// ==========================
// CHARGEMENT DES QUESTIONS
// ==========================

async function loadQuestions(userId) {

    const container =
        document.getElementById("questionsList");

    const loading =
        document.getElementById("loading");


    try {

        // Afficher loader

        if (loading) {

            loading.style.display = "block";

        }


        const response = await fetch(
            `${API_URL}/api/questions`
        );


        const questions = await response.json();


        // Filtrer les questions du patient connecté

        const myQuestions =
            questions.filter(
                q => Number(q.patients_id) === Number(userId)
            );


        // Cacher loader

        if (loading) {

            loading.style.display = "none";

        }


        // Mise à jour du titre

        const title =
            document.getElementById("questionsTitle");


        if (title) {

            title.innerHTML =
            `
            <i class="fa-solid fa-folder-open"></i>
            Mes demandes (${myQuestions.length})
            `;

        }



        // Nettoyage

        container.innerHTML = "";



        // Aucun résultat

        if (myQuestions.length === 0) {


            container.innerHTML =
            `
            <div class="empty-state">

                <i class="fa-solid fa-folder-open"></i>

                <h3>Aucune demande</h3>

                <p>
                Vous n'avez pas encore envoyé de question
                au Dr Amari.
                </p>

            </div>
            `;


            return;

        }



        // Affichage des demandes

        myQuestions.forEach(q => {


            const date =
            q.created_at
            ?
            new Date(q.created_at)
            .toLocaleDateString("fr-FR")
            :
            "Date inconnue";



            const statusText =
                q.status === "pending"
                ?
                "🟡 En attente"
                :
                "🟢 Répondu";



            const responseHTML =
            q.response

            ?

            `
            <div class="response">

                <div class="response-title">

                    <i class="fa-solid fa-user-doctor"></i>
                    Réponse du Dr Amari

                </div>

                <p>
                    ${q.response}
                </p>

            </div>
            `

            :

            `
            <div class="response no-response">

                <div class="response-title">

                    <i class="fa-solid fa-clock"></i>
                    En attente de réponse

                </div>

                <p>
                    Le médecin n'a pas encore répondu.
                </p>

            </div>
            `;



            // Gestion texte long

            const longQuestion =
                q.question.length > 150;



            const questionText =
            longQuestion
            ?
            `
            <p class="question-text">

                <span class="short-text">

                ${q.question.substring(0,150)}
                ...

                </span>


                <span class="full-text" style="display:none">

                ${q.question}

                </span>


                <span class="read-more">

                    Voir plus

                </span>


            </p>
            `
            :
            `
            <p class="question-text">

                ${q.question}

            </p>
            `;



            container.innerHTML +=

            `
            <div class="question-card">


                <div class="question-header">


                    <strong>

                        🩺 ${q.subject || "Sans sujet"}

                    </strong>


                    <span class="status ${q.status}">

                        ${statusText}

                    </span>


                </div>



                <div class="question-date">

                    <i class="fa-regular fa-calendar"></i>

                    Envoyée le ${date}

                </div>



                ${questionText}


                ${responseHTML}


            </div>
            `;


        });



        // Activation Voir plus

        activateReadMore();


    }

    catch(error) {


        console.error(
            "Erreur chargement questions :",
            error
        );


        if (loading) {

            loading.style.display="none";

        }


        showToast(
            "Impossible de charger vos demandes.",
            "error"
        );


    }

}



// ==========================
// VOIR PLUS / VOIR MOINS
// ==========================

function activateReadMore(){


    const buttons =
    document.querySelectorAll(".read-more");


    buttons.forEach(btn => {


        btn.addEventListener("click",()=>{


            const parent =
            btn.parentElement;


            const shortText =
            parent.querySelector(".short-text");


            const fullText =
            parent.querySelector(".full-text");



            if(fullText.style.display==="none"){


                shortText.style.display="none";

                fullText.style.display="inline";

                btn.innerText="Voir moins";


            }

            else{


                shortText.style.display="inline";

                fullText.style.display="none";

                btn.innerText="Voir plus";


            }


        });


    });


}



// ==========================
// POPUP
// ==========================

function showPopup(message){


    const popup =
    document.getElementById("popup");


    const popupMessage =
    document.getElementById("popupMessage");



    if(popup && popupMessage){


        popupMessage.innerText =
        message;


        popup.classList.remove("hidden");


    }


}



function closePopup(){


    const popup =
    document.getElementById("popup");


    if(popup){

        popup.classList.add("hidden");

    }


}



// ==========================
// TOAST MESSAGE
// ==========================

function showToast(message,type){


    const toast =
    document.createElement("div");



    toast.innerText =
    message;



    toast.style.position="fixed";

    toast.style.top="20px";

    toast.style.right="20px";

    toast.style.padding="15px 20px";

    toast.style.borderRadius="12px";

    toast.style.color="white";

    toast.style.fontSize="14px";

    toast.style.zIndex="9999";

    toast.style.boxShadow=
    "0 10px 25px rgba(0,0,0,.15)";



    toast.style.background =
    type==="error"
    ?
    "#dc2626"
    :
    "#16a34a";



    document.body.appendChild(toast);



    setTimeout(()=>{


        toast.style.opacity="0";


        setTimeout(()=>{

            toast.remove();

        },300);


    },2500);



}
