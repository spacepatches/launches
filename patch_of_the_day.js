const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function waitForContainerAndRun() {
  const container = document.getElementById("patch-container");

  if (!container) {
    setTimeout(waitForContainerAndRun, 500);
    return;
  }

  loadPatchOfTheDay();
}

async function loadPatchOfTheDay() {
  const container = document.getElementById("patch-container");

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

  let html = `
    <h3>${patch.name}</h3>
    <p>${patch.description}</p>
    <p><b>Launch Site:</b> ${patch.pad_name} - ${patch.location_name}</p>
    <img src="${patch.patch_url}" width="300">
  `;

  if (patch.vid_url) {
    let vidUrl = patch.vid_url.trim();

    // YouTube
    if (vidUrl.includes("youtube.com/watch") || vidUrl.includes("youtu.be/")) {
      let videoId = "";

      if (vidUrl.includes("youtube.com/watch")) {
        const urlObj = new URL(vidUrl);
        videoId = urlObj.searchParams.get("v");
      } else if (vidUrl.includes("youtu.be/")) {
        videoId = vidUrl.split("/").pop();
      }

      if (videoId) {
        vidUrl = "https://www.youtube.com/embed/" + videoId;
      }
    }

    html += `
      <div>
        <iframe width="560" height="315"
          src="${vidUrl}"
          frameborder="0" allowfullscreen>
        </iframe>
      </div>
    `;
  }

  container.innerHTML = html;
}

waitForContainerAndRun();