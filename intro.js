const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// 📅 FORMAT DATE → MM-DD
// ===============================
function formatDayMonth(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${month}-${day}`;
}

// ===============================
// 🚀 LOAD TEXT
// ===============================
async function loadDynamicText() {
  const container = document.getElementById("dynamic-text");

  // 📅 oggi, domani, dopodomani
  const today = new Date();
  const tomorrow = new Date();
  const dayAfter = new Date();

  tomorrow.setDate(today.getDate() + 1);
  dayAfter.setDate(today.getDate() + 2);

  const targets = [
    formatDayMonth(today),
    formatDayMonth(tomorrow),
    formatDayMonth(dayAfter)
  ];

  console.log("Targets:", targets);

  // 🔥 query semplice (NO SQL avanzato)
  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("*");

  if (error) {
    console.error("Supabase error:", error);
    container.innerHTML = "Error loading data";
    return;
  }

  // ===============================
  // 🔍 FILTRO lato JS
  // ===============================
  const filtered = data.filter(item => {
    const d = new Date(item.date + "T00:00:00");
    return targets.includes(formatDayMonth(d));
  });

  // ===============================
  // 🧠 ORDINE corretto
  // ===============================
  const ordered = targets.map(t =>
    filtered.find(item => {
      const d = new Date(item.date + "T00:00:00");
      return formatDayMonth(d) === t;
    })
  ).filter(Boolean);

  // ===============================
  // 📝 OUTPUT
  // ===============================
  const text = ordered
    .map(item => `${item.acengy} ${item.mission}`)
    .join(", ");

  console.log("Final text:", text);

  container.innerHTML = text || "No data available";
}

// ===============================
// ⏳ BLOGGER SAFE
// ===============================
function waitForContainer() {
  const el = document.getElementById("dynamic-text");

  if (!el) {
    console.log("Container not found, retrying...");
    setTimeout(waitForContainer, 300);
    return;
  }

  loadDynamicText();
}

// ▶️ START
waitForContainer();