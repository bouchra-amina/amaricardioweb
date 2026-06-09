document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        email: document.querySelector('input[name="email"]').value,
        password: document.querySelector('input[name="password"]').value
    };

    try {

        const res = await fetch("https://TON-URL-RAILWAY/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await res.json();

        document.getElementById("message").innerText = result.message;

        if (res.ok) {
            localStorage.setItem("user", JSON.stringify(result.user));

            window.location.href = "dashpat.html";
        }

    } catch (error) {
        console.error(error);
        document.getElementById("message").innerText =
            "Erreur de connexion au serveur";
    }
});
