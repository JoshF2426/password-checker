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
