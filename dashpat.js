document.addEventListener("DOMContentLoaded", () => {

    const userId = localStorage.getItem("userId");

    // 🔒 protection page
    if (!userId) {
        window.location.href = "/login.html";
        return;
    }

    loadQuestions(userId);

    const form = document.getElementById("questionForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        const data = {
            patientId: userId,
            sujet: document.getElementById("subject").value,
            message: document.getElementById("question").value
        };

        try {
            const res = await fetch("https://ton-backend-url/api/question", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await res.json();

            document.getElementById("message").innerText = result.message;

            form.reset();

            loadQuestions(userId);

        } catch (error) {
            console.error(error);
            document.getElementById("message").innerText = "Erreur lors de l'envoi";
        }
    });

});
