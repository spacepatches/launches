const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


async function loadPatchOfTheDay() {
  const container = document.getElementById("patch-text");

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("name, description, pad_name, location_name, vid_url, patch_url, date");

  // 🔍 Trova la patch giusta confrontando giorno e mese
  const patch = data.find(item => {
    const d = new Date(item.date);
    return d.getDate() === todayDay && d.getMonth() + 1 === todayMonth;
  });

  const launch = data[0]; // ✅ sempre l'ultimo
  renderPatchOfTheDay(launch);

}

  // ===============================
  // 🎥 VIDEO / LINK
  // ===============================

function renderPatchOfTheDay(launch) {
  const container = document.getElementById("patch-video");

  // 📝 TESTO
  textContainer.innerHTML = `
  <div>
    <h3 style="text-align: left;">
      <span style="font-weight: normal;">
      🛰️ Here you can watch live the next rocket launch.<br>   
      <b>${patch.name || ""}</b>
	${patch.date || ""}, 
      ${patch.location_name || ""}
      ${patch.pad_name || ""}
	${patch.description || ""}
	<img href="${patch.patch_url}"</img>
      </span>
    </h3>
  </div>
`;
  

  const ytId = patch.vid_url;
  
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
  if (ytId.includes("x.com")) {
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
  if (ytId.includes("vimeo.com")) {
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



// ▶️ START
document.addEventListener("DOMContentLoaded", () => {
  loadPatchOfTheDay();
});
