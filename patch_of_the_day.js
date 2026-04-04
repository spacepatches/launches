const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================
// Date helpers
// ======================

function getTodayParts() {
  const today = new Date();

  return {
    day: String(today.getDate()).padStart(2, '0'),
    month: String(today.getMonth() + 1).padStart(2, '0')
  };
}

// ======================
// Video helpers
// ======================

function getYouTubeEmbed(url) {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
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

    const { day, month } = getTodayParts();

    // Prendiamo solo le date del mese corrente (ottimizzazione)
    const { data, error } = await supabaseClient
      .from("patch_of_the_day")
      .select("*")
      .like("date", `%-${month}-%`);

    if (error) throw error;

    console.log("Records fetched:", data.length);

    // Match preciso giorno + mese
    const patch = data.find(p => {
      const [, m, d] = p.date.split("-");
      return m === month && d === day;
    });

    if (!patch) {
      container.innerHTML = "<p>No patch found for today</p>";
      return;
    }

    // ======================
    // Video rendering
    // ======================

    let videoHTML = "";

    if (patch.vid_url) {
      const ytEmbed = getYouTubeEmbed(patch.vid_url);

      if (ytEmbed) {
        videoHTML = `
          <iframe width="800" 
            src="${ytEmbed}"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        `;
      } else if (isX(patch.vid_url)) {
        videoHTML = `
          <p>
            <a href="${patch.vid_url}" target="_blank">
              Watch on X
            </a>
          </p>
        `;
      } else {
        videoHTML = `
          <p>
            <a href="${patch.vid_url}" target="_blank">
              Watch video
            </a>
          </p>
        `;
      }
    }

    // ======================
    // Rendering
    // ======================

    container.innerHTML = `
      <h3><b>${patch.agency}</b> ${patch.rocket} <i>${patch.mission}</i></h3>
      <p>${patch.location_name} (${patch.pad_name})</p>
      <p><span style="font-weight: normal;">${patch.description}</span></p>
      <img src="${patch.patch_url}" style="width:400px;" alt="patch">
      ${videoHTML}
    `;

    console.log("Patch loaded ✅");

  } catch (err) {
    console.error("ERROR:", err);
    document.getElementById("container").innerHTML =
      "<p>Error loading data</p>";
  }
}

// Avvio
loadPatchOfTheDay();