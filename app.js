(function () {
  //DOM Elements
  const fileInput = document.getElementById("fileInput");
  const columnSelectors = document.getElementById("columnSelectors");
  const frontSelect = document.getElementById("frontColumn");
  const backSelect = document.getElementById("backColumn");
  const setNameInput = document.getElementById("setName");
  const previewBtn = document.getElementById("previewBtn");
  const saveSetBtn = document.getElementById("saveSetBtn");
  const savedSetsSelect = document.getElementById("savedSets");
  const loadSetBtn = document.getElementById("loadSetBtn");
  const deleteSetBtn = document.getElementById("deleteSetBtn");
  const notesSetBtn = document.getElementById("notesSetBtn");
  const cardEl = document.getElementById("card");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const flipBtn = document.getElementById("flipBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const markKnownBtn = document.getElementById("markKnownBtn");
  const resetProgressBtn = document.getElementById("resetProgressBtn");
  const exitPlayerBtn = document.getElementById("exitPlayer");
  const notesUrlInput = document.getElementById("notesUrl");
  let lastParsedRows = [];
  const homeView = document.getElementById("homeView");
  const playerView = document.getElementById("playerView");

  let currentSet = null;
  let currentIndex = 0;
  let flipped = false;

  function showHome() {
    playerView.classList.add("hidden");
    homeView.classList.remove("hidden");
  }

  function showPlayer() {
    homeView.classList.add("hidden");
    playerView.classList.remove("hidden");
  }

  exitPlayerBtn.addEventListener("click", showHome);

  function saveAllSets(sets) {
    localStorage.setItem("flashcardSets_v1", JSON.stringify(sets));
  }

  function loadAllSets() {
    const data = localStorage.getItem("flashcardSets_v1");
    return data ? JSON.parse(data) : [];
  }

  function refreshSavedSets() {
    const sets = loadAllSets();
    savedSetsSelect.innerHTML = "";
    sets.forEach((set) => {
      const opt = document.createElement("option");
      opt.value = set.id;
      opt.textContent = set.name;
      savedSetsSelect.appendChild(opt);
    });
  }

  refreshSavedSets();

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      encoding: "UTF-8", //iphone
      header: true,
      skipEmptyLines: true,
      worker: false,
      beforeFirstChunk(chunk) {
        // Remove BOM for iPhone
        return chunk.replace(/^\uFEFF/, "");
      },
      complete: function (results) {
        const fields = results.meta.fields;
        if (!fields || fields.length < 2) {
          alert("CSV must have at least two columns.");
          return;
        }
        lastParsedRows = results.data;
        columnSelectors.classList.remove("hidden");
        frontSelect.innerHTML = "";
        backSelect.innerHTML = "";
        fields.forEach((f) => {
          const opt1 = document.createElement("option");
          opt1.value = f;
          opt1.textContent = f;
          frontSelect.appendChild(opt1);
          const opt2 = document.createElement("option");
          opt2.value = f;
          opt2.textContent = f;
          backSelect.appendChild(opt2);
        });
        frontSelect.value = fields[0];
        backSelect.value = fields[1];
      },
    });
  });

  saveSetBtn.addEventListener("click", () => {
    const name = setNameInput.value.trim();
    if (!name) return alert("Enter a name for the set");
    const notesUrl = notesUrlInput.value.trim();
    const sets = loadAllSets();
    // const cards = parsedCards();
    const cards = lastParsedRows.map((row) => ({
      front: row[frontSelect.value] || "",
      back: row[backSelect.value] || "",
    }));
    const id = "set_" + Date.now();
    const newSet = {
      id,
      name,
      cards,
      notesUrl: notesUrl || null,
      frontKey: frontSelect.value,
      backKey: backSelect.value,
    };
    sets.push(newSet);
    saveAllSets(sets);
    refreshSavedSets();
    alert("Set saved!");
  });

  function parsedCards() {
    // Dummy: we should parse again or store last results from upload
    // Simplified for demonstration
    return [];
  }

  loadSetBtn.addEventListener("click", () => {
    const id = savedSetsSelect.value;
    if (!id) return alert("Select a set first");
    const sets = loadAllSets();
    currentSet = sets.find((s) => s.id === id);
    if (!currentSet) return;
    currentIndex = 0;
    flipped = false;
    showCard();
    showPlayer();
  });

  deleteSetBtn.addEventListener("click", () => {
    const setId = savedSetsSelect.value;
    const sets = loadAllSets();
    const updated = sets.filter((s) => s.id !== setId);

    saveAllSets(updated);
    refreshSavedSets();
  });

  notesSetBtn.addEventListener("click", () => {
    const id = savedSetsSelect.value;
    if (!id) return alert("Select a set first");
    const sets = loadAllSets();
    const set = sets.find((s) => s.id === id);
    if (!set || !set.notesUrl) return alert("No notes attached to this set.");
    // Redirect to notes page
    window.location.href = `notes.html?set=${encodeURIComponent(id)}`;
  });
  function showCard() {
    if (!currentSet || !currentSet.cards.length) {
      cardEl.textContent = "No cards in this set.";
      return;
    }
    const card = currentSet.cards[currentIndex];
    cardEl.textContent = flipped ? card.back : card.front;
  }

  flipBtn.addEventListener("click", () => {
    flipped = !flipped;
    showCard();
  });
  cardEl.addEventListener("click", () => {
    flipped = !flipped;
    showCard();
  });

  prevBtn.addEventListener("click", () => {
    if (!currentSet) return;
    currentIndex =
      (currentIndex - 1 + currentSet.cards.length) % currentSet.cards.length;
    flipped = false;
    showCard();
  });

  nextBtn.addEventListener("click", () => {
    if (!currentSet) return;
    currentIndex = (currentIndex + 1) % currentSet.cards.length;
    flipped = false;
    showCard();
  });
  window.openNotes = function (setId) {
    const sets = loadAllSets();
    const found = sets.find((s) => s.id === setId);
    if (!found || !found.notesUrl) return alert("This set has no notes.");
    window.location.href = `notes.html?set=${encodeURIComponent(setId)}`;
  };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed", err));
  }
})();
