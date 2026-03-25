const topbar = document.querySelector(".topbar");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav a");
const fadeItems = document.querySelectorAll(".fade-up");
const yearNode = document.getElementById("year");
const chatbot = document.getElementById("chatbot");
const chatPanel = document.querySelector(".chatbot-panel");
const chatToggleButtons = document.querySelectorAll("[data-open-chat]");
const chatClose = document.querySelector(".chatbot-close");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

const chatbotFallback = {
  about:
    "Amrita A is presenting a premium portfolio centered on social impact storytelling, especially the theme of women in India, education, empowerment, and progress.",
  project:
    "The featured project explores the role of women in Indian society, their achievements, historic challenges, and why equal opportunity matters for the future.",
  contact:
    "You can contact Amrita at rita27amrita@gmail.com, find her on LinkedIn as Amrita A, or on Instagram at @rita_amrita.",
  default:
    "I can help with questions about Amrita, the Women in India project, education, challenges women face, and contact details."
};

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = topbar.classList.toggle("nav-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    topbar.classList.remove("nav-open");
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

fadeItems.forEach((item) => fadeObserver.observe(item));

function toggleChat(forceOpen) {
  const shouldOpen =
    typeof forceOpen === "boolean" ? forceOpen : !chatbot.classList.contains("open");

  chatbot.classList.toggle("open", shouldOpen);
  chatPanel.setAttribute("aria-hidden", String(!shouldOpen));

  const toggleState = String(shouldOpen);
  chatToggleButtons.forEach((button) => {
    button.setAttribute("aria-expanded", toggleState);
  });

  if (shouldOpen) {
    window.setTimeout(() => chatInput.focus(), 150);
  }
}

chatToggleButtons.forEach((button) => {
  button.addEventListener("click", () => toggleChat(true));
});

if (chatClose) {
  chatClose.addEventListener("click", () => toggleChat(false));
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    toggleChat(false);
  }
});

function appendMessage(role, content) {
  const article = document.createElement("article");
  article.className = `message ${role}`;

  const paragraph = document.createElement("p");
  paragraph.textContent = content;

  article.appendChild(paragraph);
  chatMessages.appendChild(article);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getFallbackReply(message) {
  const normalized = message.toLowerCase();

  if (normalized.includes("contact") || normalized.includes("email") || normalized.includes("instagram") || normalized.includes("linkedin")) {
    return chatbotFallback.contact;
  }

  if (normalized.includes("project") || normalized.includes("women") || normalized.includes("india")) {
    return chatbotFallback.project;
  }

  if (normalized.includes("who") || normalized.includes("about") || normalized.includes("amrita")) {
    return chatbotFallback.about;
  }

  return chatbotFallback.default;
}

async function requestChatReply(message) {
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error("Chat request failed");
    }

    const data = await response.json();
    return data.reply || chatbotFallback.default;
  } catch (error) {
    return getFallbackReply(message);
  }
}

if (chatForm) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = chatInput.value.trim();

    if (!message) {
      return;
    }

    appendMessage("user", message);
    chatInput.value = "";
    chatInput.disabled = true;

    const thinkingNode = document.createElement("article");
    thinkingNode.className = "message assistant";
    thinkingNode.innerHTML = "<p>Thinking...</p>";
    chatMessages.appendChild(thinkingNode);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const reply = await requestChatReply(message);
    thinkingNode.remove();
    appendMessage("assistant", reply);
    chatInput.disabled = false;
    chatInput.focus();
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "Sending your message...";

    const formData = new FormData(contactForm);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message")
    };

    try {
      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Contact request failed");
      }

      const data = await response.json();
      formStatus.textContent = data.msg || "Message sent successfully.";
      contactForm.reset();
    } catch (error) {
      formStatus.textContent = "The backend is not reachable right now, but your form is ready to connect.";
    }
  });
}
