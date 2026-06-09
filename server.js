const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SERVE FRONTEND (IMPORTANT)
   👉 permet d’ouvrir register.html / login.html
========================= */
app.use(express.static(__dirname));

/* =========================
   FAKE DATABASE (MEMOIRE)
========================= */
let users = [];
let questions = [];

/* =========================
   REGISTER
========================= */
app.post("/api/register", (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            age,
            gender,
            wilaya,
            profession,
            medical_history
        } = req.body;

        if (!full_name || !email || !password || !age || !gender) {
            return res.status(400).json({
                message: "Champs obligatoires manquants"
            });
        }

        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                message: "Email déjà utilisé"
            });
        }

        const user = {
            id: users.length + 1,
            full_name,
            email,
            password,
            age,
            gender,
            wilaya,
            profession,
            medical_history
        };

        users.push(user);

        res.status(201).json({
            message: "Compte créé avec succès",
            user
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/* =========================
   LOGIN
========================= */
app.post("/api/login", (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email et mot de passe requis"
            });
        }

        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Mot de passe incorrect"
            });
        }

        res.json({
            message: "Connexion réussie",
            user
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/* =========================
   ENVOI QUESTION PATIENT
========================= */
app.post("/api/question", (req, res) => {
    try {
        const { patientId, sujet, message } = req.body;

        if (!patientId || !sujet || !message) {
            return res.status(400).json({
                message: "Données invalides"
            });
        }

        const question = {
            id: questions.length + 1,
            patientId,
            sujet,
            message,
            status: "En attente",
            reponse: ""
        };

        questions.push(question);

        res.status(201).json({
            message: "Question envoyée",
            question
        });

    } catch (err) {
        console.error("QUESTION ERROR:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/* =========================
   GET QUESTIONS (MEDECIN)
========================= */
app.get("/api/questions", (req, res) => {
    res.json(questions);
});

/* =========================
   REPONSE MEDECIN
========================= */
app.post("/api/repondre", (req, res) => {
    try {
        const { questionId, reponse } = req.body;

        const question = questions.find(q => q.id == questionId);

        if (!question) {
            return res.status(404).json({
                message: "Question introuvable"
            });
        }

        question.reponse = reponse;
        question.status = "Répondu";

        res.json({
            message: "Réponse enregistrée",
            question
        });

    } catch (err) {
        console.error("RESPONSE ERROR:", err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
