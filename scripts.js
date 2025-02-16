document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCltfwKYqiLk5r8VC91O7ncfunWJnropEo",
        authDomain: "horizon-academy-1c3cb.firebaseapp.com",
        projectId: "horizon-academy-1c3cb",
        storageBucket: "horizon-academy-1c3cb.firebasestorage.app",
        messagingSenderId: "223692815318",
        appId: "1:223692815318:web:bcff95bbf2856f5fdc0277",
        measurementId: "G-B4CFZNT15F"
    };

    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Function to search for courses
    function searchCourses(query) {
        const courseResults = document.getElementById('courseResults');
        if (!courseResults) return;
        courseResults.innerHTML = '';

        fetch('horizonCourseData(2024-2025).txt')
            .then(response => response.text())
            .then(data => {
                const lines = data.split('\n');
                const courses = {};

                lines.forEach(line => {
                    const [course, unit, section, topic, text] = line.split(',');

                    if (!courses[course]) {
                        courses[course] = { description: text, units: {} };
                    }
                    if (!courses[course].units[unit]) {
                        courses[course].units[unit] = {};
                    }
                    if (!courses[course].units[unit][section]) {
                        courses[course].units[unit][section] = [];
                    }
                    courses[course].units[unit][section].push({ topic, text });
                });

                Object.keys(courses).forEach(courseName => {
                    if (courseName.toLowerCase().includes(query.toLowerCase())) {
                        const course = courses[courseName];
                        const courseElement = document.createElement('div');
                        courseElement.classList.add('courseResult');
                        courseElement.innerHTML = `
                            <h3>${courseName}</h3>
                            <p>${course.description}</p>
                            <button class="addCourseBtn" data-course-name="${courseName}">Add Course</button>
                            <img src="static/green-arrow.png" class="success-indicator" style="display: none;">
                        `;
                        courseResults.appendChild(courseElement);
                    }
                });
            })
            .catch(error => {
                console.error('Error searching courses:', error);
            });
    }

    // Function to add a course to the user's account
    function addCourse(courseName, buttonElement) {
        console.log('Adding course:', courseName);
        const user = auth.currentUser;
        if (user) {
            const userRef = db.collection('users').doc(user.uid);
            userRef.update({
                courses: firebase.firestore.FieldValue.arrayUnion(courseName)
            })
            .then(() => {
                const successIndicator = buttonElement.nextElementSibling;
                if (successIndicator) {
                    successIndicator.style.display = 'inline';
                }
            })
            .catch(error => {
                console.error('Error adding course:', error);
            });
        } else {
            alert('You need to be logged in to add courses.');
        }
    }

    // Event listener for course search input
    const courseSearchInput = document.getElementById('courseSearch');
    if (courseSearchInput) {
        courseSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query) {
                searchCourses(query);
            } else {
                document.getElementById('courseResults').innerHTML = '';
            }
        });
    }

    // Event delegation for add course buttons
    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('addCourseBtn')) {
            const courseName = e.target.getAttribute('data-course-name');
            addCourse(courseName, e.target);
        }
    });

    // Function to display courses based on the user's account
    function displayUserCourses() {
        const user = auth.currentUser;
        if (user) {
            const userRef = db.collection('users').doc(user.uid);
            userRef.get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    const userCourses = userData.courses || [];
                    console.log('User courses:', userCourses);
                    updateCourseDropdown(userCourses);
                    handleCourseSelection(userCourses); // Call handleCourseSelection with the user's allowed courses
                }
            })
            .catch(error => {
                console.error('Error getting user courses:', error);
            });
        }
    }

    // Function to handle course selection and display
    function handleCourseSelection(allowedCourses) {
        fetch('horizonCourseData(2024-2025).txt')
            .then(response => response.text())
            .then(data => {
                const contentMain = document.getElementById("contentMain");
                const sidebar = document.getElementById("sidebar");
                const courseDropdown = document.querySelector(".dropdownContent");
                if (!contentMain || !sidebar || !courseDropdown) return;
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
                    if (allowedCourses.includes(course)) {
                        const courseOption = document.createElement('a');
                        courseOption.classList.add('courseOption');
                        courseOption.dataset.course = course;
                        courseOption.textContent = course;
                        courseDropdown.appendChild(courseOption);
                    }
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
                            topicElement.innerHTML = `<h3>${topic}</h3>`;

                            //image
                            if (text.endsWith('.jpg') || text.endsWith('.png') || text.endsWith('.gif')) {
                                const imgElement = document.createElement('img');
                                imgElement.src = `courseImages/${text.trim()}`;
                                imgElement.alt = topic;
                                topicElement.appendChild(imgElement);
                            } //youtube
                            else if (text.includes('youtube.com') || text.includes('youtu.be')) {
                                const videoId = text.split('v=')[1] || text.split('/').pop();
                                const iframeElement = document.createElement('iframe');
                                iframeElement.width = "560";
                                iframeElement.height = "315";
                                iframeElement.src = `https://www.youtube.com/embed/${videoId}`;
                                iframeElement.frameBorder = "0";
                                iframeElement.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                                iframeElement.allowFullscreen = true;
                                topicElement.appendChild(iframeElement);
                            } 
                            else {
                                const textElement = document.createElement('p');
                                textElement.textContent = text;
                                topicElement.appendChild(textElement);
                            }

                            contentMain.appendChild(topicElement);
                        });
                    }
                });
            })
            .catch(error => {
                console.error('Error handling course selection:', error);
            });
    }

    // Event listener for authentication state changes
    auth.onAuthStateChanged(user => {
        if (user) {
            displayUserCourses();
        }
    });

    // Initialize course selection handling if on the main page
    if (document.getElementById("contentMain") && document.getElementById("sidebar")) {
        const user = auth.currentUser;
        if (user) {
            const userRef = db.collection('users').doc(user.uid);
            userRef.get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    const userCourses = userData.courses || [];
                    handleCourseSelection(userCourses);
                }
            })
            .catch(error => {
                console.error('Error getting user courses on page load:', error);
                alert('Error getting user courses on page load: ' + error);
            });
        }
    }

    // Event listener for profile button click
    const profileBtn = document.getElementById("profileBtn");
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            console.log('Profile button clicked');
            window.location.href = "profile.html";
        });
    }

    // Event listener for dropdown hover
    const dropdown = document.querySelector(".dropdown");
    if (dropdown) {
        dropdown.addEventListener("mouseover", async () => {
            console.log('Dropdown hover');
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDoc = await db.collection("users").doc(currentUser.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    console.log('User courses on dropdown hover:', userData.courses);
                    updateCourseDropdown(userData.courses || []);
                }
            }
        });
    }

    // Function to update course dropdown
    function updateCourseDropdown(unlockedCourses) {
        const courseDropdown = document.querySelector('.dropdownContent');
        if (!courseDropdown) return;
        courseDropdown.innerHTML = '';

        if (unlockedCourses.length === 0) {
            const noCoursesMessage = document.createElement('p');
            noCoursesMessage.textContent = 'No courses added...';
            courseDropdown.appendChild(noCoursesMessage);
        } else {
            unlockedCourses.forEach(courseName => {
                const courseOption = document.createElement('a');
                courseOption.classList.add('courseOption');
                courseOption.dataset.course = courseName;
                courseOption.textContent = courseName;
                courseDropdown.appendChild(courseOption);
            });
                    contentMain.appendChild(topicElement);
                });
            }
        });
    })
    .catch(error => alert(error));

const sidebar = document.getElementById("sidebar");

sidebar.addEventListener("click", (e) => {
    const unit = e.target.closest(".unit");
    const section = e.target.closest(".section");

    if (unit && !section) { // Ensure we're only toggling when clicking the unit
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