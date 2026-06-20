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

        // vérifier email existant
        const check = await pool.query(
            "SELECT * FROM patients WHERE email = $1",
            [email]
        );

        if (check.rows.length > 0) {
            return res.status(409).json({
                message: "Email déjà utilisé"
            });
        }

        // insertion
        const result = await pool.query(
            `INSERT INTO patients
            (nom, email, password, age, sexe, wilaya, profession, maladies)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *`,
            [
                full_name,
                email,
                password,
                age,
                sexe,                // PAS gender
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
