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

//        Latest news ${formatFullDate(today)}<br>  


  textContainer.innerHTML = `
    <div>
      <h3 style="text-align: left;">
        <span style="font-weight: normal;">
        <b>Today latest news</b><br>  
        Step into the history of spaceflight with the <b>Patch of the day</b>, 
        a new mission every day.<br>Watch the launch, explore the details, and fuel your passion for space.<br>
        👉 Today's story: <a href="https://spacepatches.blogspot.com/p/patch-of-day_5.html">${data.mission}</a> launched by ${data.acengy} 
        the ${formatFullDate(missionDate)} on ${data.rocket}.
        </span>
      </h3>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", loadDynamicText);


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
    .in("status_abbrev", ["Success", "Failure", "Deployed"])
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
