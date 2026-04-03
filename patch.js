const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ===============================
// 🔍 YOUTUBE ID EXTRACTION
// ===============================
function extractYouTubeID(url) {
  if (!url) return null;

  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([^&\n?#]+)/;

  const match = url.match(regex);
  return match ? match[1] : null;
}

// ===============================
// 🚀 LOAD DATA
// ===============================
async function loadPatch() {
  const container = document.getElementById("patch-video");

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select(`
      name,
      description,
      patch_url,
      vid_url
    `)
	.eq("day_month", "03-04")
	.limit(1);

  if (error || !data || data.length === 0) {
    container.innerHTML = "No video available";
    return;
  }

  const launch = data[0]; // ✅ sempre l'ultimo
  renderPatch(launch);
}

// ===============================
// 🎥 RENDER VIDEO
// ===============================
function renderPatch(launch) {
  const container = document.getElementById("patch-video");
  const textContainer = document.getElementById("patch-text");

  const url = launch.vid_url;

  // 📝 TESTO
  textContainer.innerHTML = `
    <div>
      <h3 style="text-align: left;">
        <span style="font-weight: normal;">
        🛰️ Here you can relive the latest rocket launch feed available.<br>  
        <b>${launch.name || ""}</b>
		${launch.description || ""}, 
        <i>${launch.patch_url || ""}</i>
        launched at ${launch.vid_url || ""}.</span>
      </h3>
    </div>
  `;
  

  // ===============================
  // 🎥 YOUTUBE
  // ===============================
  const ytId = extractYouTubeID(url);

  if (ytId) {
    container.innerHTML = `
      <iframe
        width="800"
        height="450"
        src="https://www.youtube.com/embed/${ytId}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
      </iframe>
    `;
    return;
  }

  // ===============================
  // 🐦 X.COM (TWITTER)
  // ===============================
  if (url.includes("x.com")) {
    container.innerHTML = `
      <a href="${url}" target="_blank">
        <img
          src="https://spacepatches.github.io/launches/LatestLiveFeed.png"
          alt="Watch broadcast"
          width="800"
        />
      </a>
    `;
    return;
  }

  // ===============================
  // 🌐 FALLBACK
  // ===============================
  container.innerHTML = `
    <a href="${url}" target="_blank">Watch video</a>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  loadPatch();
});



