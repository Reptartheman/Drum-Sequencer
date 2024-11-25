import * as Tone from "tone";
import drumKits from "./drumLibrary.js";

const transport = Tone.getTransport();
const metronome = new Tone.Synth().toDestination();
const soundSources = [
  new Tone.Player("./sounds/kick.wav").toDestination(),
  new Tone.Player("./sounds/snare.wav").toDestination(),
  new Tone.Player("./sounds/hihat.wav").toDestination(),
  new Tone.Player("./sounds/rim.wav").toDestination(),
];


let beatCounter = 0;
let isMetronomeOn = false;
let currentStep = 0;
const totalSteps = 32;

const domElements = {
  kickLabel: document.getElementById("kickLabel"),
  snareLabel: document.getElementById("snareLabel"),
  hiHatLabel: document.getElementById("HHLabel"),
  rimLabel: document.getElementById("rimLabel"),
  kickLane: document.getElementById("kickLane"),
  snareLane: document.getElementById("snareLane"),
  hiHatLane: document.getElementById("hiHatLane"),
  rimLane: document.getElementById("rimLane"),
  transportTimeDisplay: document.getElementById("transportTimeDisplay")
}

const drumLabels = [domElements.kickLabel, domElements.snareLabel, domElements.hiHatLabel, domElements.rimLabel];
const drumLanes = [domElements.kickLane, domElements.snareLane, domElements.hiHatLane, domElements.rimLane];

const transportItems = {
  metronomeButton: document.getElementById("metronomeButton"),
  playButton: document.querySelector(".play-container img"),
  pauseButton: document.querySelector(".pause-container img"),
  stopButton: document.querySelector(".stop-container img"),
  incrementTempoButton: document.getElementById("incrementTempo"),
  decrementTempoButton: document.getElementById("decrementTempo"),
  tempoDisplay: document.getElementById("tempoDisplay"),
  clearButton: document.getElementById("clearButton"),
  exportButton: document.getElementById("exportButton"),
  clearPattern: () => {
      const drums = document.getElementById("drums");
      drums.querySelectorAll(".subdivision").forEach((subdivision) => {
        subdivision.classList.remove("active");
      });
  },
  playMetronome: (time) => {
    metronome.volume.value = -13;
    const note = beatCounter % 4 === 0 ? "C5" : "C4";
    metronome.triggerAttackRelease(note, "16n", time);
    beatCounter++;
  },
  toggleMetronomActive: () => {
      isMetronomeOn = !isMetronomeOn;
      transportItems.metronomeButton.classList.toggle("active", isMetronomeOn);
  },
  startSequence: () => {
      if (transport.state !== "started") {
        transport.start();
      } 
    },
  pauseSequence: () => {
    transport.pause();
  },
  stopSequence: () => {
    transport.stop();
    beatCounter = 0;
    transport.position = "0:0:0";
    currentStep = 0;
    highlightStep(currentStep);
  },
}

const metronomeEvent = transport.scheduleRepeat((time) => {
  if (isMetronomeOn) transportItems.playMetronome(time);
}, "4n");

transportItems.metronomeButton.addEventListener("click", transportItems.toggleMetronomActive);

transportItems.playButton.addEventListener("click", transportItems.startSequence);

transportItems.pauseButton.addEventListener("click", transportItems.pauseSequence);
transportItems.stopButton.addEventListener("click", transportItems.stopSequence);


function updateTempoDisplay() {
  transportItems.tempoDisplay.textContent = `${Math.round(transport.bpm.value)} BPM`;
}

transportItems.incrementTempoButton.addEventListener("click", () => {
  transport.bpm.value += 1;
  updateTempoDisplay();
});

transportItems.decrementTempoButton.addEventListener("click", () => {
  if (transport.bpm.value > 1) {
    transport.bpm.value -= 1;
    updateTempoDisplay();
  }
});


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


/* function populateScaleDropdown(array) {
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
} */

//populateScaleDropdown(majorKeys);




function highlightStep(step) {
  drumLanes.forEach((lane) => {
    const subdivisions = lane.children;
    Array.from(subdivisions).forEach((subdivision) =>
      subdivision.classList.remove("playing")
    );
    if (subdivisions[step]) {
      subdivisions[step].classList.add("playing");
    }
  });
}


let drumSequences = [];

drumLanes.forEach((lane, index) => {
  const soundSource = soundSources[index];

  const sequence = new Tone.Sequence(
    (time, step) => {
      const subdivision = lane.children[step];
      if (subdivision.classList.contains("active")) {
        soundSource.start(time);
      }
      if (index === 0) {
        highlightStep(step);
      }
    },
    Array.from({ length: totalSteps }, (_, i) => i),
    "16n"
  ).start(0);

  drumSequences.push(sequence);
});

drumLabels.forEach((label, index) => {
  label.addEventListener("click", async (e) => {
    e.preventDefault();
    await Tone.start();
    soundSources[index].start();
  });
});



let isDragging = false;
let hasPlayedSound = false;

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

transportItems.clearButton.addEventListener("click", transportItems.clearPattern);



const keyToDrum = {
  a: 0, // Kick
  s: 1, // Snare
  d: 2, // Hi-hat
  f: 3  // Rim
};

// Play sound and update lanes
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase(); // Normalize key to lowercase
  const drumIndex = keyToDrum[key];

  if (drumIndex !== undefined) {
    // Play the sound
    soundSources[drumIndex].start();

    // Flash the label for visual feedback
    flashLabel(drumLabels[drumIndex]);
  }
});

function flashLabel(label) {
  label.classList.add("pressed");
  setTimeout(() => label.classList.remove("pressed"), 500);
}
