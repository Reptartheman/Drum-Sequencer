import * as Tone from "tone";
// DOM elements
const metronomeButton = document.getElementById("metronomeButton");
const playButton = document.querySelector(".play-container img");
const pauseButton = document.querySelector(".pause-container img");
const stopButton = document.querySelector(".stop-container img");
const incrementTempoButton = document.getElementById("incrementTempo");
const decrementTempoButton = document.getElementById("decrementTempo");
const tempoDisplay = document.getElementById("tempoDisplay");

/* TRACKS */
const drumsTrack = document.getElementById("drums");
const bassTrack = document.getElementById("bass");
/* DRUM LABELS */
const kickLabel = document.getElementById("kickLabel");
const snareLabel = document.getElementById("snareLabel");
const hiHatLabel = document.getElementById("HHLabel");
const rimLabel = document.getElementById("rimLabel");

/* DRUM LANES */
const kickLane = document.getElementById("kickLane");
const snareLane = document.getElementById("snareLane");
const hiHatLane = document.getElementById("hiHatLane");
const rimLane = document.getElementById("rimLane");


// Tone.js setup
const transport = Tone.getTransport();
const metronome = new Tone.Synth().toDestination();
const soundSources = [
  new Tone.Player("./sounds/kick.wav").toDestination(),
  new Tone.Player("./sounds/snare.wav").toDestination(),
  new Tone.Player("./sounds/hihat.wav").toDestination(),
  new Tone.Player("./sounds/rim.wav").toDestination(),
];
const drumLabels = [kickLabel, snareLabel, hiHatLabel, rimLabel];
const drumLanes = [kickLane, snareLane, hiHatLane, rimLane];

let beatCounter = 0;
let isMetronomeOn = false;
let currentStep = 0;
const totalSteps = 32;

function playMetronome(time) {
  metronome.volume.value = -20;
  const note = beatCounter % 4 === 0 ? "C5" : "C4";
  metronome.triggerAttackRelease(note, "16n", time);
  beatCounter++;
}

const metronomeEvent = Tone.getTransport().scheduleRepeat((time) => {
  if (isMetronomeOn) playMetronome(time);
}, "4n");

metronomeButton.addEventListener("click", () => {
  isMetronomeOn = !isMetronomeOn;
  metronomeButton.classList.toggle("active", isMetronomeOn);
});

// Transport controls
playButton.addEventListener("click", () => {
  if (transport.state !== "started") {
    transport.start();
    currentStep = 0;
    beatCounter = 0;
  }
});

pauseButton.addEventListener("click", () => transport.pause());
stopButton.addEventListener("click", () => {
  transport.stop();
  transport.position = "0:0:0";
  currentStep = 0;
  highlightStep(currentStep);
});

// Tempo controls
incrementTempoButton.addEventListener("click", () => {
  transport.bpm.value += 1;
  updateTempoDisplay();
});

decrementTempoButton.addEventListener("click", () => {
  if (transport.bpm.value > 1) {
    transport.bpm.value -= 1;
    updateTempoDisplay();
  }
});

function updateTempoDisplay() {
  tempoDisplay.textContent = `${Math.round(transport.bpm.value)} BPM`;
}

// Render instrument grids
function createSubdivisionsForLane(lane) {
  for (let i = 0; i < 32; i++) {
    const div = document.createElement("div");
    div.classList.add("subdivision");
    div.style.gridColumn = `${i + 1}`;
    if (i % 4 === 0) div.style.borderLeft = "4px solid black";
    lane.appendChild(div);
  }
}

function renderGridSubdivisions() {
  const lanes = document.querySelectorAll(".drum-lane, .pitch-lane");
  lanes.forEach((lane) => createSubdivisionsForLane(lane));
}
renderGridSubdivisions();




function populateScaleDropdown(array) {
  const scaleDropdownContent = document.getElementById("scaleDropdownContent");

  array.forEach((key, i) => {
    const scaleDropDownItem = document.createElement("p");
    scaleDropDownItem.id = "scaleDropdownItem";
    scaleDropDownItem.classList.add("scale-dropdown-item");
    scaleDropDownItem.textContent = key.name;
    scaleDropDownItem.style.backgroundColor = key.bgColor; // Set color in dropdown

    // When scale is selected, render the pitch stack
    scaleDropDownItem.addEventListener('click', () => {
      renderPitchStacks(key, 'bassPitchStack'); // Render for bass
      renderPitchStacks(key, 'melodyPitchStack'); // Render for melody
    });

    scaleDropdownContent.appendChild(scaleDropDownItem);
  });
}

populateScaleDropdown(majorKeys);


function highlightStep(step) {
  drumLanes.forEach((lane) => {
    const subdivisions = lane.children;
    // Clear the "playing" class from all subdivisions
    Array.from(subdivisions).forEach((subdivision) =>
      subdivision.classList.remove("playing")
    );
    // Add the "playing" class to the current step
    if (subdivisions[step]) {
      subdivisions[step].classList.add("playing");
    }
  });
}

// Play sequence logic
let drumSequences = [];

// Initialize sequence for each lane
drumLanes.forEach((lane, index) => {
  const soundSource = soundSources[index];

  // Create a sequence for each lane
  const sequence = new Tone.Sequence(
    (time, step) => {
      const subdivision = lane.children[step];
      if (subdivision.classList.contains("active")) {
        soundSource.start(time); // Play sound if active
      }
      if (index === 0) {
        // Apply the playhead effect only once (on the first lane)
        highlightStep(step);
      }
    },
    Array.from({ length: totalSteps }, (_, i) => i), // Steps for 32 subdivisions
    "16n" // Sixteenth note intervals
  ).start(0); // Start sequence at the beginning of transport

  drumSequences.push(sequence);
});

// Attach sound playback to drum labels
drumLabels.forEach((label, index) => {
  label.addEventListener("click", async (e) => {
    e.preventDefault();
    await Tone.start();
    soundSources[index].start();
  });
});

let isDragging = false;
let hasPlayedSound = false;

// Update subdivisions on user input
drumLanes.forEach((lane, index) => {
  lane.addEventListener("mousedown", async (e) => {
    const target = e.target;
    if (target.classList.contains("subdivision")) {
      isDragging = true;
      hasPlayedSound = false;

      target.classList.toggle("active");

      if (!hasPlayedSound && target.classList.contains("active")) {
        await Tone.start();
        soundSources[index].start();
        hasPlayedSound = true;
      }
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (target && target.classList.contains("subdivision")) {
        target.classList.add("active");
      }
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    hasPlayedSound = false;
  });
});

document.getElementById("clearButton").addEventListener("click", () => {
  const drums = document.getElementById("drums");
  drums.querySelectorAll(".subdivision").forEach((subdivision) => {
    subdivision.classList.remove("active");
  });
});