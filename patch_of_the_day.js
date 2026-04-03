const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔁 aspetta che il div esista davvero
function waitForContainerAndRun() {
  const container = document.getElementById("patch-container");

  if (!container) {
    console.log("Container not found, retrying...");
    setTimeout(waitForContainerAndRun, 500);
    return;
  }

  console.log("Container found ✅");
  loadPatchOfTheDay();
}

async function loadPatchOfTheDay() {
  const container = document.getElementById("patch-container");

  console.log("Loading patch...");

  const today = new Date();
  const todayKey =
    String(today.getDate()).padStart(2, '0') + "-" +
    String(today.getMonth() + 1).padStart(2, '0');

  console.log("Today key:", todayKey);

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("name, description, pad_name, location_name, vid_url, patch_url")
//    .eq("day_month", todayKey)
    .eq("day_month", "03-04")
      .limit(1);

  console.log("Data:", data);
  console.log("Error:", error);

  if (error) {
    container.innerHTML = "Error loading data";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "No patch today";
    return;
  }

  const patch = data[0];

  let html = `
    <h3>${patch.name}</h3>
    <p>${patch.description}</p>
    <p><b>Launch Site:</b> ${patch.pad_name} - ${patch.location_name}</p>
    <img src="${patch.patch_url}" width="300">
  `;

  if (patch.vid_url) {
    html += `
      <div>
        <iframe width="560" height="315"
          src="${patch.vid_url}"
          frameborder="0" allowfullscreen>
        </iframe>
      </div>
    `;
  }

  container.innerHTML = html;
}

// 🚀 avvio robusto
waitForContainerAndRun();