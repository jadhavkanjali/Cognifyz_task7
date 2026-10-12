const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse form submissions.
app.use(express.urlencoded({
    extended: false,
    limit: "10kb",
    parameterLimit: 20
}));

app.use(express.static(path.join(__dirname, "public")));

const registrations = [];

const allowedCourses = [
    "Web Development",
    "Python Programming",
    "Data Science",
    "Cyber Security"
];

function validName(name) {
    return typeof name === "string" &&
        name.length >= 2 &&
        name.length <= 60 &&
        /^[\p{L}][\p{L}\p{M} .'-]*$/u.test(name);
}

function validEmail(email) {
    return typeof email === "string" &&
        email.length <= 254 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
    const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    };

    return String(value).replace(/[&<>"']/g, char => entities[char]);
}

function resultPage(title, message, success = false) {
    const color = success ? "#166534" : "#b91c1c";

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapeHtml(title)}</title>
        </head>
        <body style="font-family: Arial; background: #f1f5fb; padding: 30px;">
            <main style="max-width: 550px; margin: 50px auto; padding: 30px;
                         background: white; border-radius: 12px; text-align: center;">
                <h1 style="color: ${color};">${escapeHtml(title)}</h1>
                <p>${escapeHtml(message)}</p>
                <a href="/">Return to registration form</a>
            </main>
        </body>
        </html>
    `;
}

app.post("/submit", (req, res) => {
    const { name, email, age, course, message = "" } = req.body;

    if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof age !== "string" ||
        typeof course !== "string" ||
        typeof message !== "string"
    ) {
        return res.status(400).send(
            resultPage("Invalid Submission", "Please submit valid form data.")
        );
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanMessage = message.trim();
    const cleanAge = Number(age);

    if (!validName(cleanName)) {
        return res.status(400).send(
            resultPage("Invalid Name", "Enter a valid name between 2 and 60 characters.")
        );
    }

    if (!validEmail(cleanEmail)) {
        return res.status(400).send(
            resultPage("Invalid Email", "Enter a valid email address.")
        );
    }

    if (
        age.trim() === "" ||
        !Number.isInteger(cleanAge) ||
        cleanAge < 13 ||
        cleanAge > 100
    ) {
        return res.status(400).send(
            resultPage("Invalid Age", "Age must be a whole number from 13 to 100.")
        );
    }

    if (!allowedCourses.includes(course)) {
        return res.status(400).send(
            resultPage("Invalid Course", "Select a course from the available list.")
        );
    }

    if (cleanMessage.length > 500) {
        return res.status(400).send(
            resultPage("Invalid Message", "Message cannot exceed 500 characters.")
        );
    }

    const registration = {
        id: registrations.length + 1,
        name: cleanName,
        email: cleanEmail,
        age: cleanAge,
        course,
        message: cleanMessage,
        submittedAt: new Date().toISOString()
    };

    registrations.push(registration);

    console.log("Validated registration:", registration);

    return res.status(201).send(
        resultPage(
            "Registration Successful!",
            "Thank you, " + registration.name +
            ". Your registration has been received.",
            true
        )
    );
});

app.get("/status", (req, res) => {
    res.json({
        project: "Cognifyz Task 2",
        status: "Server running",
        storedRegistrations: registrations.length
    });
});

app.use((req, res) => {
    res.status(404).send(
        resultPage("Page Not Found", "The requested page does not exist.")
    );
});

app.listen(PORT, () => {
    console.log(`Cognifyz Task 2 running at http://localhost:${PORT}`);
});
