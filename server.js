const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   STATIC FRONTEND
========================= */
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   "DATABASE" TEMPORAIRE
   (sera remplacée par MySQL)
========================= */

let patients = [];
let questions = [];

/* =========================
   ROUTES
========================= */

/* --- INSCRIPTION PATIENT --- */
app.post("/api/register", (req, res) => {
    const patient = {
        id: patients.length + 1,
        nom: req.body.nom,
        age: req.body.age,
        sexe: req.body.sexe,
        wilaya: req.body.wilaya,
        telephone: req.body.telephone,
        profession: req.body.profession,
        maladies: req.body.maladies
    };

    patients.push(patient);

    res.json({
        message: "Compte créé avec succès",
        patient
    });
});

/* --- ENVOI QUESTION PATIENT --- */
app.post("/api/question", (req, res) => {
    const question = {
        id: questions.length + 1,
        patientId: req.body.patientId,
        sujet: req.body.sujet,
        message: req.body.message,
        status: "En attente",
        reponse: ""
    };

    questions.push(question);

    res.json({
        message: "Question envoyée",
        question
    });
});

/* --- GET QUESTIONS (DOCTEUR) --- */
app.get("/api/questions", (req, res) => {
    res.json(questions);
});

/* --- REPONSE MEDECIN --- */
app.post("/api/repondre", (req, res) => {
    const { questionId, reponse } = req.body;

    const question = questions.find(q => q.id == questionId);

    if (!question) {
        return res.status(404).json({ message: "Question introuvable" });
    }

    question.reponse = reponse;
    question.status = "Répondu";

    res.json({
        message: "Réponse enregistrée",
        question
    });
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});