const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function showAllPatches() {
  const container = document.getElementById("patch-container");

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("*");  // prendi tutti i record

  if (error) {
    console.error("Supabase error:", error);
    container.innerHTML = "Error loading data";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "No records in the table";
    return;
  }

  let html = "<h3>All patches in the table:</h3><ul>";

  data.forEach(patch => {
    html += `<li>
      <b>Name:</b> ${patch.name} |
      <b>Date:</b> ${patch.date} |
      <b>Day_Month:</b> ${patch.day_month} |
      <b>Pad:</b> ${patch.pad_name} |
      <b>Location:</b> ${patch.location_name} |
      <b>Patch URL:</b> ${patch.patch_url} |
      <b>Video URL:</b> ${patch.vid_url}
    </li>`;
  });

  html += "</ul>";

  container.innerHTML = html;
}

// Esegui al caricamento del DOM
document.addEventListener("DOMContentLoaded", showAllPatches);