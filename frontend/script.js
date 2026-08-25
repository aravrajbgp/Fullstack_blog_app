/* =========================================
   INKFLOW JAVASCRIPT
========================================= */

const API_URL = "http://localhost:5001";

/* =========================================
   Homepage Topic Filtering
========================================= */

const topicButtons = document.querySelectorAll(".topic");
const stories = document.querySelectorAll(".story-row");
const resultsCount = document.querySelector("#resultsCount");
const browseButton = document.querySelector("#browseStories");
const latestSection = document.querySelector("#latest");
const copyright = document.querySelector(".copyright");

if (topicButtons.length > 0) {

    topicButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const selectedTopic =
                button.getAttribute("data-topic");

            topicButtons.forEach(function (item) {
                item.classList.remove("active");
            });

            button.classList.add("active");

            let visibleStories = 0;

            stories.forEach(function (story) {

                const storyCategory =
                    story.getAttribute("data-category");

                if (
                    selectedTopic === "all" ||
                    storyCategory === selectedTopic
                ) {
                    story.style.display = "grid";
                    visibleStories++;
                } else {
                    story.style.display = "none";
                }

            });

            if (resultsCount) {

                if (visibleStories === 1) {
                    resultsCount.textContent =
                        "Showing 1 story";
                } else {
                    resultsCount.textContent =
                        `Showing ${visibleStories} stories`;
                }

            }

            if (latestSection) {

                latestSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });

}


/* =========================================
   Browse Stories Button
========================================= */

if (browseButton) {

    browseButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            if (latestSection) {

                latestSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


/* =========================================
   Register Form
========================================= */

const registerForm =
    document.querySelector("#registerForm");

const registerMessage =
    document.querySelector("#registerMessage");

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const name =
                document.querySelector("#name").value.trim();

            const email =
                document.querySelector("#registerEmail").value.trim();

            const password =
                document.querySelector("#registerPassword").value;

            if (registerMessage) {
                registerMessage.textContent =
                    "Creating your account...";
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                name: name,
                                email: email,
                                password: password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (registerMessage) {
                    registerMessage.textContent =
                        data.message;
                }

                if (data.success) {

                    registerForm.reset();

                    setTimeout(function () {

                        window.location.href =
                            "login.html";

                    }, 1000);

                }

            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );

                if (registerMessage) {
                    registerMessage.textContent =
                        "Unable to connect to the server.";
                }

            }

        }
    );

}


/* =========================================
   Login Form
========================================= */

const loginForm =
    document.querySelector("#loginForm");

const loginMessage =
    document.querySelector("#loginMessage");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                document.querySelector("#loginEmail").value.trim();

            const password =
                document.querySelector("#loginPassword").value;

            if (loginMessage) {
                loginMessage.textContent =
                    "Signing you in...";
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                email: email,
                                password: password
                            })
                        }
                    );

                const data =
                    await response.json();

                if (loginMessage) {
                    loginMessage.textContent =
                        data.message;
                }

                if (data.success) {

                    localStorage.setItem(
                        "inkflowUser",
                        JSON.stringify(data.user)
                    );

                    setTimeout(function () {

                        window.location.href =
                            "dashboard.html";

                    }, 500);

                }

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );

                if (loginMessage) {
                    loginMessage.textContent =
                        "Unable to connect to the server.";
                }

            }

        }
    );

}


/* =========================================
   Dashboard User
========================================= */

const dashboardUserName =
    document.querySelector("#dashboardUserName");

if (dashboardUserName) {

    const storedUser =
        localStorage.getItem("inkflowUser");

    if (!storedUser) {

        window.location.href =
            "login.html";

    } else {

        const user =
            JSON.parse(storedUser);

        dashboardUserName.textContent =
            user.name;

    }

}


/* =========================================
   Load Blogs From MongoDB
========================================= */

async function loadBlogs() {

    try {

        const response =
            await fetch(`${API_URL}/api/blogs`);

        const data =
            await response.json();

        if (!data.success) {
            return;
        }

        const blogs = data.blogs;

        /* Update story count */

        const storyCount =
            document.querySelector("#storyCount");

        if (storyCount) {
            storyCount.textContent =
                String(blogs.length).padStart(2, "0");
        }

        /* Find dashboard story container */

        const storyContainer =
            document.querySelector("#publishedStories") ||
            document.querySelector(".published-stories") ||
            document.querySelector("#stories");

        if (!storyContainer) {
            return;
        }

        storyContainer.innerHTML = "";

        if (blogs.length === 0) {

            storyContainer.innerHTML = `
                <div class="empty-state">
                    <p>No stories published yet.</p>
                </div>
            `;

            return;
        }

        blogs.forEach(function (blog) {

            const story = document.createElement("div");

            story.className = "story-row";

            story.innerHTML = `
                <div class="story-info">

                    <div class="story-category">
                        ${escapeHTML(blog.category)}
                    </div>

                    <h3>
                        ${escapeHTML(blog.title)}
                    </h3>

                    <p>
                        Published ${formatDate(blog.createdAt)}
                    </p>

                </div>

                <button
                    class="edit-story"
                    type="button"
                    onclick="viewBlog('${blog._id}')"
                >
                    View
                </button>
            `;

            storyContainer.appendChild(story);

        });

    } catch (error) {

        console.error(
            "Loading blogs error:",
            error
        );

    }

}


/* =========================================
   View Blog
========================================= */

function viewBlog(id) {

    localStorage.setItem(
        "inkflowSelectedBlog",
        id
    );

    window.location.href =
        `blog.html?id=${id}`;

}


/* =========================================
   Escape HTML
========================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value || "";

    return div.innerHTML;

}


/* =========================================
   Format Date
========================================= */

function formatDate(date) {

    if (!date) {
        return "";
    }

    return new Date(date).toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* =========================================
   Run Dashboard Blog Loading
========================================= */

if (dashboardUserName) {
    loadBlogs();
}


/* =========================================
   Create Blog Form
========================================= */

const createBlogForm =
    document.querySelector("#createBlogForm");

const blogMessage =
    document.querySelector("#blogMessage");

if (createBlogForm) {

    const storedUser =
        localStorage.getItem("inkflowUser");

    if (!storedUser) {

        window.location.href =
            "login.html";

    }

    createBlogForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const title =
                document.querySelector("#blogTitle").value.trim();

            const category =
                document.querySelector("#blogCategory").value;

            const readTime =
                document.querySelector("#readTime").value;

            const excerpt =
                document.querySelector("#blogExcerpt").value.trim();

            const content =
                document.querySelector("#blogContent").value.trim();

            if (blogMessage) {
                blogMessage.textContent =
                    "Publishing your story...";
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/blogs`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                title: title,
                                category: category,
                                readTime: Number(readTime),
                                excerpt: excerpt,
                                content: content
                            })
                        }
                    );

                const data =
                    await response.json();

                if (blogMessage) {
                    blogMessage.textContent =
                        data.message;
                }

                if (data.success) {

                    createBlogForm.reset();

                    setTimeout(function () {

                        window.location.href =
                            "dashboard.html";

                    }, 1000);

                }

            } catch (error) {

                console.error(
                    "Blog creation error:",
                    error
                );

                if (blogMessage) {
                    blogMessage.textContent =
                        "Unable to connect to the server.";
                }

            }

        }
    );

}


/* =========================================
   Logout
========================================= */

const logoutButton =
    document.querySelector("#logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            localStorage.removeItem(
                "inkflowUser"
            );

            window.location.href =
                "login.html";

        }
    );

}


/* =========================================
   Dynamic Copyright Year
========================================= */

if (copyright) {

    const currentYear =
        new Date().getFullYear();

    copyright.textContent =
        `© ${currentYear} InkFlow. Built as a Full Stack Development Internship Project.`;

}