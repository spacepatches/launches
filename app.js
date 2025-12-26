const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabase = supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);

const grid = document.getElementById("grid");
const form = document.getElementById("filters");
const lspInput = document.getElementById("lsp");

form.addEventListener("submit", e => {
  e.preventDefault();
  loadLaunches(lspInput.value.trim());
});

async function loadLaunches(lsp) {
  grid.innerHTML = "Loading…";

  let query = supabase
    .from("launch_ref")
    .select(`
      id,
      mission_name,
      net,
      location_name,
      rocket_full_name,
      lsp_name,
      lsp_abbrev,
      status_abbrev,
      orbit_abbrev,
      orbital_launch_attempt_count_year,
      agency_launch_attempt_count_year,
      launcher_stage (
        serial_number,
        flights
      ),
      space_patch (
        image_url
      )
    `)
    .order("net");

  if (lsp) {
    query = query.eq("lsp_abbrev", lsp);
  }

  const { data, error } = await query;

  if (error) {
    grid.innerHTML = "Errore nel caricamento dati";
    console.error(error);
    return;
  }

  renderLaunches(data);
}

function renderLaunches(launches) {
  grid.innerHTML = "";

  launches.forEach(l => {
    const stage = l.launcher_stage?.[0] || {};
    const patch = l.space_patch?.image_url || "";

    const date = new Date(l.net).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    const card = document.createElement("div");
    card.className = "launch-card";

    card.innerHTML = `
      <table>
        <tr>
          <td colspan="2" class="patch">
            ${patch ? `<img src="${patch}">` : ""}
          </td>
        </tr>
        <tr><th>Mission</th><td>${l.mission_name || ""}</td></tr>
        <tr><th>Date</th><td>${date}</td></tr>
        <tr><th>Location</th><td>${l.location_name || ""}</td></tr>
        <tr><th>Rocket</th><td>${l.rocket_full_name || ""}</td></tr>
        <tr><th>Stage</th>
            <td>${stage.serial_number || ""} – ${stage.flights ?? ""}</td>
        </tr>
        <tr><th>LSP</th><td>${l.lsp_name || ""}</td></tr>
        <tr><th>Orbital</th>
            <td>2025 – ${l.orbital_launch_attempt_count_year ?? ""}</td>
        </tr>
        <tr><th>Agency</th>
            <td>${l.lsp_abbrev || ""} – ${l.agency_launch_attempt_count_year ?? ""}</td>
        </tr>
        <tr><th>Status</th><td>${l.status_abbrev || ""}</td></tr>
        <tr><th>Orbit</th><td>${l.orbit_abbrev || ""}</td></tr>
      </table>
    `;

    grid.appendChild(card);
  });
}

// Primo caricamento
loadLaunches();
