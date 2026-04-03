const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


async function loadPatchOfTheDay() {
  const container = document.getElementById("patch-container");
  const textContainer = document.getElementById("patch-text");

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
    return d.getDate() === todayDay && d.getMonth() + 1 === todayMonth;
  });

  if (!patch) {
    container.innerHTML = "No patch today";
    return;
  }

  // ===============================
  // 📝 TESTO
  // ===============================
  textContainer.innerHTML = `
    <div>
      <h3>
        <b>${patch.name || ""}</b><br>
        <i>${patch.description || ""}</i><br>
        Pad: ${patch.pad_name || ""}, Location: ${patch.location_name || ""}
      </h3>
    </div>
  `;

  // ===============================
  // 🎥 VIDEO / LINK
  // ===============================
  const url = patch.vid_url;
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
  } else if (url && url.includes("vimeo.com")) {
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
  } else if (url) {
    container.innerHTML = `<a href="${url}" target="_blank">Watch video</a>`;
  } else if (patch.patch_url) {
    container.innerHTML = `<a href="${patch.patch_url}" target="_blank">View patch image</a>`;
  } else {
    container.innerHTML = "No video or patch available";
  }
}

// ▶️ START
document.addEventListener("DOMContentLoaded", () => {
  loadPatchOfTheDay();
});
