document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll("#welcome-section, #projects, #credentials, #contact");
  const projectTiles = document.querySelectorAll(".project-tile");

  // Feedback container
  const feedbackContainer = document.createElement("div");
  feedbackContainer.id = "feedback";
  feedbackContainer.style.cssText = `
    font-size: 0.9em;
    padding: 10px;
    background-color: var(--maga-white);
    border: 1px solid var(--maga-blue);
    border-radius: 4px;
    margin: 10px auto;
    text-align: center;
    color: var(--maga-red);
    display: none;
    max-width: 800px;
  `;

  // Safely insert feedback container
  let main = document.getElementById("main");
  if (!main) {
    main = document.createElement("main");
    main.id = "main";
    const welcomeSection = document.getElementById("welcome-section");
    if (welcomeSection && welcomeSection.parentNode) {
      welcomeSection.parentNode.insertBefore(main, welcomeSection);
      sections.forEach((section) => main.appendChild(section));
    } else {
      document.body.insertBefore(feedbackContainer, document.body.firstChild);
    }
  }
  if (main) {
    main.insertBefore(feedbackContainer, main.querySelector("#welcome-section") || main.firstChild);
  }

  // Show feedback message
  const showFeedback = (message, duration = 3000) => {
    feedbackContainer.textContent = message;
    feedbackContainer.style.display = "block";
    setTimeout(() => {
      feedbackContainer.style.display = "none";
    }, duration);
  };

  // Active nav link highlighting
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${entry.target.id}`
            );
          });
        }
      });
    },
    { threshold: 0.5 }
  );
  sections.forEach((section) => observer.observe(section));

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
        showFeedback(`Navigated to ${link.textContent}`);
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  // Project filter
  const filterContainer = document.createElement("div");
  filterContainer.id = "filter-container";
  filterContainer.innerHTML = `
    <input type="text" id="project-filter" placeholder="Filter projects..." style="
      padding: 8px;
      margin: 10px auto;
      width: 300px;
      max-width: 100%;
      border: 1px solid var(--maga-blue);
      border-radius: 4px;
      display: block;
      font-family: 'Orbitron', Arial, sans-serif;
    ">
  `;
  const projectsSection = document.getElementById("projects");
  if (projectsSection) {
    projectsSection.insertBefore(filterContainer, projectsSection.querySelector(".project-tile"));
  }

  const projectFilter = document.getElementById("project-filter");
  if (projectFilter) {
    projectFilter.addEventListener("input", () => {
      const query = projectFilter.value.toLowerCase();
      projectTiles.forEach((tile) => {
        const text = tile.textContent.toLowerCase();
        tile.style.display = text.includes(query) ? "block" : "none";
      });
      showFeedback(query ? `Filtering projects for "${query}"` : "Cleared filter.");
    });
  }

  // Scroll-triggered animations
  const animateObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          animateObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    animateObserver.observe(section);
  });

  projectTiles.forEach((tile) => {
    tile.style.opacity = "0";
    tile.style.transform = "translateY(20px)";
    tile.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    animateObserver.observe(tile);
  });

  // Mobile menu toggle
  const toggleButton = document.createElement("button");
  toggleButton.textContent = "☰";
  toggleButton.id = "toggle-nav";
  toggleButton.style.cssText = `
    background-color: var(--maga-red);
    color: var(--maga-white);
    padding: 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin: 10px;
    display: none;
    font-size: 1.2em;
  `;
  if (navbar) {
    navbar.insertBefore(toggleButton, navbar.firstChild);
  }

  toggleButton.addEventListener("click", () => {
    const isCollapsed = navbar.classList.toggle("collapsed");
    navLinks.forEach((link) => {
      link.style.display = isCollapsed ? "none" : "block";
    });
    toggleButton.textContent = isCollapsed ? "☰" : "✕";
    showFeedback(isCollapsed ? "Menu collapsed." : "Menu expanded.");
    localStorage.setItem("nav-state", isCollapsed ? "collapsed" : "expanded");
  });

  // Load saved nav state
  const savedNavState = localStorage.getItem("nav-state");
  if (savedNavState === "collapsed" && window.innerWidth <= 600) {
    navbar.classList.add("collapsed");
    navLinks.forEach((link) => (link.style.display = "none"));
    toggleButton.textContent = "☰";
  }

  // Responsive nav toggle
  const updateNav = () => {
    if (window.innerWidth <= 600) {
      toggleButton.style.display = "block";
      if (!navbar.classList.contains("collapsed")) {
        navLinks.forEach((link) => (link.style.display = "block"));
      }
    } else {
      toggleButton.style.display = "none";
      navbar.classList.remove("collapsed");
      navLinks.forEach((link) => (link.style.display = "block"));
    }
  };
  window.addEventListener("resize", updateNav);
  updateNav();

  // Save last section
  window.addEventListener("scroll", () => {
    let currentSection = "";
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 150 && sectionTop >= -section.offsetHeight) {
        currentSection = section.id;
      }
    });
    if (currentSection) {
      localStorage.setItem("last-section", currentSection);
    }
  });

  // Load last section
  const lastSection = localStorage.getItem("last-section");
  if (lastSection) {
    const section = document.getElementById(lastSection);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${lastSection}`
        );
      });
    }
  }

  console.log(`Personal Portfolio Webpage initialized - ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })}`);
});
