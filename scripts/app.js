import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import rough from "roughjs";




const midi = new Midi();
const draw = Tone.getDraw();
const tempoSlider = document.getElementById("tempoSlider");
let metronomeLoop;

const createSequencerState = () => {
  const state = {
    transport: Tone.getTransport(),
    bpm: 120,
    isDragging: false,
    hasPlayedSound: false,
    beatCounter: 0,
    isMetronomeOn: false,
    totalSteps: 32,

    updateBPM(newBPM) {
      this.bpm = newBPM;
      this.transport.bpm.value = newBPM;
      return this;
    },

    updateDragging(dragging) {
      this.isDragging = dragging;
      return this;
    },

    updateBeatCount(count) {
      this.beatCounter = count % this.totalSteps;
      return this;
    },
  };
  state.transport.loop = true;
  state.transport.loopStart = 0;
  state.transport.loopEnd = "2:0:0";

  return state;
};

const sequencerState = createSequencerState();

const createSoundSources = () => {
  const sources = {
    kick: new Tone.Player("./sounds/kick.wav").toDestination(),
    snare: new Tone.Player("./sounds/snare.wav").toDestination(),
    hihat: new Tone.Player("./sounds/hihat.wav").toDestination(),
    rim: new Tone.Player("./sounds/rim.wav").toDestination(),
    metronome: new Tone.Synth().toDestination(),
  };

  return {
    play(soundName) {
      sources[soundName]?.start();
    },

    getSource(soundName) {
      return sources[soundName];
    },

    getAllSources() {
      return [sources.kick, sources.snare, sources.hihat, sources.rim];
    },
  };
};

const keyToDrum = {
  z: "kick",
  s: "snare",
  h: "hihat",
  d: "rim"
};

const soundManager = createSoundSources();


const domElements = {
  drumLabelContainer: document.querySelectorAll(".drum-label-container"),
  sequencerContainer: document.getElementById("drums"),
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
  modal: document.querySelector("wired-dialog"),
  overlay: document.querySelector(".overlay"),
  modalBtnContainer: document.getElementById("modalBtnContainer"),
  modalYes: document.getElementById("yesBtn"),
  modalNo: document.getElementById("noBtn"),
  events: ["click", "mousedown", "mouseup", "mousemove", "keypress"],
  handleKeyUp: (e) => {
    const key = e.key.toLowerCase();
    const drumIndex = keyToDrum[key];
    if (drumIndex === undefined) return;

    const drumLabel = drumLabels[drumIndex];
    drumLabel.classList.remove("pressed");
  },
  handleKeyDown: async (e) => {
    const key = e.key.toLowerCase();
    const soundName = keyToDrum[key];
    if (!soundName) return;

    const drumIndex = ["kick", "snare", "hihat", "rim"].indexOf(soundName);
    const drumLabel = drumLabels[drumIndex];
    drumLabel.classList.add("pressed");

    await Tone.start();
    soundManager.play(soundName);
},
handleDrumLabelClick: (array) => {
  const soundNames = ["kick", "snare", "hihat", "rim"];
  array.forEach((label, index) => {
      label.addEventListener("click", async (e) => {
          e.preventDefault();
          await Tone.start();
          soundManager.play(soundNames[index]);
      });
  });
},
  openModal: () => {
    domElements.modal.open = true;
  },
  closeModal: () => {
    domElements.modal.open = false;
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
    const soundNames = ["kick", "snare", "hihat", "rim"];
    arr.forEach((lane, index) => {
        lane.addEventListener("mousedown", (e) => {
            const target = e.target;
            if (target.classList.contains("subdivision")) {
                sequencerState.updateDragging(true);
                sequencerState.hasPlayedSound = false;
                target.classList.toggle("active");
                    
                if (!sequencerState.hasPlayedSound && target.classList.contains("active")) {
                    soundManager.play(soundNames[index]);
                    sequencerState.hasPlayedSound = true;
                }
            }
        });
    });
},
  handleBeatCount: function () {
    new Tone.Loop((time) => {
      const position = sequencerState.transport.position.split(":");
      const bars = parseInt(position[0], 10);
      const beats = parseInt(position[1], 10);

      sequencerState.beatCounter = (bars * 4 + beats) % sequencerState.totalSteps;
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

    if (sequencerState.beatCounter < domElements.timeLineItems.length) {
      domElements.timeLineItems[sequencerState.beatCounter].classList.add("playing");
    }
  },
  setBeatBlock: function () {
    domElements.timeLineItems.forEach((item) => {
      item.classList.remove("playing");
    });

    domElements.timeLineItems[0].classList.add("playing");

    sequencerState.beatCounter = 0;
  },

  addSoundsToGrid: function (arr) {
    let drumSequences = [];
    const soundNames = ["kick", "snare", "hihat", "rim"];
    
    arr.forEach((lane, index) => {
        const soundName = soundNames[index];
        const sequence = new Tone.Sequence(
            (time, step) => {
                const subdivision = lane.children[step];
                if (subdivision.classList.contains("active")) {
                    soundManager.getSource(soundName).start(time);
                }
            },
            Array.from({ length: sequencerState.totalSteps }, (_, i) => i),
            "16n"
        ).start(0);

        drumSequences.push(sequence);
    });
}
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
    sequencerState.transport.start();
    console.log(sequencerState.transport.position);
  },
  pauseSequence: () => {
    sequencerState.transport.pause();
    console.log(sequencerState.transport.position);
  },
  stopSequence: function () {
    sequencerState.transport.stop();
    drumLogic.setBeatBlock();
    sequencerState.transport.position = "0:0:0";
    sequencerState.beatCounter = 0;
    console.log(sequencerState.transport.position);
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
        const metronomeSource = soundManager.getSource('metronome');
        metronomeSource.volume.value = -13;
        if (sequencerState.transport.position.includes("0:0")) {
          metronomeSource.triggerAttackRelease("C5", "16n", time);
        } else {
          metronomeSource.triggerAttackRelease("C4", "16n", time);
        }
      }, "4n");
    }

    metronomeLoop.start(0);
    metronomeLoop.mute = false;
  },

  toggleMetronome: () => {
    sequencerState.isMetronomeOn = !sequencerState.isMetronomeOn;
    transportItems.metronomeButton.classList.toggle("active", sequencerState.isMetronomeOn);

    if (sequencerState.isMetronomeOn) {
      if (!metronomeLoop) {
        transportItems.playMetronome();
      } else {
        metronomeLoop.mute = false;
      }
    } else {
      if (metronomeLoop) {
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
transportItems.stopButton.addEventListener(
  "click",
  transportItems.stopSequence
);

domElements.sequencerContainer.addEventListener("mousemove", (e) => {
  console.log(e.type);

  if (sequencerState.isDragging) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains("subdivision")) {
      target.classList.add("active");
    }
  }
});

domElements.sequencerContainer.addEventListener("mouseup", (e) => {
  console.log(e.type);

  sequencerState.isDragging = false;
  sequencerState.hasPlayedSound = false;
});

transportItems.clearButton.addEventListener("click", domElements.openModal);

domElements.modalBtnContainer.addEventListener("click", (e) => {
  if (e.target.id === "yesBtn") {
    transportItems.clearPattern();
    setTimeout(() => {
      domElements.closeModal();
    }, 50);
  } else {
    domElements.closeModal();
  }
});

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

const updateBPM = (newBPM) => {
  sequencerState.updateBPM(newBPM);
  tempoSlider.value = newBPM;
  updateTempoDisplay();
};

function updateTempoDisplay() {
  transportItems.tempoDisplay.textContent = `${Math.round(
    sequencerState.transport.bpm.value
  )} BPM`;
}

let intervalId;

const startAdjustingTempo = (adjustmentFunction) => {
  adjustmentFunction();
  intervalId = setInterval(adjustmentFunction, 100);
};

const stopAdjustingTempo = () => {
  clearInterval(intervalId);
};

transportItems.incrementTempoButton.addEventListener("mousedown", () => {
  startAdjustingTempo(() => {
    sequencerState.transport.bpm.value += 1;
    tempoSlider.value = Math.round(sequencerState.transport.bpm.value);
    updateTempoDisplay();
  });
});

transportItems.incrementTempoButton.addEventListener(
  "mouseup",
  stopAdjustingTempo
);
transportItems.incrementTempoButton.addEventListener(
  "mouseleave",
  stopAdjustingTempo
);

transportItems.decrementTempoButton.addEventListener("mousedown", () => {
  startAdjustingTempo(() => {
    if (sequencerState.transport.bpm.value > 1) {
      sequencerState.transport.bpm.value -= 1;
      tempoSlider.value = Math.round(sequencerState.transport.bpm.value);
      updateTempoDisplay();
    }
  });
});

transportItems.decrementTempoButton.addEventListener(
  "mouseup",
  stopAdjustingTempo
);
transportItems.decrementTempoButton.addEventListener(
  "mouseleave",
  stopAdjustingTempo
);

tempoSlider.addEventListener("change", (e) => {
  updateBPM(parseInt(e.target.value));
});

domElements.handleDrumLabelClick(drumLabels);
drumLogic.renderGridSubdivisions();
drumLogic.handleGridEventListeners(drumLanes);
drumLogic.addSoundsToGrid(drumLanes);
drumLogic.handleBeatCount();
drumLogic.setBeatBlock();
