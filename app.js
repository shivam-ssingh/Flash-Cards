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
  const cardEl = document.getElementById("card");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const flipBtn = document.getElementById("flipBtn");
  const shuffleBtn = document.getElementById("shuffleBtn");
  const markKnownBtn = document.getElementById("markKnownBtn");
  const resetProgressBtn = document.getElementById("resetProgressBtn");
  const exitPlayerBtn = document.getElementById("exitPlayer");

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
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const fields = results.meta.fields;
        if (!fields || fields.length < 2) {
          alert("CSV must have at least two columns.");
          return;
        }
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
    const sets = loadAllSets();
    const cards = parsedCards();
    const id = "set_" + Date.now();
    const newSet = {
      id,
      name,
      cards,
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

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js");
  }
})();
