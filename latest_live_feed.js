
const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const grid = document.getElementById("grid");
const lspInput = document.getElementById("lsp");


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
  .limit(1);

  if (error || !data || data.length === 0) {
    container.innerHTML = "No video available";
    return;
  }

  renderLatestVideo(data[0]);
}

function renderLatestVideo(launch) {
  const container = document.getElementById("latest-video");
  const url = launch.vid_url;

  // 🔴 Caso YouTube
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = extractYouTubeID(url);

    container.innerHTML = `
      <iframe
        width="800"
        height="450"
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;
    return;
  }

  // 🔵 Caso X (SpaceX tipicamente)
  if (url.includes("x.com")) {
    container.innerHTML = `
      <a href="${url}" target="_blank">
        <img
          src="https://github.com/spacepatches/launches/Livefeed.png"
          alt="Watch broadcast"
          width="800"
        />
      </a>
    `;
    return;
  }

  // ⚪ fallback generico
  container.innerHTML = `
    <a href="${url}" target="_blank">Watch video</a>
  `;
}

function renderLatestVideo(launch) {
  const container = document.getElementById("latest-video");
  const textContainer = document.getElementById("latest-video-text");

  const url = launch.vid_url;

  // 📝 TESTO DINAMICO
  textContainer.innerHTML = `
<div><h3 style="text-align: left;"><span style="font-weight: normal;">🛰️ Here you can relive the latest rocket launch feed available:&nbsp;
      ${launch.lsp_name || ""}, 
      ${launch.rocket_full_name || ""}, 
      ${launch.mission_name || ""}
    </span><br></h3></div>
  `;

  // 🎥 YOUTUBE
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = extractYouTubeID(url);

    container.innerHTML = `
      <iframe
        width="800"
        height="450"
        src="https://www.youtube.com/embed/${videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;
    return;
  }

  // 🐦 X (SpaceX)
  if (url.includes("x.com")) {
    container.innerHTML = `
      <a href="${url}" target="_blank">
        <img
          src="https://github.com/spacepatches/launches/Livefeed.png"
          alt="Watch broadcast"
          width="800"
        />
      </a>
    `;
    return;
  }

  // fallback
  container.innerHTML = `
    <a href="${url}" target="_blank">Watch video</a>
  `;
}

loadLatestLaunchVideo();
