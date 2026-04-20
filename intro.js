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
  return `${month}-${day}`; // ⚠️ formato Postgres MM-DD
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

  const dates = [
    formatDayMonth(today),
    formatDayMonth(tomorrow),
    formatDayMonth(dayAfter)
  ];

  console.log("Searching for:", dates);

  // 🔥 query con filtro su giorno-mese
  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("agency, mission, date")
    .or(
      dates.map(d => `date::text.like.%-${d}`).join(",")
    );

  if (error) {
    console.error(error);
    container.innerHTML = "Error loading data";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "No data available";
    return;
  }

  // ===============================
  // 🧠 MATCH PRECISO (giorno/mese)
  // ===============================
  const filtered = dates.map(d => {
    return data.find(item => {
      const dbDate = new Date(item.date);
      return formatDayMonth(dbDate) === d;
    });
  }).filter(Boolean);

  // ===============================
  // 📝 BUILD STRING
  // ===============================
  const text = filtered
    .map(item => `${item.agency} ${item.mission}`)
    .join(", ");

  container.innerHTML = text;
}

// ===============================
// ▶️ START (safe per Blogger)
// ===============================
function waitForTextContainer() {
  const el = document.getElementById("dynamic-text");

  if (!el) {
    setTimeout(waitForTextContainer, 300);
    return;
  }

  loadDynamicText();
}

waitForTextContainer();