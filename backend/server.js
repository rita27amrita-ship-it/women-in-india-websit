const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, "..", "frontend");

app.use(express.json());
app.use(express.static(FRONTEND_DIR));

const portfolioFacts = {
  about:
    "Amrita A is a student building a polished portfolio focused on social impact storytelling and women empowerment in India.",
  project:
    "The featured project explores the role of women in India across history, education, achievements, challenges, and the importance of empowerment.",
  education:
    "A major theme is how girls' education creates independence, confidence, and social progress across generations.",
  challenges:
    "The portfolio highlights challenges such as safety concerns, gender inequality, workplace bias, pay gaps, and social stereotypes.",
  contact:
    "You can reach Amrita at rita27amrita@gmail.com, on LinkedIn as Amrita A, and on Instagram at @rita_amrita."
};

function buildChatReply(message) {
  const normalized = String(message || "").toLowerCase();

  if (!normalized.trim()) {
    return "Ask me anything about Amrita, this portfolio, the Women in India project, or how to get in touch.";
  }

  if (normalized.includes("contact") || normalized.includes("email") || normalized.includes("instagram") || normalized.includes("linkedin")) {
    return portfolioFacts.contact;
  }

  if (normalized.includes("education") || normalized.includes("study") || normalized.includes("school")) {
    return portfolioFacts.education;
  }

  if (normalized.includes("challenge") || normalized.includes("problem") || normalized.includes("rights") || normalized.includes("safety")) {
    return portfolioFacts.challenges;
  }

  if (normalized.includes("project") || normalized.includes("women") || normalized.includes("india") || normalized.includes("history")) {
    return portfolioFacts.project;
  }

  if (normalized.includes("about") || normalized.includes("who") || normalized.includes("amrita") || normalized.includes("portfolio")) {
    return portfolioFacts.about;
  }

  return "This portfolio highlights Amrita's Women in India project, her focus on empowerment and education, and ways to connect with her directly.";
}

app.get("/api/projects", (req, res) => {
  res.json([
    {
      title: "Women In India",
      description: "A social impact project about empowerment, education, and progress."
    },
    {
      title: "Premium Portfolio Experience",
      description: "A modern one-page portfolio with immersive design and a built-in assistant."
    }
  ]);
});

app.post("/api/chat", (req, res) => {
  const reply = buildChatReply(req.body.message);
  res.json({ reply });
});

app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  console.log("Contact form submission:", {
    name,
    email,
    message,
    receivedAt: new Date().toISOString()
  });

  res.json({
    success: true,
    msg: "Thanks for reaching out. Your message has been received."
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
