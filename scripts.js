document.addEventListener('DOMContentLoaded', () => {
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
                    const parts = line.split(',');
                    const course = parts[0]?.trim();
                    const unit = parts[1]?.trim();
                    const section = parts[2]?.trim();
                    const topic = parts[3]?.trim();
                    const text = parts.slice(4).join(',').trim(); // Join the remaining parts to keep the text intact

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
                    handleCourseSelection(userCourses);
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
                    // Split the line into parts, but ensure the last part (text) remains intact
                    const parts = line.split(',');
                    const course = parts[0]?.trim();
                    const unit = parts[1]?.trim();
                    const section = parts[2]?.trim();
                    const topic = parts[3]?.trim();
                    const text = parts.slice(4).join(',').trim(); // Join the remaining parts to keep the text intact
                
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

                            const sectionsContainer = document.createElement('div');
                            sectionsContainer.classList.add('sections'); // Container for sections
                            unitElement.appendChild(sectionsContainer);

                            const sections = units[unit];
                            let sectionIndex = 1;
                            Object.keys(sections).forEach(section => {
                                const sectionElement = document.createElement('div');
                                sectionElement.classList.add('section');
                                sectionElement.dataset.section = section;
                                sectionElement.innerHTML = `Section ${unitIndex}.${sectionIndex}: <span class="sectionText">${section}</span>`;
                                sectionElement.dataset.course = selectedCourse; // Store the course in the section element
                                sectionsContainer.appendChild(sectionElement);

                                sectionIndex++;
                            });

                            sidebar.appendChild(unitElement);
                            unitIndex++;
                        });
                    }
                });

                sidebar.addEventListener('click', (e) => {
                    const unitElement = e.target.closest('.unit');
                    if (unitElement) {
                        // Toggle the expanded state of the clicked unit
                        unitElement.classList.toggle('expanded');
                    }

                    const sectionElement = e.target.closest('.section');
                    if (sectionElement) {
                        const unitElement = sectionElement.closest('.unit');
                        const selectedCourse = sectionElement.dataset.course; // Retrieve the course from the section element
                        if (!selectedCourse) {
                            alert("No active course option found");
                            return;
                        }
                        const selectedUnit = unitElement.dataset.unit;
                        const selectedSection = sectionElement.dataset.section;

                        const topics = courses[selectedCourse][selectedUnit][selectedSection];
                        contentMain.innerHTML = `<h1>${selectedSection}</h1>`; // Display section name as a header

                        const displayedTopics = new Set(); // Track displayed topics to avoid duplicates

                        topics.forEach(({ topic, text }) => {
                            if (!displayedTopics.has(topic)) {
                                // Add the topic header only once
                                const topicElement = document.createElement('div');
                                topicElement.classList.add('topic');
                                topicElement.dataset.topic = topic;
                                topicElement.innerHTML = `<h3>${topic}</h3>`;
                                contentMain.appendChild(topicElement);
                                displayedTopics.add(topic);
                            }

                            // Add the related content below the topic
                            const textElement = document.createElement('p');
                            textElement.textContent = text;

                            // Append the content to the last topic element
                            const lastTopicElement = contentMain.querySelector(`.topic[data-topic="${topic}"]`);
                            lastTopicElement.appendChild(textElement);
                        });
                    }
                });
            })
            .catch(error => {
                alert('Error handling course selection: ' + error);
            });
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            displayUserCourses();
        }
    });

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

    const profileBtn = document.getElementById("profileBtn");
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            console.log('Profile button clicked');
            window.location.href = "profile.html";
        });
    }

    const dropdown = document.querySelector(".dropdown");
    if (dropdown) {
        let dropdownInitialized = false;
        dropdown.addEventListener("mouseover", async () => {
            if (!dropdownInitialized) {
                console.log('Dropdown hover');
                const currentUser = auth.currentUser;
                if (currentUser) {
                    const userDoc = await db.collection("users").doc(currentUser.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        console.log('User courses on dropdown hover:', userData.courses);
                        updateCourseDropdown(userData.courses || []);
                        dropdownInitialized = true;
                    }
                }
            }
        });
    }

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
        }
    }

    const sideBarMain = document.getElementById('sideBarMain');
    const contentMain = document.getElementById('contentMain');
    const sidebarToggle = document.getElementById('sidebarToggle');
    let isSidebarLocked = true; // Default state: sidebar locked
    let isHoveringSidebar = false; // Track if the user is hovering over the sidebar

    // Toggle sidebar state
    sidebarToggle.addEventListener('click', () => {
        isSidebarLocked = !isSidebarLocked;
        if (isSidebarLocked) {
            sideBarMain.classList.remove('collapsed');
            sideBarMain.classList.remove('overlay');
            contentMain.classList.remove('expanded');
            contentMain.classList.add('locked');
            contentMain.style.left = '20%'; // Reset to align with the sidebar
            contentMain.style.width = 'calc(55% - 20px)'; // Reserve space for the chatbot
        } else {
            sideBarMain.classList.add('collapsed');
            contentMain.classList.remove('locked');
            contentMain.classList.add('expanded');
            contentMain.style.left = '0'; // Expand to the left edge of the screen
            contentMain.style.width = 'calc(80% - 20px)'; // Expand only to the left of the reserved chatbot space
        }
    });

    // Handle hover effect for the toggle icon
    sidebarToggle.addEventListener('mouseenter', () => {
        if (!isSidebarLocked) {
            sideBarMain.classList.add('overlay');
        }
    });

    sidebarToggle.addEventListener('mouseleave', () => {
        if (!isSidebarLocked && !isHoveringSidebar) {
            sideBarMain.classList.remove('overlay');
        }
    });

    // Handle hover effect for the sidebar itself
    sideBarMain.addEventListener('mouseenter', () => {
        if (!isSidebarLocked) {
            isHoveringSidebar = true;
            sideBarMain.classList.add('overlay');
        }
    });

    sideBarMain.addEventListener('mouseleave', () => {
        if (!isSidebarLocked) {
            isHoveringSidebar = false;
            sideBarMain.classList.remove('overlay');
        }
    });

    const themeToggle = document.getElementById('themeToggle');
    let isLightMode = true; // Default to light mode

    themeToggle.addEventListener('click', () => {
        if (isLightMode) {
            // Switch to night mode
            document.documentElement.style.setProperty('--background-color', 'rgb(30, 30, 45)');
            document.documentElement.style.setProperty('--sidebar-background', 'rgb(50, 50, 70)');
            document.documentElement.style.setProperty('--text-color', 'white');
            document.documentElement.style.setProperty('--logo-bar-background', 'rgb(20, 20, 35)');
            document.documentElement.style.setProperty('--toggle-background', 'rgb(40, 40, 60)');
            document.documentElement.style.setProperty('--content-background', 'rgb(40, 40, 60)'); // Dark background for contentMain
            document.documentElement.style.setProperty('--content-text-color', 'white'); // Light text for contentMain
        } else {
            // Switch to light mode
            document.documentElement.style.setProperty('--background-color', 'rgb(227, 240, 250)');
            document.documentElement.style.setProperty('--sidebar-background', 'rgb(143, 188, 230)');
            document.documentElement.style.setProperty('--text-color', 'black');
            document.documentElement.style.setProperty('--logo-bar-background', 'rgb(40, 43, 73)');
            document.documentElement.style.setProperty('--toggle-background', 'rgb(63, 67, 107)');
            document.documentElement.style.setProperty('--content-background', 'white'); // Light background for contentMain
            document.documentElement.style.setProperty('--content-text-color', 'black'); // Dark text for contentMain
        }
        isLightMode = !isLightMode; // Toggle the mode
    });
});