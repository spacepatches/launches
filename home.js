
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
    space_patch (
     name,
	  image_url
    )
  `)
  .lte("net", nowISO)
  .order("net", { ascending: false })
  .limit(15);   // prendiamo più record per sicurezza

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

  let shown = 0;

  for (const l of launches) {
    if (shown >= 5) break;

    const patchUrl = l.space_patch?.[0]?.image_url;
    if (!patchUrl) continue;

    const date = new Date(l.net).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    });

    const card = document.createElement("div");
    card.className = "patch-card";

	const patchName = l.space_patch?.[0]?.name || "";

	card.innerHTML = `
	  <img src="${patchUrl}" alt="${patchName}">
<div class="patch-info">
  <span class="patch-name">${patchName}</span>
</div>
<div class="patch-info">
	  <span class="patch-date">${date}</span>
</div>

	`;

    patchGrid.appendChild(card);
    shown++;
  }

  if (shown === 0) {
    patchGrid.innerHTML = "No mission patches available";
  }
}


// caricamento iniziale
loadLatestPatches();

