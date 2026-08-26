function normalize(text) {
  return cleanText(text)
    .toLowerCase()
    .replace(/ي/g, "ی")
    .replace(/ى/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ۀ/g, "ه")
    .replace(/[!！؟?.,،؛;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Natural quick replies
 *
 * Handles combined greetings such as:
 *   سلام
 *   سلام چطوری
 *   سلام چطوری گوگولی
 *   سلام خوبی؟
 *   سلام رفیق
 *
 * Important:
 * - Only simple greetings are handled locally.
 * - Real questions are still sent to the AI providers.
 * - The user's friendly word is preserved when appropriate.
 */
function quickReply(text) {
  const n = normalize(text);

  if (!n) return null;

  const isEnglish = /^(hello|hi|hey)\b/.test(n);

  // English greetings
  if (isEnglish) {
    if (/\bhow are you\b|\bhow r u\b/.test(n)) {
      return "I'm good 😊 How are you?";
    }

    if (/\b(thank you|thanks)\b/.test(n)) {
      return "You're welcome! 😊";
    }

    return "Hello! 👋 How are you?";
  }

  // Afghan Dari / Persian greeting
  const hasGreeting =
    /\bسلام\b/.test(n) ||
    n.startsWith("سلام") ||
    n.includes("سلام علیکم") ||
    n.includes("سلام‌علیکم");

  if (!hasGreeting) {
    // Simple "how are you" without greeting
    if (
      /^(چطوری|خوبی|خوب هستی|حالت چطوره|حالت خوبه)$/.test(n)
    ) {
      return "خوبم 😊 تو چطوری؟";
    }

    // Thanks
    if (/^(تشکر|ممنون|مرسی)$/.test(n)) {
      return "خواهش می‌کنم 😊";
    }

    // Goodbye
    if (/^(خداحافظ|خدا حافظ)$/.test(n)) {
      return "خداحافظ 👋";
    }

    return null;
  }

  /*
   * If the greeting also asks "how are you",
   * give a natural short answer.
   */
  const asksHow =
    /چطوری|چطوره|خوبی|خوب هستی|حالت خوبه/.test(n);

  /*
   * Preserve friendly words such as:
   * گوگولی، عزیزم، رفیق، دوست من
   */
  let friendly = "";

  if (/گوگولی/.test(n)) {
    friendly = " گوگولی 😄";
  } else if (/عزیزم/.test(n)) {
    friendly = " عزیزم 😊";
  } else if (/رفیق/.test(n)) {
    friendly = " رفیق 😄";
  } else if (/دوست من/.test(n)) {
    friendly = " دوست من 😊";
  }

  if (asksHow) {
    return `سلام${friendly}! خوبم 😊 تو چطوری؟`;
  }

  return `سلام${friendly}! 👋 خوش اومدی.`;
}
