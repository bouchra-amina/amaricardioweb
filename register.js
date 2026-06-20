document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    // 🛠️ MISE À JOUR : On envoie la clé "nom" au lieu de "full_name"
    const data = {
        nom: document.querySelector('input[name="full_name"]').value, // Récupère le champ HTML et l'associe à la clé "nom"
        email: document.querySelector('input[name="email"]').value,
        password: document.querySelector('input[name="password"]').value,
        age: document.querySelector('input[name="age"]').value,
        sexe: document.querySelector('select[name="sexe"]').value,
        wilaya: document.querySelector('input[name="wilaya"]').value,
        profession: document.querySelector('input[name="profession"]').value,
        medical_history: document.querySelector('textarea[name="medical_history"]').value
    };

    try {
        const res = await fetch("https://amaricardioweb-production.up.railway.app/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        // Afficher le message du serveur (sécurisé si le serveur renvoie une erreur brute)
        document.getElementById("message").innerText = result.message || "Une erreur est survenue.";

        // Si inscription réussie
        if (res.ok) {
            localStorage.setItem("user", JSON.stringify(result.user));

            // Redirection vers l'espace patient
            window.location.href = "dashpat.html";
        }

    } catch (error) {
        console.error("Erreur :", error);
        document.getElementById("message").innerText = "Erreur serveur";
    }
});
