import * as Tone from "tone";
import { Midi } from '@tonejs/midi'
import drumKits from "./drumLibrary.js";

const transport = Tone.getTransport();
const midi = new Midi();
const metronome = new Tone.Synth().toDestination();
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
let currentStep = 0;
const totalSteps = 32;

const keyToDrum = {
  z: 0, // Kick
  s: 1, // Snare
  h: 2, // Hi-hat
  d: 3  // Rim
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
  }
}
const drumLabels = [domElements.kickLabel, domElements.snareLabel, domElements.hiHatLabel, domElements.rimLabel];
const drumLanes = [domElements.kickLane, domElements.snareLane, domElements.hiHatLane, domElements.rimLane];

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
  renderGridSubdivisions: function() {
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
    }
  )},
  highlightStep: function(arr, step) {
    console.log(`highlighting`);
    arr.forEach((lane) => {
      const subdivisions = lane.children;
      Array.from(subdivisions).forEach((subdivision) =>
        subdivision.classList.remove("playing")
      );
      if (subdivisions[step]) {
        subdivisions[step].classList.add("playing");
      }
    });
  },
  addSoundsToGrid: function(arr) {
    let drumSequences = [];
    arr.forEach((lane, index) => {
      const soundSource = soundSources[index];

      const sequence = new Tone.Sequence(
        (time, step) => {
          const subdivision = lane.children[step];
          if (subdivision.classList.contains("active")) {
            soundSource.start(time);
          }
          if (index === 0) {
            currentStep = step;
            this.highlightStep(drumLanes, currentStep)
          }
        },
        Array.from({ length: totalSteps }, (_, i) => i),
        "16n"
      ).start(0);
    
      drumSequences.push(sequence);
    });
    
  }
}

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
      transport.start();
  },
pauseSequence: () => {
  transport.pause();
},
stopSequence: function() {
  transport.stop();
  beatCounter = 0;
  transport.position = "0:0:0";
  currentStep = 0;
  drumLogic.highlightStep(drumLanes, currentStep);
},
  clearPattern: () => {
      const drums = document.getElementById("drums");
      drums.querySelectorAll(".subdivision").forEach((subdivision) => {
        subdivision.classList.remove("active");
      });
  },
  metronomeScheduler: function() {
    return new Tone.Loop((time) => {
      console.log(`I am scheduler`);
      if (isMetronomeOn) this.playMetronome(time);
    }, "4n");
  },
  toggleMetronomActive: function() {
    console.log(`I am toggle`);
    isMetronomeOn = !isMetronomeOn;
    transportItems.metronomeButton.classList.toggle("active", isMetronomeOn);
    this.metronomeScheduler();
},
  playMetronome: (time) => {
    console.log(`I am metronome`);
    metronome.volume.value = -13;
    const note = beatCounter % 4 === 0 ? "C5" : "C4";
    metronome.triggerAttackRelease(note, "16n", time);
    beatCounter++;
  },
  exportMIDI: function() {
    const track = midi.addTrack();
    const drumMidiNotes = [36, 38, 42, 37];

    midi.header.setTempo(Tone.getTransport().bpm.value);

    drumLanes.forEach((lane, index) => {
        const midiNote = drumMidiNotes[index];
        const subdivisions = lane.querySelectorAll(".subdivision");

        subdivisions.forEach((subdivision, stepIndex) => {
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
  handleFileNameChanger: async function() {
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
  }

}



transportItems.metronomeButton.addEventListener("click", transportItems.toggleMetronomActive.bind(transportItems));

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





drumLogic.renderGridSubdivisions();


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


transportItems.clearButton.addEventListener("click", transportItems.clearPattern);

drumLabels.forEach((label) => {
  label.addEventListener("transitionend", (e) => {
      if (e.propertyName === 'transform') {
          e.target.classList.remove('pressed');
      }
  });
});





document.addEventListener("keydown", domElements.handleKeyDown);
document.addEventListener("keyup", domElements.handleKeyUp);
transportItems.exportButton.addEventListener("click", transportItems.exportMIDI.bind(transportItems));
domElements.handleDrumLabelClick(drumLabels);
drumLogic.handleGridEventListeners(drumLanes);
drumLogic.addSoundsToGrid(drumLanes);

