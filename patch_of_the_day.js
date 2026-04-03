const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugSupabase() {
  const container = document.getElementById("patch-container");

  let html = "<h3>DEBUG SUPABASE</h3>";

  try {
    html += "<p>Client initialized ✅</p>";

    const response = await supabaseClient
      .from("patch_of_the_day")
      .select("*");

    console.log("FULL RESPONSE:", response);

    html += `<p>Status: ${response.status}</p>`;

    if (response.error) {
      html += `<p style="color:red;"><b>Error:</b> ${response.error.message}</p>`;
      console.error("ERROR:", response.error);
    } else {
      html += "<p style='color:green;'>Query executed ✅</p>";
    }

    if (!response.data || response.data.length === 0) {
      html += "<p>No data returned ⚠️</p>";
    } else {
      html += `<p>Records found: ${response.data.length}</p>`;

      response.data.forEach((row, index) => {
        html += `
          <div style="border:1px solid #ccc; padding:10px; margin:10px;">
            <b>#${index + 1}</b><br>
            name: ${row.name}<br>
            date: ${row.date}<br>
            day_month: ${row.day_month}<br>
            patch_url: ${row.patch_url}<br>
            vid_url: ${row.vid_url}
          </div>
        `;
      });
    }

  } catch (err) {
    html += `<p style="color:red;">JS Error: ${err.message}</p>`;
    console.error("JS ERROR:", err);
  }

  container.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", debugSupabase);