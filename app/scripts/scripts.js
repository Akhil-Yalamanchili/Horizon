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

    let allCourses = {};

    function initializeCourses() {
        fetch('./../../static/courseData/horizonCourseInfo(2025-2026)')
            .then(response => response.text())
            .then(data => {
                const lines = data.split('\n');
                lines.forEach(line => {
                    const parts = line.split('|');
                    const courseName = parts[0]?.trim();
                    const description = parts[1]?.trim();
                    const recommendedAge = parts[2]?.trim();
                    const level = parts[3]?.trim();
                    const prerequisites = parts[4]?.trim();

                    if (courseName) {
                        allCourses[courseName] = {
                            description,
                            recommendedAge,
                            level,
                            prerequisites
                        };
                    }
                });

                displayCourses(allCourses);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    }

    function displayCourses(courses, query = '') {
        const courseResults = document.getElementById('courseResults');
        if (!courseResults) return;
        courseResults.innerHTML = '';

        const filteredCourses = Object.keys(courses).filter(courseName =>
            courseName.toLowerCase().includes(query.toLowerCase())
        );

        if (filteredCourses.length === 0) {
            const noCoursesMessage = document.createElement('p');
            noCoursesMessage.textContent = "No courses found... maybe check our course list page?";
            noCoursesMessage.style.cssText = `
                font-size: 16px;
                color: #555;
                text-align: center;
                margin-top: 20px;
            `;
            courseResults.appendChild(noCoursesMessage);
            return;
        }

        filteredCourses.forEach(courseName => {
            const course = courses[courseName];
            const courseBox = document.createElement('div');
            courseBox.classList.add('courseBox');
            courseBox.style.cssText = `
                border: 1px solid #ccc;
                border-radius: 10px;
                padding: 10px; /* Reduce padding */
                width: 200px; /* Reduce width */
                text-align: center;
                background-color: #f9f9f9;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Reduce shadow */
                font-size: 12px; /* Reduce font size */
            `;

            courseBox.innerHTML = `
                <h3 style="margin-bottom: 5px; font-size: 14px;">${courseName}</h3> <!-- Smaller font size -->
                <p style="margin-bottom: 5px; color: #555;">${course.description}</p>
                <p style="margin-bottom: 5px; color: #777;">Age: ${course.recommendedAge}</p>
                <p style="margin-bottom: 5px; color: #777;">Level: ${course.level}</p>
                <p style="margin-bottom: 10px; color: #777;">Prerequisites: ${course.prerequisites}</p>
                <button class="addCourseBtn" data-course-name="${courseName}" style="
                    padding: 5px 10px; /* Reduce button size */
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px; /* Smaller font size */
                ">Add Course</button>
            `;

            courseResults.appendChild(courseBox);
        });
    }

    const courseSearchInput = document.getElementById('courseSearch');
    if (courseSearchInput) {
        courseSearchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            displayCourses(allCourses, query);
        });
    }

    initializeCourses();

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

    document.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('addCourseBtn')) {
            const courseName = e.target.getAttribute('data-course-name');
            addCourse(courseName, e.target);
        }
    });

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

    function handleCourseSelection(allowedCourses) {
        fetch('./../../static/courseData/horizonCourseData(2024-2025).txt')
            .then(response => response.text())
            .then(data => {
                const contentMain = document.getElementById("contentMain");
                const sidebar = document.getElementById("sidebar");
                const courseDropdown = document.querySelector(".dropdownContent");
                if (!contentMain || !sidebar || !courseDropdown) return;
                const lines = data.split('\n');
                const courses = {};

                lines.forEach(line => {
                    const parts = line.split('|');
                    const course = parts[0]?.trim();
                    const unit = parts[1]?.trim();
                    const section = parts[2]?.trim();
                    const topic = parts[3]?.trim();
                    const text = parts.slice(4).join('|').trim();

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
                            sectionsContainer.classList.add('sections');
                            unitElement.appendChild(sectionsContainer);

                            const sections = units[unit];
                            let sectionIndex = 1;
                            Object.keys(sections).forEach(section => {
                                const sectionElement = document.createElement('div');
                                sectionElement.classList.add('section');
                                sectionElement.dataset.section = section;
                                sectionElement.innerHTML = `Section ${unitIndex}.${sectionIndex}: <span class="sectionText">${section}</span>`;
                                sectionElement.dataset.course = selectedCourse;
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
                        unitElement.classList.toggle('expanded');
                    }

                    const sectionElement = e.target.closest('.section');
                    if (sectionElement) {
                        const unitElement = sectionElement.closest('.unit');
                        const selectedCourse = sectionElement.dataset.course; 
                        if (!selectedCourse) {
                            alert("No active course option found");
                            return;
                        }
                        const selectedUnit = unitElement.dataset.unit;
                        const selectedSection = sectionElement.dataset.section;

                        const topics = courses[selectedCourse][selectedUnit][selectedSection];
                        contentMain.innerHTML = `<h1>${selectedSection}</h1>`;

                        const displayedTopics = new Set();

                        topics.forEach(({ topic, text }) => {
                            if (!displayedTopics.has(topic)) {
                                const topicElement = document.createElement('div');
                                topicElement.classList.add('topic');
                                topicElement.dataset.topic = topic;
                                topicElement.innerHTML = `<h3>${topic}</h3>`;
                                contentMain.appendChild(topicElement);
                                displayedTopics.add(topic);
                            }

                            const textElement = document.createElement('p');
                            textElement.textContent = text;

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
    let isSidebarLocked = true; 
    let isHoveringSidebar = false;

    sidebarToggle.addEventListener('click', () => {
        isSidebarLocked = !isSidebarLocked;
        if (isSidebarLocked) {
            sideBarMain.classList.remove('collapsed');
            sideBarMain.classList.remove('overlay');
            contentMain.classList.remove('expanded');
            contentMain.classList.add('locked');
            contentMain.style.left = '20%'; 
            contentMain.style.width = 'calc(55% - 20px)'; 
        } else {
            sideBarMain.classList.add('collapsed');
            contentMain.classList.remove('locked');
            contentMain.classList.add('expanded');
            contentMain.style.left = '0'; 
            contentMain.style.width = 'calc(80% - 20px)'; 
        }
    });

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
    let isLightMode = true; 

    themeToggle.addEventListener('click', () => {
        if (isLightMode) {
            document.documentElement.style.setProperty('--background-color', 'rgb(30, 30, 45)');
            document.documentElement.style.setProperty('--sidebar-background', 'rgb(50, 50, 70)');
            document.documentElement.style.setProperty('--text-color', 'white');
            document.documentElement.style.setProperty('--logo-bar-background', 'rgb(20, 20, 35)');
            document.documentElement.style.setProperty('--toggle-background', 'rgb(40, 40, 60)');
            document.documentElement.style.setProperty('--content-background', 'rgb(40, 40, 60)'); 
            document.documentElement.style.setProperty('--content-text-color', 'white');
        } else {
            document.documentElement.style.setProperty('--background-color', 'rgb(227, 240, 250)');
            document.documentElement.style.setProperty('--sidebar-background', 'rgb(231, 243, 255)');
            document.documentElement.style.setProperty('--text-color', 'black');
            document.documentElement.style.setProperty('--logo-bar-background', 'rgb(40, 43, 73)');
            document.documentElement.style.setProperty('--toggle-background', 'rgb(63, 67, 107)');
            document.documentElement.style.setProperty('--content-background', 'white'); 
            document.documentElement.style.setProperty('--content-text-color', 'black'); 
        }
        isLightMode = !isLightMode;
    });
});