document.addEventListener("DOMContentLoaded", () => {

// DOM Elements
const courseDropdown = document.querySelector(".dropdownContent");
const sidebar = document.getElementById("sidebar");
const contentMain = document.getElementById("contentMain");

// User State

// Event Listeners for Course and Section Interaction
sidebar.addEventListener("click", (e) => {
    const unit = e.target.closest(".unit");
    if (unit && !e.target.classList.contains("section")) {
        const sections = Array.from(unit.querySelectorAll(".section"));
        sections.forEach(section => {
            section.style.display = section.style.display === "none" ? "block" : "none";
        });
    }

    const section = e.target.closest(".section");
    if (section) {
        document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
        section.classList.add("active");

        const sectionName = section.dataset.section;
        contentMain.innerHTML = `
            <h1>${sectionName}</h1>
            <p>This is the lesson for ${sectionName}.</p>
            <p>Here you'll find videos, text, questions, and more.</p>
        `;
    }
});

document.getElementById("profileBtn").addEventListener("click", () => {
    window.location.href = "auth.html";
});

// Add Hover Listener for Dropdown
document.querySelector(".dropdown").addEventListener("mouseover", async () => {
    if (currentUser) {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            updateCourseDropdown(userData.unlockedCourses);
        }
    }
});
})
