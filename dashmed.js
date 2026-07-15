/* ==========================================================
   DASHBOARD MEDECIN - CABINET DR AMARI
   JAVASCRIPT COMPLET
========================================================== */


const API_URL = "https://amaricardioweb-production.up.railway.app";


let allQuestions = [];

let selectedQuestionId = null;

let currentFilter = "all";





/* =========================
   INITIALISATION
========================= */


document.addEventListener("DOMContentLoaded", () => {


    loadQuestions();


    setupFilters();


    setupResponseCounter();


    setupLogout();



});







/* =========================
   CHARGER QUESTIONS
========================= */


async function loadQuestions(){


    try{


        const loading = document.getElementById("loading");

        if(loading){

            loading.style.display="block";

        }



        const response = await fetch(
            `${API_URL}/api/questions`
        );



        const data = await response.json();



        allQuestions = data || [];



        updateStatistics();



        displayQuestions();




        if(loading){

            loading.style.display="none";

        }




    }catch(error){


        console.error(
            "Erreur chargement questions :",
            error
        );


        document.getElementById("questionsContainer").innerHTML = `

            <div class="empty-state">

                <h3>Erreur de chargement</h3>

                <p>
                Impossible de récupérer les demandes patients.
                </p>

            </div>

        `;


    }


}








/* =========================
   STATISTIQUES
========================= */


function updateStatistics(){


    const total = allQuestions.length;


    const pending = allQuestions.filter(
        q => q.status === "pending"
    ).length;



    const answered = allQuestions.filter(
        q => q.status === "answered"
    ).length;



    document.getElementById(
        "totalQuestions"
    ).textContent = total;



    document.getElementById(
        "pendingQuestions"
    ).textContent = pending;



    document.getElementById(
        "answeredQuestions"
    ).textContent = answered;


}








/* =========================
   AFFICHAGE QUESTIONS
========================= */


function displayQuestions(){



    const container =
    document.getElementById(
        "questionsContainer"
    );



    container.innerHTML="";



    let filtered = allQuestions;



    if(currentFilter !== "all"){


        filtered = allQuestions.filter(
            q => q.status === currentFilter
        );


    }




    if(filtered.length === 0){


        container.innerHTML = `

        <div class="empty-state">


            <h3>
            Aucune demande trouvée
            </h3>


            <p>
            Il n'y a aucune demande correspondant au filtre sélectionné.
            </p>


        </div>

        `;


        return;

    }






    filtered.forEach(q => {



        const preview =
        q.question && q.question.length > 120

        ? q.question.substring(0,120)+"..."

        : q.question || "Aucun message";





        const date =
        q.created_at

        ? new Date(q.created_at)
        .toLocaleDateString("fr-FR")

        : "Date inconnue";





        const statusText =
        q.status==="answered"

        ? "Répondu"

        : "En attente";





        container.innerHTML += `



        <div class="question-card">



            <div class="patient-name">

                <i class="fa-solid fa-user"></i>

                ${escapeHTML(
                    q.full_name ||
                    "Patient N° "+q.patients_id
                )}

            </div>




            <div class="subject">

                <strong>
                Sujet :
                </strong>

                ${escapeHTML(
                    q.subject || "Sans sujet"
                )}

            </div>




            <div class="question-preview">


                "${escapeHTML(preview)}"


            </div>




            <div class="date">


                <i class="fa-regular fa-calendar"></i>

                ${date}


            </div>





            <span class="status ${q.status}">

                ${statusText}

            </span>




            <br>




            <button class="btn"
            onclick="openModal(${q.id})">


                <i class="fa-solid fa-reply"></i>

                Répondre / Voir


            </button>



        </div>



        `;



    });



}










/* =========================
   FILTRES
========================= */


function setupFilters(){


    const buttons =
    document.querySelectorAll(".filter");



    buttons.forEach(btn=>{


        btn.addEventListener(
            "click",
            ()=>{


                buttons.forEach(
                    b=>b.classList.remove("active")
                );


                btn.classList.add("active");



                currentFilter =
                btn.dataset.filter;



                displayQuestions();


            }
        );


    });


}








/* =========================
   OUVRIR MODAL
========================= */


function openModal(id){



    const question =
    allQuestions.find(
        q=>q.id===id
    );



    if(!question)
        return;



    selectedQuestionId=id;



    document
    .getElementById("modal")
    .classList.remove("hidden");





    document.getElementById(
        "questionText"
    ).innerHTML = `



        <p>

        <strong>Patient :</strong>

        ${escapeHTML(
            question.full_name ||
            "Patient N° "+question.patients_id
        )}

        </p>




        <p>

        <strong>Sujet :</strong>

        ${escapeHTML(
            question.subject || "Sans sujet"
        )}

        </p>



        <hr>



        <p>

        <strong>Message :</strong>

        <br>

        ${escapeHTML(
            question.question
        )}

        </p>



    `;




    document.getElementById(
        "responseText"
    ).value =
    question.response || "";


    updateResponseCounter();


/* =========================
   FERMER MODAL
========================= */


function closeModal(){


    document
    .getElementById("modal")
    .classList.add("hidden");



    selectedQuestionId=null;

}
/* =========================
   ENVOYER REPONSE
========================= */


async function sendResponse(){



    const response =
    document
    .getElementById("responseText")
    .value
    .trim();




    if(!response){


        alert(
            "Veuillez écrire une réponse."
        );


        return;

    }





    try{


        const res = await fetch(
            `${API_URL}/api/repondre`,
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },


                body:JSON.stringify({

                    questionId:selectedQuestionId,

                    response:response

                })

            }

        );





        if(res.ok){


            alert(
                "Réponse enregistrée avec succès."
            );


            closeModal();


            loadQuestions();



        }else{


            alert(
                "Erreur lors de l'enregistrement."
            );


        }




    }catch(error){


        console.error(error);


        alert(
            "Erreur réseau."
        );


    }



}

/* =========================
   COMPTEUR REPONSE
========================= */


function setupResponseCounter(){



    const textarea =
    document.getElementById(
        "responseText"
    );



    if(!textarea)
        return;



    textarea.addEventListener(
        "input",
        updateResponseCounter
    );



}


function updateResponseCounter(){


    const textarea =
    document.getElementById(
        "responseText"
    );



    const counter =
    document.getElementById(
        "responseCount"
    );



    if(textarea && counter){


        counter.textContent =
        `${textarea.value.length} / 1000 caractères`;

    }


}

/* =========================
   LOGOUT
========================= */


function setupLogout(){


    const btn =
    document.getElementById(
        "logoutBtn"
    );



    if(btn){


        btn.addEventListener(
            "click",
            ()=>{


                localStorage.removeItem(
                    "user"
                );


            }

        );


    }


}

/* =========================
   PROTECTION HTML
========================= */


function escapeHTML(text){


    if(!text)
        return "";



    return text
    .toString()
    .replace(
        /[&<>"']/g,
        function(char){

            const map={

                "&":"&amp;",
                "<":"&lt;",
                ">":"&gt;",
                '"':"&quot;",
                "'":"&#039;"

            };


            return map[char];

        }
    );


}
