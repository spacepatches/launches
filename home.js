
const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const grid = document.getElementById("grid");
const lspInput = document.getElementById("lsp");


async function loadLatestPatches() {
  const patchGrid = document.getElementById("patch-grid");
  if (!patchGrid) return;

  const nowISO = new Date().toISOString();

  const { data, error } = await supabaseClient
    .from("launch_ref")
    .select(`
      net,
      mission_name,
      space_patch (
        image_url
      )
    `)
    .lte("net", nowISO)                 // solo lanci passati
    .not("space_patch.image_url", "is", null) // patch presente
    .order("net", { ascending: false }) // più recenti prima
    .limit(3);

  if (error) {
    console.error(error);
    patchGrid.innerHTML = "Unable to load patches";
    return;
  }

  renderLatestPatches(data);
}


function renderLatestPatches(launches) {
  const patchGrid = document.getElementById("patch-grid");
  patchGrid.innerHTML = "";

  launches.forEach(l => {
    const patchUrl = l.space_patch?.[0]?.image_url;
    if (!patchUrl) return;

    const date = new Date(l.net).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });

    const card = document.createElement("div");
    card.className = "patch-card";

    card.innerHTML = `
      <img src="${patchUrl}" alt="${l.mission_name}">
      <div class="patch-date">${date} UTC</div>
    `;

    patchGrid.appendChild(card);
  });
}


// caricamento iniziale
loadLaunches();
