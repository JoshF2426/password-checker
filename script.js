const pwInput = document.getElementById("pw");
const toggleBtn = document.getElementById("toggle");
const strengthText = document.getElementById("strengthText");
const scoreText = document.getElementById("scoreText");
const bar = document.getElementById("bar");
const tipsList = document.getElementById("tips");
const barWrap = document.querySelector(".bar-wrap");

toggleBtn.addEventListener("click", () => {
  const isHidden = pwInput.type === "password";
  pwInput.type = isHidden ? "text" : "password";
  toggleBtn.textContent = isHidden ? "Hide" : "Show";
  toggleBtn.setAttribute("aria-pressed", String(isHidden));
});

pwInput.addEventListener("input", () => {
  const pw = pwInput.value;
  const result = evaluatePassword(pw);
  render(result);
});

function evaluatePassword(pw) {
  let score = 0;
  const tips = [];

  if (!pw || pw.length === 0) {
    return { score: 0, label: "—", tips: ["Start typing to see suggestions."] };
  }

  // Length scoring
  if (pw.length >= 8) score += 20; else tips.push("Use at least 8 characters.");
  if (pw.length >= 12) score += 20; else tips.push("Use 12+ characters for better security.");
  if (pw.length >= 16) score += 10;

  // Character variety
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  score += varietyCount * 10;

  if (!hasLower) tips.push("Add lowercase letters.");
  if (!hasUpper) tips.push("Add uppercase letters.");
  if (!hasNumber) tips.push("Add numbers.");
  if (!hasSymbol) tips.push("Add special characters (e.g., ! @ # $).");

  // Basic pattern penalties
  const lowered = pw.toLowerCase();

  // Common weak sequences
  if (/(1234|qwer|asdf|password|admin|letmein)/.test(lowered)) {
    score -= 25;
    tips.push("Avoid common words/sequences (e.g., password, 1234, qwer).");
  }

  // Repeated characters (e.g., aaaaa, 11111)
  if (/(.)\1\1\1/.test(pw)) {
    score -= 15;
    tips.push("Avoid repeated characters (e.g., aaaa, 1111).");
  }

  // Too much similarity (only one character type)
  if (varietyCount === 1) {
    score -= 10;
    tips.push("Mix multiple character types (letters + numbers + symbols).");
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  const label = scoreToLabel(score);

  // If it's strong, give a positive note
  if (score >= 80) {
    tips.unshift("Strong password. Consider using a password manager to store it safely.");
  }

  // If tips list is empty, still show something helpful
  if (tips.length === 0) {
    tips.push("Good overall. Consider adding length or an extra character type for even stronger security.");
  }

  return { score, label, tips };
}

function scoreToLabel(score) {
  if (score === 0) return "—";
  if (score < 40) return "Weak";
  if (score < 60) return "Fair";
  if (score < 80) return "Good";
  return "Strong";
}

function render({ score, label, tips }) {
  strengthText.textContent = label;
  scoreText.textContent = `${score} / 100`;
  bar.style.width = `${score}%`;

  // update aria value for accessibility
  barWrap.setAttribute("aria-valuenow", String(score));

  // tips
  tipsList.innerHTML = "";
  tips.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    tipsList.appendChild(li);
  });
}

// ---------- Turtle "programmable gif" ----------
const turtle = document.getElementById("turtle");

if (turtle) {
  // Use an inline SVG as the turtle image (no external assets needed)
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="48" viewBox="0 0 72 48">
    <rect width="72" height="48" rx="10" fill="rgba(255,255,255,0.03)"/>
    <!-- Shell -->
    <ellipse cx="36" cy="26" rx="18" ry="12" fill="#3ccf7f"/>
    <ellipse cx="36" cy="26" rx="13" ry="8" fill="#2aa866"/>
    <!-- Head -->
    <circle cx="56" cy="24" r="6" fill="#38b76f"/>
    <circle cx="58" cy="22" r="1.5" fill="#0f1115"/>
    <!-- Legs -->
    <ellipse cx="25" cy="36" rx="5" ry="3" fill="#2aa866"/>
    <ellipse cx="47" cy="36" rx="5" ry="3" fill="#2aa866"/>
    <ellipse cx="24" cy="18" rx="4" ry="2.5" fill="#2aa866"/>
    <ellipse cx="48" cy="18" rx="4" ry="2.5" fill="#2aa866"/>
    <!-- Tail -->
    <polygon points="18,26 10,22 12,30" fill="#2aa866"/>
  </svg>`;

  const sprite = turtle.querySelector(".turtle-sprite");
  sprite.style.backgroundImage = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;

  // Movement settings
  const stage = turtle.closest(".turtle-stage");
  let x = -80;               // starting X
  let speed = 1.2;           // pixels per frame (adjust as desired)
  let lastWidth = 0;

  function animateTurtle() {
    const stageWidth = stage.clientWidth;

    // If stage size changes, ensure we stay smooth
    if (stageWidth !== lastWidth) lastWidth = stageWidth;

    x += speed;

    // Move the turtle across
    turtle.style.transform = `translate(${x}px, -50%)`;

    // Loop when off-screen
    if (x > stageWidth + 80) {
      x = -80;
    }

    requestAnimationFrame(animateTurtle);
  }

  requestAnimationFrame(animateTurtle);
}
