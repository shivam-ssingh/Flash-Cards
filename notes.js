// const backBtn = document.getElementById("backBtn");
// const notesContent = document.getElementById("notesContent");

// backBtn.addEventListener("click", () => {
//   window.history.back();
// });

// function getQueryParam(param) {
//   const urlParams = new URLSearchParams(window.location.search);
//   return urlParams.get(param);
// }

// async function loadNotes() {
//   const setId = getQueryParam("set");
//   if (!setId) return;

//   const sets = JSON.parse(localStorage.getItem("flashcardSets_v1") || "[]");
//   const set = sets.find((s) => s.id === setId);
//   if (!set || !set.notesUrl) {
//     notesContent.textContent = "No notes available.";
//     return;
//   }

//   try {
//     // Fetch the HTML of the published Google Doc
//     const res = await fetch(set.notesUrl);
//     const html = await res.text();
//     notesContent.innerHTML = html;
//   } catch (err) {
//     notesContent.textContent = "Failed to load notes.";
//     console.error(err);
//   }
// }

// loadNotes();

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

async function loadNotes() {
  const setId = getQueryParam("set");
  const sets = JSON.parse(localStorage.getItem("flashcardSets_v1") || "[]");
  const set = sets.find((s) => s.id === setId);

  const container = document.getElementById("notesContent");
  container.innerHTML = ""; // Clear previous contents

  if (!set || !set.notesUrl) {
    container.textContent = "No notes available.";
    return;
  }

  try {
    const response = await fetch(set.notesUrl, { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch notes");

    const html = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll("script").forEach((el) => el.remove());

    // Fix Google-style <style> blocks
    doc.querySelectorAll("style").forEach((styleEl) => {
      const cssString = styleEl.textContent;
      const modified = cssString.replace(/\}/g, "}.embedded-doc ");
      styleEl.textContent = modified;
    });

    // Apply layout cleanup
    const wrapper = document.createElement("div");
    wrapper.classList.add("prose", "embedded-doc");

    // Copy only <body> children → safer than dumping full HTML
    [...doc.body.children].forEach((node) => {
      if (node.id != "banners") {
        wrapper.appendChild(node.cloneNode(true));
      }
    });

    // Fix element styles
    wrapper.querySelectorAll("*").forEach((el) => {
      el.style.maxWidth = "100%";
      el.style.removeProperty("height");

      if (el.tagName.toLowerCase() !== "li") {
        el.style.overflow = "hidden";
      }
    });
    // removeGoogleDocsFooter(doc);

    container.appendChild(wrapper);
  } catch (err) {
    console.error("Notes load error:", err);
    container.textContent = "Failed to load notes.";
  }
}

loadNotes();
