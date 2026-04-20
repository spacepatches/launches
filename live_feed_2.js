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
    .limit(1); // 🔴 SOLO il più recente

  if (error || !data || data.length === 0) {
    container.innerHTML = "No video available";
    return;
  }

  const launch = data[0]; // ✅ sempre l'ultimo
  renderLatestVideo(launch);
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
        🛰️ Here you can relive the latest rocket launch feed available.<br>  
        <b>${launch.lsp_name || ""}</b>
		${launch.rocket_full_name || ""}, 
        <i>${launch.mission_name || ""}</i>
        launched at ${launch.net || ""}.</span>
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
  // 🎬 VIMEO
  // ===============================
  if (url.includes("vimeo.com")) {
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




// ===============================
// LOAD DATA FOR NEXT VIDEO
// ===============================
async function loadNextLaunchVideo() {
  const container = document.getElementById("next-video");

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
    .gte("net", nowISO)
   .in("status_abbrev", ["Go", "TBC"])
    .not("vid_url", "is", null)
    .order("net", { ascending: true })
    .limit(1); // 🔴 SOLO il più recente

  if (error || !data || data.length === 0) {
    container.innerHTML = "No video available";
    return;
  }

  const launch = data[0]; // ✅ sempre l'ultimo
  renderNextVideo(launch);
}


// ===============================
// RENDER NEXT VIDEO
// ===============================
function renderNextVideo(launch) {
  const container = document.getElementById("next-video");
  const textContainer = document.getElementById("next-video-text");

  const url = launch.vid_url;

  // 📝 TESTO
  textContainer.innerHTML = `
    <div>
      <h3 style="text-align: left;">
        <span style="font-weight: normal;">
        🛰️ Here you can watch live the next rocket launch.<br>   
        <b>${launch.lsp_name || ""}</b>
		${launch.rocket_full_name || ""}, 
        <i>${launch.mission_name || ""}</i>
        will be launched at ${launch.net || ""}.</span>
      </h3>
    </div>
  `;

  container.innerHTML = `
    <a href="${url}" target="_blank">Watch video</a>
  `;
}


document.addEventListener("DOMContentLoaded", () => {
  loadNextLaunchVideo();
});
