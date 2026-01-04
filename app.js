/* import os
from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

*/

const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const onlyPatchCheckbox = document.getElementById("onlyPatch");
const grid = document.getElementById("grid");
const form = document.getElementById("filters");
const lspInput = document.getElementById("lsp");

onlyPatchCheckbox.addEventListener("change", () => {
  loadLaunches({
    lsp: lspInput?.value.trim(),
    onlyPatch: onlyPatchCheckbox.checked
  });
});


if (form && lspInput) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    loadLaunches(lspInput.value.trim());
  });
}

/*form.addEventListener("submit", e => {
  e.preventDefault();
  loadLaunches(lspInput.value.trim());
}); */

async function loadLaunches({ lsp, onlyPatch }) {
  grid.innerHTML = "Loading…";

  const nowISO = new Date().toISOString();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

  const withPatch = onlyPatchCheckbox?.checked;

  const patchJoin = withPatch
    ? "space_patch!inner ( image_url )"
    : "space_patch ( image_url )";
  
let query = supabaseClient
  .from("launch_ref")
  .select(`
    id,
    mission_name,
    net,
    location_name,
    mission_description,
    rocket_full_name,
    lsp_name,
    lsp_abbrev,
    status_abbrev,
    orbit_abbrev,
    orbital_launch_attempt_count_year,
    agency_launch_attempt_count,
    mission_type,
    info_url,
    vid_url,
    launcher_stage (
      serial_number,
      flights,
      landing_location_abbrev,
      landing_success
    ),
    ${patchJoin}
  `)
  .gte("net", thirtyDaysAgoISO)
  .lte("net", nowISO)
  .in("status_abbrev", ["Success", "Failure"])
  .order("net", { ascending: false }); 
  
 
  if (lsp) {
    query = query.eq("lsp_abbrev", lsp);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    grid.innerHTML = "Errore nel caricamento dati";
    return;
  }

  renderLaunches(data);
}

function renderLaunches(launches) {
  if (!Array.isArray(launches)) {
    console.warn("renderLaunches called with:", launches);
    grid.innerHTML = "Nessun dato disponibile";
    return;
  }

  grid.innerHTML = "";

  const oggi = new Date();

  launches
/*    .filter(l => new Date(l.net) <= oggi) // ⬅️ ESCLUDE LANCI FUTURI */
    .forEach(l => {
    const stage = l.launcher_stage?.[0] || {};
	const patch =
	  l.space_patch && l.space_patch.length > 0 && l.space_patch[0].image_url
    ? l.space_patch[0].image_url
    : "no_patch.png";

	let statusClass = "other";

	const status = l.status_abbrev?.toLowerCase();

	if (status === "success") {
	  statusClass = "success";
	} else if (status === "failure") {
	  statusClass = "failure";
	}

    const date = new Date(l.net).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
	  hour: "2-digit",
      minute: "2-digit"
    });

    const year = new Date(l.net).toLocaleDateString("it-IT", {
      year: "numeric"
    });

    const card = document.createElement("div");
    card.className = "launch-card";

    card.innerHTML = `
      <table>
		<tr><td class="patch">
  		<div class="patch-box ${statusClass}">
    	<img src="${patch}">
  	  	</div>
		</td></tr>
        <tr><td class="lsp">${l.lsp_name || ""}</td></tr>
        <tr><td class="mission">${l.mission_name || ""}</td></tr>
		<tr><td class="date">${date} UTC</td></tr>
        <tr><td>${l.location_name || ""}</td></tr>
        <tr><td class="rocket">${l.rocket_full_name || ""} ${stage.serial_number != null ? ` - ${stage.serial_number}` : ""}${stage.flights != null ? `.${stage.flights}` : ""}</td></tr>
        <tr><td><br></td></tr>
        <tr><td class="lsp">${l.mission_type || ""}</td></tr>	
        <tr><td class="description">${l.mission_description || ""}</td></tr>
        <tr><td><br></td></tr>
        <tr><td class="small">${year}–${l.orbital_launch_attempt_count_year ?? ""}, ${l.lsp_abbrev || ""}–${l.agency_launch_attempt_count ?? ""}</td>
        <tr><td class="small">Launch: ${l.status_abbrev || ""} (${l.orbit_abbrev || ""}) ${stage.landing_success === true ? `, Landing: Success (${stage.landing_location_abbrev})` : ""}${stage.landing_success === false ? `, Landing: Failure (${stage.landing_location_abbrev})` : ""}</td></tr>
	    <tr><td class="link">${l.info_url != null ? `<a href=${l.info_url} target="_blank" class="green-link">PRESS KIT</a> -` : ""} ${l.vid_url != null ? ` <a href=${l.vid_url} target="_blank" class="green-link">RELIVE</a>` : ""}
	      </table>
    `;

    grid.appendChild(card);
  });
}

// caricamento iniziale
loadLaunches();
