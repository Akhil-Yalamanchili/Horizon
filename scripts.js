fetch('horizonCourseData(2024-2025).txt')
    .then(response => response.text())
    .then(data => {
        const contentMain = document.getElementById("contentMain");
        const sidebar = document.getElementById("sidebar");
        const courseDropdown = document.querySelector(".dropdownContent");
        const lines = data.split('\n');
        const courses = {};

        lines.forEach(line => {
            const [course, unit, section, topic, text] = line.split(',');

            if (!courses[course]) {
                courses[course] = {};
            }
            if (!courses[course][unit]) {
                courses[course][unit] = {};
            }
            if (!courses[course][unit][section]) {
                courses[course][unit][section] = [];
            }
            courses[course][unit][section].push({ topic, text });
        });

        Object.keys(courses).forEach(course => {
            const courseOption = document.createElement('a');
            courseOption.classList.add('courseOption');
            courseOption.dataset.course = course;
            courseOption.textContent = course;
            courseDropdown.appendChild(courseOption);
        });

        courseDropdown.addEventListener('click', (e) => {
            const selectedCourse = e.target.dataset.course;
            if (selectedCourse) {
                document.querySelectorAll('.courseOption').forEach(option => option.classList.remove('active'));
                e.target.classList.add('active');

                sidebar.innerHTML = '';
                contentMain.innerHTML = ''; 

                const units = courses[selectedCourse];
                let unitIndex = 1;
                Object.keys(units).forEach(unit => {
                    const unitElement = document.createElement('div');
                    unitElement.classList.add('unit');
                    unitElement.dataset.unit = unit;
                    unitElement.innerHTML = `<p>Unit ${unitIndex}: <span class="unitText">${unit}</span></p>`;
                    sidebar.appendChild(unitElement);

                    const sections = units[unit];
                    let sectionIndex = 1;
                    Object.keys(sections).forEach(section => {
                        const sectionElement = document.createElement('div');
                        sectionElement.classList.add('section');
                        sectionElement.dataset.section = section;
                        sectionElement.innerHTML = `Section ${unitIndex}.${sectionIndex}: <span class="sectionText">${section}</span>`;
                        unitElement.appendChild(sectionElement);

                        sectionIndex++;
                    });

                    unitIndex++;
                });
            }
        });

        sidebar.addEventListener('click', (e) => {
            const sectionElement = e.target.closest('.section');
            if (sectionElement) {
                const unitElement = sectionElement.closest('.unit');
                const selectedCourse = courseDropdown.querySelector('.courseOption.active').dataset.course;
                const selectedUnit = unitElement.dataset.unit;
                const selectedSection = sectionElement.dataset.section;

                const topics = courses[selectedCourse][selectedUnit][selectedSection];

                contentMain.innerHTML = `<h1>${selectedSection}</h1>`;
                topics.forEach(({ topic, text }) => {
                    const topicElement = document.createElement('div');
                    topicElement.classList.add('topic');
                    topicElement.dataset.topic = topic;
                    topicElement.innerHTML = `<h3>${topic}</h3><p>${text}</p>`;
                    contentMain.appendChild(topicElement);
                });
            }
        });
    })
    .catch(error => alert(error));

const sidebar = document.getElementById("sidebar");

sidebar.addEventListener("click", (e) => {
    const unit = e.target.closest(".unit");
    if (unit && !e.target.classList.contains("section")) {
        const sections = Array.from(unit.querySelectorAll(".section"));
        sections.forEach(section => {
            section.style.display = section.style.display === "none" ? "block" : "none";
        });
    }
});

document.getElementById("profileBtn").addEventListener("click", () => {
    window.location.href = "login.html";
});

document.querySelector(".dropdown").addEventListener("mouseover", async () => {
    if (currentUser) {
        const userDoc = await db.collection("users").doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            updateCourseDropdown(userData.unlockedCourses);
        }
    }
});