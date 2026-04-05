const SUPABASE_URL = "https://dnrlaowhagxjfjzkoyur.supabase.co";
const SUPABASE_KEY = "sb_publishable_8Rsg9hKeaur_seeAGVJd8w_H60X9ZVG";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ======================
// Date helpers
// ======================

function getDateFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("date"); // es: "1991-04-05"
}

function formatDatePretty(dateString) {
  const date = new Date(dateString);

  const day = date.getDate();
  const year = date.getFullYear();

  const month = date.toLocaleString('en-US', { month: 'long' });

  // Ordinal suffix (st, nd, rd, th)
  function getOrdinal(n) {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  return `${day}${getOrdinal(day)} ${month} ${year}`;
}


function getTodayParts() {
  const today = new Date();

  return {
    day: String(today.getDate()).padStart(2, '0'),
    month: String(today.getMonth() + 1).padStart(2, '0')
  };
}

// ======================
// Video helpers
// ======================

function getYouTubeEmbed(url) {
  try {
    const u = new URL(url);

    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }

    return null;
  } catch {
    return null;
  }
}


function isX(url) {
  return url.includes("x.com") || url.includes("twitter.com");
}

// ======================
// Main
// ======================

async function loadPatchOfTheDay() {
  const container = document.getElementById("container");

  try {
    console.log("Loading patch...");

    const urlDate = getDateFromURL();

    let day, month;

    if (urlDate) {
      console.log("Using date from URL:", urlDate);

      const [year, m, d] = urlDate.split("-");
      day = d;
      month = m;

    } else {
      const today = getTodayParts();
      day = today.day;
      month = today.month;
    }

    const { data, error } = await supabaseClient
      .from("patch_of_the_day")
      .select("*");

    if (error) throw error;

    const patch = data.find(p => {
      const [, m, d] = p.date.split("-");
      return m === month && d === day;
    });

    if (!patch) {
      container.innerHTML = "<p>No patch found for this date</p>";
      return;
    }


	let linkHTML = "";

	if (patch.link) {
	  linkHTML = `
	    <p style="margin-top:15px;">
	      <a href="${patch.link}" target="_blank">
	       Official website
	      </a>
		: explore mission context and background, updates, specifications and new images.  
	    </p>
	  `;
	}

	let presskitHTML = "";

	if (patch.press_kit) {
	  presskitHTML = `
	    <p style="margin-top:15px;">
	      <a href="${patch.link}" target="_blank">
	       Press kit
	      </a>
		: access official documents, payload details, and mission objectives.
	    </p>
	  `;
	}


    // ======================
    // Video rendering
    // ======================

    let videoHTML = "";

    if (patch.vid_url) {
      const ytEmbed = getYouTubeEmbed(patch.vid_url);

      if (ytEmbed) {
        videoHTML = `
	  <div style="position: relative; padding-bottom: 56.25%; height: 0;">
	    <iframe 
	      src="${ytEmbed}"
	      style="position: absolute; top:0; left:0; width:100%; height:100%; border:0;"
	      allowfullscreen>
	    </iframe>
	  </div>
        `;
      } else if (isX(patch.vid_url)) {
        videoHTML = `
          <p>
            <a href="${patch.vid_url}" target="_blank">
              Watch on X
            </a>
          </p>
        `;
      } else {
        videoHTML = `
          <p>
            <a href="${patch.vid_url}" target="_blank">
              Watch video
            </a>
          </p>
        `;
      }
    }

    // ======================
    // Rendering
    // ======================

container.innerHTML = `

<p><img src="${patch.patch_url}" style="width:400px; display:block; margin:20px auto;" alt="patch"></p>
<p><b>${formatDatePretty(patch.date)}</b></p>
<p>${patch.mission || ""} (${patch.rocket || ""})</p>
<p>Launched from ${patch.location_name} (${patch.pad_name})</p>
<p>${patch.description || ""}</p>
  ${linkHTML} 
  ${presskitHTML}
  ${videoHTML}
`;
    console.log("Patch loaded ✅");

  } catch (err) {
    console.error("ERROR:", err);
    document.getElementById("container").innerHTML =
      "<p>Error loading data</p>";
  }
}

// Avvio
loadPatchOfTheDay();