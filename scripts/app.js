import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import drumKits from "./drumLibrary.js";

const transport = Tone.getTransport();
transport.loop = true;
transport.loopStart = 0;
transport.loopEnd = "2:0:0";
const midi = new Midi();
const metronomeSource = new Tone.Synth().toDestination();
const draw = Tone.getDraw();
const soundSources = [
  new Tone.Player("./sounds/kick.wav").toDestination(),
  new Tone.Player("./sounds/snare.wav").toDestination(),
  new Tone.Player("./sounds/hihat.wav").toDestination(),
  new Tone.Player("./sounds/rim.wav").toDestination(),
];

let isDragging = false;
let hasPlayedSound = false;
let beatCounter = 0;
let isMetronomeOn = false;
let metronomeLoop;
let measureCount = 2;
const totalSteps = 32;

const keyToDrum = {
  z: 0, // Kick
  s: 1, // Snare
  h: 2, // Hi-hat
  d: 3, // Rim
};

const domElements = {
  drumLabelContainer: document.querySelectorAll(".drum-label-container"),
  kickLabel: document.getElementById("kickLabel"),
  snareLabel: document.getElementById("snareLabel"),
  hiHatLabel: document.getElementById("HHLabel"),
  rimLabel: document.getElementById("rimLabel"),
  kickLane: document.getElementById("kickLane"),
  snareLane: document.getElementById("snareLane"),
  hiHatLane: document.getElementById("hiHatLane"),
  rimLane: document.getElementById("rimLane"),
  transportTimeDisplay: document.getElementById("transportTimeDisplay"),
  measuresContainer: document.getElementById("measuresContainer"),
  timeLineItems: document.querySelectorAll(".timeline-item"),
  handleKeyUp: (e) => {
    const key = e.key.toLowerCase();
    const drumIndex = keyToDrum[key];
    if (drumIndex === undefined) return;

    const drumLabel = drumLabels[drumIndex];
    drumLabel.classList.remove("pressed");
  },
  handleKeyDown: async (e) => {
    const key = e.key.toLowerCase();
    const drumIndex = keyToDrum[key];
    if (drumIndex === undefined) return;

    const drumLabel = drumLabels[drumIndex];
    drumLabel.classList.add("pressed");

    await Tone.start();
    soundSources[drumIndex].start();
  },
  handleDrumLabelClick: (array) => {
    array.forEach((label, index) => {
      label.addEventListener("click", async (e) => {
        e.preventDefault();
        await Tone.start();
        soundSources[index].start();
      });
    });
  },
};
const drumLabels = [
  domElements.kickLabel,
  domElements.snareLabel,
  domElements.hiHatLabel,
  domElements.rimLabel,
];
const drumLanes = [
  domElements.kickLane,
  domElements.snareLane,
  domElements.hiHatLane,
  domElements.rimLane,
];

const drumLogic = {
  createSubdivisionsForLane: (lane) => {
    for (let i = 0; i < 32; i++) {
      const div = document.createElement("div");
      div.classList.add("subdivision");
      div.style.gridColumn = `${i + 1}`;
      if (i % 4 === 0) div.style.borderLeft = "4px solid black";
      lane.appendChild(div);
    }
  },
  renderGridSubdivisions: function () {
    const lanes = document.querySelectorAll(".drum-lane, .pitch-lane");
    lanes.forEach((lane) => this.createSubdivisionsForLane(lane));
  },
  handleGridEventListeners: (arr) => {
    arr.forEach((lane, index) => {
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
    });
  },
  handleBeatCount: function () {
    new Tone.Loop((time) => {
      const position = transport.position.split(":");
      const bars = parseInt(position[0], 10);
      const beats = parseInt(position[1], 10);
      const sixteenths = parseInt(position[2], 10);
      
      
      beatCounter = ((bars * 4 + beats) % totalSteps);
      console.log(`Current Bar: ${bars}: Current Beat: ${beats}`);
        draw.schedule(() => {
            drumLogic.highlightStep();
        }, time);
    }, "4n").start(0);
},

  
highlightStep: function () {
  domElements.timeLineItems.forEach((item) => {
    item.classList.remove("playing");
  });

  if (beatCounter < domElements.timeLineItems.length) {
    domElements.timeLineItems[beatCounter].classList.add("playing");
  }
},
setBeatBlock: function () {
  // Remove playing class from all items
  domElements.timeLineItems.forEach((item) => {
    item.classList.remove("playing");
  });

  // Add playing class to the first item
  domElements.timeLineItems[0].classList.add("playing");

  // Reset the beat counter
  beatCounter = 0;
},

  addSoundsToGrid: function (arr) {
    let drumSequences = [];
    arr.forEach((lane, index) => {
      const soundSource = soundSources[index];

      const sequence = new Tone.Sequence(
        (time, step) => {
          const subdivision = lane.children[step];
          if (subdivision.classList.contains("active")) {
            soundSource.start(time);
          }
        },
        Array.from({ length: totalSteps }, (_, i) => i),
        "16n"
      ).start(0);

      drumSequences.push(sequence);
    });
  },
};

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
  startSequence: () => {
    //console.log('playing');
    transport.start();
    console.log(transport.position);
  },
  pauseSequence: () => {
    //console.log('paused');
    transport.pause();
    console.log(transport.position);
  },
  stopSequence: function () {
    transport.stop();
    drumLogic.setBeatBlock();
    transport.position = "0:0:0";
    beatCounter = 0;
    console.log(transport.position);
  },
  clearPattern: () => {
    const drums = document.getElementById("drums");
    drums.querySelectorAll(".subdivision").forEach((subdivision) => {
      subdivision.classList.remove("active");
    });
  },
  playMetronome: () => {
    if (!metronomeLoop) {
      metronomeLoop = new Tone.Loop((time) => {
        metronomeSource.volume.value = -13;
        if (transport.position.includes("0:0")) {
          metronomeSource.triggerAttackRelease("C5", "16n", time);
        } else {
          metronomeSource.triggerAttackRelease("C4", "16n", time);
        }
      }, "4n");
    }
  
    // Ensure the loop starts and is unmuted
    metronomeLoop.start(0);
    metronomeLoop.mute = false;
  
    drumLogic.handleBeatCount();
  },
  
  
  toggleMetronome: () => {
    isMetronomeOn = !isMetronomeOn;
    transportItems.metronomeButton.classList.toggle("active", isMetronomeOn);
  
    if (isMetronomeOn) {
      if (!metronomeLoop) {
        // Initialize the loop if it doesn't exist
        transportItems.playMetronome();
      } else {
        // Unmute the loop if it exists
        metronomeLoop.mute = false;
      }
    } else {
      if (metronomeLoop) {
        // Mute the loop
        metronomeLoop.mute = true;
      }
    }
  },
  
  
  exportMIDI: function () {
    const track = midi.addTrack();
    const drumMidiNotes = [36, 38, 42, 37];

    midi.header.setTempo(Tone.getTransport().bpm.value);

    drumLanes.forEach((lane, index) => {
      const midiNote = drumMidiNotes[index];
      const beatDividers = lane.querySelectorAll(".subdivision");

      beatDividers.forEach((subdivision, stepIndex) => {
        if (subdivision.classList.contains("active")) {
          const time = stepIndex * Tone.Time("16n").toSeconds();
          track.addNote({
            midi: midiNote,
            time: time,
            duration: Tone.Time("16n").toSeconds(),
            velocity: 0.8,
          });
        }
      });
    });
    this.handleFileNameChanger();
  },
  handleFileNameChanger: async function () {
    const midiData = midi.toArray();

    try {
      const options = {
        suggestedName: "drum-sequence.mid",
        types: [
          {
            description: "MIDI files",
            accept: { "audio/midi": [".mid"] },
          },
        ],
      };

      const handle = await window.showSaveFilePicker(options);
      const writable = await handle.createWritable();
      await writable.write(new Blob([midiData], { type: "audio/midi" }));
      await writable.close();

      console.log("File saved successfully!");
    } catch (error) {
      console.error("Error saving file:", error);
    }
  },
};

transportItems.metronomeButton.addEventListener(
  "click",
  transportItems.toggleMetronome.bind(transportItems)
);

transportItems.playButton.addEventListener(
  "click",
  transportItems.startSequence
);

transportItems.pauseButton.addEventListener(
  "click",
  transportItems.pauseSequence
);
transportItems.stopButton.addEventListener("click", transportItems.stopSequence);

function updateTempoDisplay() {
  transportItems.tempoDisplay.textContent = `${Math.round(
    transport.bpm.value
  )} BPM`;
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

drumLogic.renderGridSubdivisions();


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

transportItems.clearButton.addEventListener(
  "click",
  transportItems.clearPattern
);

drumLabels.forEach((label) => {
  label.addEventListener("transitionend", (e) => {
    if (e.propertyName === "transform") {
      e.target.classList.remove("pressed");
    }
  });
});

document.addEventListener("keydown", domElements.handleKeyDown);
document.addEventListener("keyup", domElements.handleKeyUp);
transportItems.exportButton.addEventListener(
  "click",
  transportItems.exportMIDI.bind(transportItems)
);
domElements.handleDrumLabelClick(drumLabels);
drumLogic.handleGridEventListeners(drumLanes);
drumLogic.addSoundsToGrid(drumLanes);
drumLogic.setBeatBlock();


