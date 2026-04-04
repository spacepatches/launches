const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================
// Utility
// ======================

function getTodayKey() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}`;
}

function extractDayMonth(dateString) {
  // formato: YYYY-DD-MM
  const parts = dateString.split("-");
  return `${parts[1]}-${parts[2]}`;
}

function getYouTubeEmbed(url) {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }

    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }

    return null;
  } catch {
    return null;
  }
}

function isX(url) {
  return url.includes("x.com") || url.includes("twitter.com");
}

// ======================
// Main
// ======================

async function loadPatchOfTheDay() {
  const container = document.getElementById("container");

  try {
    console.log("Loading patch...");

    const { data, error } = await supabaseClient
      .from("patch_of_the_day")
      .select("*");

    if (error) throw error;

    const todayKey = getTodayKey();
    console.log("Today key:", todayKey);

    const patch = data.find(p => extractDayMonth(p.date) === todayKey);

    if (!patch) {
      container.innerHTML = "<p>No patch found for today</p>";
      return;
    }

    // ======================
    // Rendering
    // ======================

    let videoHTML = "";

    if (patch.vid_url) {
      const ytEmbed = getYouTubeEmbed(patch.vid_url);

      if (ytEmbed) {
        videoHTML = `
          <iframe width="560" height="315"
            src="${ytEmbed}"
            frameborder="0"
            allowfullscreen>
          </iframe>
        `;
      } else if (isX(patch.vid_url)) {
        videoHTML = `<p><a href="${patch.vid_url}" target="_blank">Watch on X</a></p>`;
      } else {
        videoHTML = `<p><a href="${patch.vid_url}" target="_blank">Watch video</a></p>`;
      }
    }

    container.innerHTML = `
      <h3>${patch.name}</h3>
      <p><strong>${patch.location_name}</strong></p>
      <p>${patch.description}</p>
      <img src="${patch.patch_url}" alt="patch">
      ${videoHTML}
    `;

    console.log("Patch loaded ✅");

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Error loading data</p>";
  }
}

// Avvio
loadPatchOfTheDay();