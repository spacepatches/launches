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



async function loadPatchOfTheDay() {
  const container = document.getElementById("patch-of-the-day-video");

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("name, description, pad_name, location_name, vid_url, patch_url, date");

  if (error) {
    container.innerHTML = "Error loading data";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "No patch available";
    return;
  }

  // 🔍 Trova la patch giusta confrontando giorno e mese
  const patch = data.find(item => {
    const d = new Date(item.date);
    return (
      d.getDate() === todayDay &&
      d.getMonth() + 1 === todayMonth
    );
  });

  if (!patch) {
    container.innerHTML = "No patch today";
    return;
  }

  renderPatchOfTheDayVideo(launch);
}


  function renderPatchOfTheDayVideo(launch) {
	const textContainer = document.getElementById("patch-of-day-text");
    const container = document.getElementById("patch-of-the-day-video");
	
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



  function extractYouTubeID(patch.vid_url) {
    if (!url) return null;

    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|live\/)|youtu\.be\/)([^&\n?#]+)/;

    const match = url.match(regex);
    return match ? match[1] : null;
  }



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




  let html = `
    <h3>${patch.name}</h3>
    <p>${patch.description}</p>
    <p><b>Launch Site:</b> ${patch.pad_name} - ${patch.location_name}</p>
    <img src="${patch.patch_url}" width="300">
  `;



  container.innerHTML = html;
}

waitForContainerAndRun();