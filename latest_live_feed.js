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
// 🎯 DETECT EMBED TYPE
// ===============================
function getEmbedType(url) {
  if (!url) return "none";

  // 🎥 YouTube
  if (extractYouTubeID(url)) return "youtube";

  // 🐦 X (Twitter)
  if (url.includes("x.com")) return "x";

  // 🎬 Vimeo
  if (url.includes("vimeo.com")) return "vimeo";

  // 🌐 fallback
  return "link";
}

// ===============================
// 🚀 LOAD DATA
// ===============================
async function loadLatestLaunchVideo() {
  const container = document.getElementById("latest-video");

  const nowISO = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from("launch_ref")
    .select(`
      mission_name,
      rocket_full_name,
      lsp_name,
      net,
      vid_url
    `)
    .lte("net", nowISO)
    .in("status_abbrev", ["Success", "Failure"])
    .not("vid_url", "is", null)
    .order("net", { ascending: false })
    .limit(10); // 🔴 prendiamo più record

  if (error || !data || data.length === 0) {
    container.innerHTML = "No video available";
    return;
  }

  // ===============================
  // 🧠 SCEGLI IL MIGLIOR VIDEO
  // ===============================
  const bestLaunch =
    data.find(l => getEmbedType(l.vid_url) === "youtube") ||
    data.find(l => getEmbedType(l.vid_url) === "vimeo") ||
    data.find(l => getEmbedType(l.vid_url) === "x") ||
    data[0]; // fallback

  renderLatestVideo(bestLaunch);
}

// ===============================
// 🎥 RENDER VIDEO
// ===============================
function renderLatestVideo(launch) {
  const container = document.getElementById("latest-video");
  const textContainer = document.getElementById("latest-video-text");

  const url = launch.vid_url;

  // 📝 TESTO
  textContainer.innerHTML = `
    <div>
      <h3 style="text-align: left;">
        <span style="font-weight: normal;">
        🛰️ Here you can relive the latest rocket launch feed available:
        ${launch.lsp_name || ""}, 
        ${launch.rocket_full_name || ""}, 
        ${launch.mission_name || ""}
        </span>
      </h3>
    </div>
  `;

  const type = getEmbedType(url);

  // ===============================
  // 🎥 YOUTUBE
  // ===============================
  if (type === "youtube") {
    const videoId = extractYouTubeID(url);

    container.innerHTML = `
  <iframe
    width="800"
    height="450"
    src="https://www.youtube.com/embed/${videoId}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen>
  </iframe>
    `;
    return;
  }

  // ===============================
  // 🎬 VIMEO
  // ===============================
  if (type === "vimeo") {
    const videoId = url.split("/").pop();

    container.innerHTML = `
      <iframe
        width="800"
        height="450"
        src="https://player.vimeo.com/video/${videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;
    return;
  }

  // ===============================
  // 🐦 X (ESTERNO)
  // ===============================
  if (type === "x") {
    container.innerHTML = `
      <a href="${url}" target="_blank">
        <img
          src="https://spacepatches.github.io/launches/Livefeed.png"
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

// ===============================
// ▶️ START
// ===============================

loadLatestLaunchVideo();