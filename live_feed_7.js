const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


async function loadDynamicText() {
  const textContainer = document.getElementById("dynamic-text");

  if (!textContainer) return;

  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");

  const todayMD = `${month}-${day}`;

  console.log("Searching for:", todayMD);

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("date, mission, acengy, rocket")
    .eq("month_day", todayMD)
    .single();

  console.log("DATA:", data);
  console.log("ERROR:", error);

  if (error || !data) {
    textContainer.innerHTML = "No data available";
    return;
  }

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

  const missionDate = new Date(data.date);

  textContainer.innerHTML = `
    <div>
      <h3 style="text-align: left;">
        <span style="font-weight: normal;">
        Latest news ${formatFullDate(today)}<br>  
        👉 Step into the history of spaceflight with <b>"Patch of the day"</b>, 
        a new mission every day. Watch the launch, explore the details, and fuel your passion for space. 
        Today's story: <b>${data.mission}</b> launched by ${data.acengy} 
        the ${formatFullDate(missionDate)} on ${data.rocket}.
        </span>
      </h3>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", loadDynamicText);