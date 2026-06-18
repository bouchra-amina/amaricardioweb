const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3002;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SERVE FRONTEND
========================= */
app.use(express.static(__dirname));

/* =========================
   MEMORY DB (TEMP)
========================= */
let users = [];
let questions = [];

/* =========================
   REGISTER
========================= */
app.post("/api/register", (req, res) => {
    const { full_name, email, password, age, gender } = req.body;

    if (!full_name || !email || !password || !age || !gender) {
        return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const exists = users.find(u => u.email === email);
    if (exists) {
        return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const user = {
        id: users.length + 1,
        full_name,
        email,
        password,
        age,
        gender
    };

    users.push(user);

    res.status(201).json({
        message: "Compte créé avec succès",
        user
    });
});

/* =========================
   LOGIN
========================= */
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.password !== password) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    res.json({
        message: "Connexion réussie",
        user
    });
});

/* =========================
   CREATE QUESTION
========================= */
app.post("/api/question", (req, res) => {
    const { patients_id, subject, question } = req.body;

    if (!patients_id || !question) {
        return res.status(400).json({ message: "Données invalides" });
    }

    const newQuestion = {
        id: questions.length + 1,
        patients_id,
        subject: subject || "",
        question,
        status: "pending",
        response: null,
        created_at: new Date()
    };

    questions.push(newQuestion);

    res.status(201).json({
        message: "Question envoyée",
        question: newQuestion
    });
});

/* =========================
   GET QUESTIONS (DOCTOR)
========================= */
app.get("/api/questions", (req, res) => {

    const result = questions.map(q => {
        const patient = users.find(u => u.id === q.patients_id);

        return {
            ...q,
            full_name: patient ? patient.full_name : "Inconnu"
        };
    });

    res.json(result);
});

/* =========================
   ANSWER QUESTION
========================= */
app.post("/api/repondre", (req, res) => {

    const { questionId, response } = req.body;

    const question = questions.find(q => q.id === Number(questionId));

    if (!question) {
        return res.status(404).json({ message: "Question introuvable" });
    }

    question.response = response;
    question.status = "answered";

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
