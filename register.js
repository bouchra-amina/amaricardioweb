document.getElementById("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        full_name: document.querySelector('input[name="full_name"]').value,
        email: document.querySelector('input[name="email"]').value,
        password: document.querySelector('input[name="password"]').value,
        age: document.querySelector('input[name="age"]').value,
        gender: document.querySelector('select[name="gender"]').value,
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

        document.getElementById("message").innerText = result.message;

        if (res.ok) {
            localStorage.setItem("user", JSON.stringify(result.user));
            window.location.href = "dashpat.html";
        }

    } catch (error) {
        console.error(error);
        document.getElementById("message").innerText = "Erreur serveur";
    }
});
