document.getElementById("registerForm").addEventListener("submit", function(e){
    e.preventDefault();

    let nom = document.getElementById("nom").value;
    let age = document.getElementById("age").value;
    let sexe = document.getElementById("sexe").value;
    let wilaya = document.getElementById("wilaya").value;
    let telephone = document.getElementById("telephone").value;

    // Simulation d'enregistrement (plus tard API Railway/MySQL)
    let patient = {
        nom,
        age,
        sexe,
        wilaya,
        telephone
    };

    console.log("Patient enregistré :", patient);

    document.getElementById("message").innerText =
        "Compte créé avec succès ✔ Vous pouvez maintenant vous connecter.";

    // reset form
    document.getElementById("registerForm").reset();
});