const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


async function loadPatchOfTheDay() {
  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("*");

  if (error) {
    console.error(error);
    return;
  }

  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1;

  const patch = data.find(item => {
    const d = new Date(item.date);
    return d.getDate() === todayDay && d.getMonth() + 1 === todayMonth;
  });

  if (patch) {
    renderPatchOfTheDay(launch);
  } else {
    console.log("Nessuna patch per oggi");
  }
}

function renderPatchOfTheDay(launch) {
  const container = document.getElementById("next-video");
  const textContainer = document.getElementById("next-video-text");

  textContainer.innerHTML = `
    <div>
      <h3 style="text-align: left;">
        <span style="font-weight: normal;">
          🛰️ Here you can watch live the next rocket launch.<br>
          <b>${launch.name || ""}</b> ${launch.date || ""}, 
          ${launch.location_name || ""} ${launch.pad_name || ""}<br>
          ${launch.description || ""}<br>
          ${launch.patch_url ? `<img src="${launch.patch_url}" alt="Patch image" />` : ""}
        </span>
      </h3>
    </div>
  `;

  const vidUrl = patch.vid_url || "";

  if (vidUrl.includes("youtube.com")) {
    const ytId = vidUrl.split("v=")[1] || "";
    container.innerHTML = `
      <iframe width="800" height="450"
        src="https://www.youtube.com/embed/${ytId}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    `;
  } else if (vidUrl.includes("vimeo.com")) {
    const videoId = vidUrl.split("/").pop();
    container.innerHTML = `
      <iframe width="800" height="450"
        src="https://player.vimeo.com/video/${videoId}"
        frameborder="0"
        allowfullscreen>
      </iframe>
    `;
  } else if (vidUrl.includes("x.com")) {
    container.innerHTML = `
      <a href="${vidUrl}" target="_blank">
        <img src="https://spacepatches.github.io/launches/LatestLiveFeed.png" alt="Watch broadcast" width="800" />
      </a>
    `;
  } else {
    container.innerHTML = `<a href="${vidUrl}" target="_blank">Watch video</a>`;
  }
}
  

// ▶️ START
document.addEventListener("DOMContentLoaded", () => {
  loadPatchOfTheDay();
});
