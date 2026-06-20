const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3002;

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/* =========================
   POSTGRES CONNECTION
========================= */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

/* =========================
   TEST DB
========================= */
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "DB CONNECTÉE ✅",
            time: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "DB NON CONNECTÉE ❌",
            error: err.message
        });
    }
});

/* =========================
   REGISTER
========================= */
app.post("/api/register", async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            age,
            sexe,
            wilaya,
            profession,
            medical_history
        } = req.body;

        // Vérifier si email existe déjà
        const check = await pool.query(
            "SELECT * FROM patients WHERE email = $1",
            [email]
        );

        if (check.rows.length > 0) {
            return res.status(409).json({
                message: "Email déjà utilisé"
            });
        }

        // 🛠️ CORRECTION : Remplacement de "nom" par "full_name" pour correspondre à ta table Postgres Railway
        const result = await pool.query(
            `INSERT INTO patients 
            (full_name, email, password, age, sexe, wilaya, profession, maladies)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                full_name,
                email,
                password,
                age,
                sexe,
                wilaya || null,
                profession || null,
                medical_history || null
            ]
        );

        res.json({
            message: "Compte créé avec succès",
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

/* =========================
   LOGIN
========================= */
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await pool.query(
            "SELECT * FROM patients WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        const user = result.rows[0];

        if (user.password !== password) {
            return res.status(401).json({
                message: "Mot de passe incorrect"
            });
        }

        res.json({
            message: "Connexion réussie",
            user: user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

/* =========================
   CREATE QUESTION
========================= */
app.post("/api/question", async (req, res) => {
    try {
        const { patients_id, subject, question } = req.body;

        const result = await pool.query(
            `INSERT INTO patients_questions 
            (patients_id, subject, question, status, response)
            VALUES ($1, $2, $3, 'pending', NULL)
            RETURNING *`,
            [patients_id, subject, question]
        );

        res.json({
            message: "Question envoyée",
            question: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

/* =========================
   GET QUESTIONS (DOCTOR & PATIENT FILTER)
========================= */
app.get("/api/questions", async (req, res) => {
    try {
        // 🛠️ CORRECTION : Récupération de p.full_name au lieu de p.nom qui faisait planter la jointure SQL (Erreur 500)
        const result = await pool.query(`
            SELECT
                q.id,
                q.patients_id,
                q.subject,
                q.question,
                q.status,
                q.response,
                q.created_at,
                p.full_name
            FROM patients_questions q
            JOIN patients p ON p.id = q.patients_id
            ORDER BY q.id DESC
        `);

        res.json(result.rows);

    } catch (err) {
        console.error("Erreur dans GET /api/questions :", err.message);
        res.status(500).json({
            message: "Erreur lors de la récupération des questions",
            error: err.message
        });
    }
});

/* =========================
   ANSWER QUESTION
========================= */
app.post("/api/repondre", async (req, res) => {
    try {
        const { questionId, response } = req.body;

        const result = await pool.query(
            `UPDATE patients_questions
            SET response = $1,
                status = 'answered'
            WHERE id = $2
            RETURNING *`,
            [response, questionId]
        );

        res.json({
            message: "Réponse enregistrée",
            question: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message
        });
    }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
