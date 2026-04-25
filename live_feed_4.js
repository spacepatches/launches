async function loadDynamicText() {
  const textContainer = document.getElementById("dynamic-text");
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const todayMD = `${month}-${day}`;

  console.log("Searching for:", todayMD);

  const { data, error } = await supabaseClient
    .from("patch_of_the_day")
    .select("date, mission, acengy, rocket")
    .like("date", `%-${todayMD}`)
    .limit(1);

  if (error || !data || data.length === 0) {
    console.error(error);
    textContainer.innerHTML = "No data available";
    return;
  }

  const row = data[0];

  function formatFullDate(date) {
    const d = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const suffix = (n) => {
      if (n > 3 && n < 21) return "th";
      switch (n % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    return `${d}${suffix(d)} ${month} ${year}`;
  }

  const missionDate = new Date(row.date);

  textContainer.innerHTML = `
    <div>
      <h3 style="text-align: left;">
        <span style="font-weight: normal;">
        Latest news ${formatFullDate(today)}<br>  
        👉 Step into the history of spaceflight with <b>"Patch of the day"</b>, 
        a new mission every day. Watch the launch, explore the details, and fuel your passion for space. 
        Today's story: <b>${row.mission}</b> launched by ${row.acengy} 
        the ${formatFullDate(missionDate)} on ${row.rocket}.
        </span>
      </h3>
    </div>
  `;
}

loadDynamicText();