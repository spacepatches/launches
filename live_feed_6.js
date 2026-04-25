const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


async function loadDynamicText() {
  const textContainer = document.getElementById("dynamic-text");

  if (!textContainer) {
    console.error("Elemento #dynamic-text non trovato");
    return;
  }

  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const todayMD = `${month}-${day}`;

  console.log("Searching for:", todayMD);

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("date, mission, acengy, rocket")
    .or(`date::text.like.%-${todayMD}`)
    .limit(1);

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error || !data || data.length === 0) {
    textContainer.innerHTML = "No data available";
    return;
  }

  const row = data[0];

  function formatFullDate(date) {
    const d = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const suffix = (n) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    return `${d}${suffix(d)} ${month} ${year}`;
  }

  const missionDate = new Date(row.date);

  textContainer.innerHTML = `
    Latest news ${formatFullDate(today)}<br>
    👉 Step into the history of spaceflight with <b>"Patch of the day"</b>, 
    a new mission every day. Watch the launch, explore the details, and fuel your passion for space. 
    Today's story: <b>${row.mission}</b> launched by ${row.acengy} 
    the ${formatFullDate(missionDate)} on ${row.rocket}.
  `;
}

// ✅ avvio corretto
document.addEventListener("DOMContentLoaded", loadDynamicText);