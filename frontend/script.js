/* =========================================
   INKFLOW JAVASCRIPT
========================================= */


/* =========================================
   Select Elements
========================================= */

const topicButtons =
    document.querySelectorAll(".topic");

const stories =
    document.querySelectorAll(".story-row");

const resultsCount =
    document.querySelector("#resultsCount");

const browseButton =
    document.querySelector("#browseStories");

const latestSection =
    document.querySelector("#latest");

const copyright =
    document.querySelector(".copyright");


/* =========================================
   Topic Filtering
========================================= */

topicButtons.forEach(function (button) {

    button.addEventListener("click", function () {

        const selectedTopic =
            button.getAttribute("data-topic");


        /* Remove active class */

        topicButtons.forEach(function (item) {

            item.classList.remove("active");

        });


        /* Add active class */

        button.classList.add("active");


        /* Count visible stories */

        let visibleStories = 0;


        /* Filter stories */

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


        /* Update result count */

        if (resultsCount) {

            if (visibleStories === 1) {

                resultsCount.textContent =
                    "Showing 1 story";

            } else {

                resultsCount.textContent =
                    `Showing ${visibleStories} stories`;

            }

        }


        /* Scroll to latest stories */

        if (latestSection) {

            latestSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

});


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
   Dynamic Copyright Year
========================================= */

if (copyright) {

    const currentYear =
        new Date().getFullYear();

    copyright.textContent =
        `© ${currentYear} InkFlow. Built as a Full Stack Development Internship Project.`;

}