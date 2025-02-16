import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
document.addEventListener("DOMContentLoaded", () => {
  drumKeysHandler();
  handleClickEvents();
  domElements.handleDrumLabelClick(drumLabels);
  drumLogic.renderGridSubdivisions();
  drumLogic.handleGridEventListeners(drumLanes);
  drumLogic.addSoundsToGrid(drumLanes);
  drumLogic.handleBeatCount();
  drumLogic.setBeatBlock();
});

const midi = new Midi();
const draw = Tone.getDraw();
let metronomeLoop;

const createSequencerState = () => {
  const state = {
    transport: Tone.getTransport(),
    bpm: 120,
    isDragging: false,
    hasPlayedSound: false,
    beatCounter: 0,
    isMetronomeOn: false,
    isPlaying: false,
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

const drumKeysHandler = () => {
  let pressedKeys = new Set();

  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    const soundName = keyToDrum[key];
    if (!soundName || pressedKeys.has(key)) return;

    pressedKeys.add(key);
    const drumIndex = ["kick", "snare", "hihat", "rim"].indexOf(soundName);
    const drumLabel = drumLabels[drumIndex];
    drumLabel.classList.add("pressed");
    soundManager.play(soundName);
  };

  const handleKeyUp = (e) => {
    const key = e.key.toLowerCase();
    const soundName = keyToDrum[key];
    if (!soundName) return;

    pressedKeys.delete(key);
    const drumIndex = ["kick", "snare", "hihat", "rim"].indexOf(soundName);
    const drumLabel = drumLabels[drumIndex];

    drumLabel.classList.remove("pressed");
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
};

const sequencerState = createSequencerState();

const createSoundSources = () => {
  const sources = {
    kick: new Tone.Player("/kick.wav").toDestination(),
    snare: new Tone.Player("/snare.wav").toDestination(),
    hihat: new Tone.Player("/hihat.wav").toDestination(),
    rim: new Tone.Player("/rim.wav").toDestination(),
    metronome: new Tone.Synth().toDestination(),
  };

  Object.values(sources).forEach((source) => {
    source.volume.value = -8;
  });

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
  r: "rim",
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
  handleDrumLabelClick: (array) => {
    const soundNames = ["kick", "snare", "hihat", "rim"];
    array.forEach((label, index) => {
      label.addEventListener("click", async (e) => {
        e.preventDefault();
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

    const handleActiveClass = (target) => {
      if (
        target.classList.contains("active") &&
        domElements.sequencerContainer.classList.contains("eraser")
      ) {
        toggleState.removeClass(target, "active");
      }
    };

    const handleSubdivisionClass = (target, index) => {
      if (
        target.classList.contains("subdivision") &&
        domElements.sequencerContainer.classList.contains("pencil")
      ) {
        sequencerState.hasPlayedSound = false;
        toggleState.addClass(target, "active");

        if (
          !sequencerState.hasPlayedSound &&
          target.classList.contains("active")
        ) {
          soundManager.play(soundNames[index]);
          sequencerState.hasPlayedSound = true;
        }
      }
    };

    arr.forEach((lane, index) => {
      lane.addEventListener("mousedown", (e) => {
        const target = e.target;
        sequencerState.updateDragging(true);
        handleActiveClass(target);
        handleSubdivisionClass(target, index);
      });
    });
  },
  handleBeatCount: function () {
    new Tone.Loop((time) => {
      const position = sequencerState.transport.position.split(":");
      const bars = parseInt(position[0], 10);
      const beats = parseInt(position[1], 10);

      sequencerState.beatCounter =
        (bars * 4 + beats) % sequencerState.totalSteps;
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
      domElements.timeLineItems[sequencerState.beatCounter].classList.add(
        "playing"
      );
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
  },
};

const transportItems = {
  metronomeButton: document.getElementById("metronomeBtn"),
  playButton: document.querySelector(".play-container img"),
  pauseButton: document.querySelector(".pause-container img"),
  stopButton: document.querySelector(".stop-container img"),
  incrementTempoButton: document.getElementById("incrementTempo"),
  decrementTempoButton: document.getElementById("decrementTempo"),
  tempoDisplay: document.getElementById("tempoDisplay"),
  clearButton: document.getElementById("clearButton"),
  exportButton: document.getElementById("exportButton"),
  drawBtn: document.getElementById("drawBtn"),
  eraseBtn: document.getElementById("eraseBtn"),
  editStateContainer: document.querySelector(".edit-state-container"),
  tempoSlider: document.getElementById("tempoSlider"),
  startSequence: () => {
    sequencerState.transport.start();
  },
  pauseSequence: () => {
    sequencerState.transport.pause();
  },
  stopSequence: function () {
    sequencerState.transport.stop();
    drumLogic.setBeatBlock();
    sequencerState.transport.position = "0:0:0";
    sequencerState.beatCounter = 0;
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
        const metronomeSource = soundManager.getSource("metronome");
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
    transportItems.metronomeButton.classList.toggle(
      "active",
      sequencerState.isMetronomeOn
    );
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
  togglePlayPause() {
    if (!sequencerState.isPlaying) {
      this.startSequence();
      sequencerState.isPlaying = true;
      console.log(
        "Sequence started via toggle, isPlaying:",
        sequencerState.isPlaying
      );
    } else {
      this.pauseSequence();
      sequencerState.isPlaying = false;
      console.log(
        "Sequence paused via toggle, isPlaying:",
        sequencerState.isPlaying
      );
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
    const blob = new Blob([midiData], { type: "audio/midi" });

    try {
      if (window.showSaveFilePicker) {
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
        await writable.write(blob);
        await writable.close();
      } else {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "drum-sequence.mid";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert(error);
    }
  },
};

const editModeHandler = () => {
  const editors = {
    currentMode: null,
    drawButton: transportItems.drawBtn,
    eraseBtn: transportItems.eraseBtn,

    addClass(element, className) {
      if (!element.classList.contains(className))
        element.classList.add(className);
    },

    removeClass(element, className) {
      if (element.classList.contains(className))
        element.classList.remove(className);
    },

    handleModeToggle(mode) {
      if (mode === "draw") {
        this.addClass(transportItems.drawBtn, "on");
        this.removeClass(transportItems.eraseBtn, "on");
        this.addClass(domElements.sequencerContainer, "pencil");
        this.removeClass(domElements.sequencerContainer, "eraser");
      } else if (mode === "erase") {
        this.addClass(transportItems.eraseBtn, "on");
        this.removeClass(transportItems.drawBtn, "on");
        this.addClass(domElements.sequencerContainer, "eraser");
        this.removeClass(domElements.sequencerContainer, "pencil");
      }
    },

    handleEditStateClick(e) {
      const target = e.target;
      if (target.id === "drawBtn") {
        this.handleModeToggle("draw");
      } else if (target.id === "eraseBtn") {
        this.handleModeToggle("erase");
      }
    },

    handleKeyDown(e) {
      const key = e.key.toLowerCase();

      if (e.keyCode === 32) {
        transportItems.togglePlayPause();
      }

      if (key === "d") {
        this.handleModeToggle("draw");
      } else if (key === "e") {
        this.handleModeToggle("erase");
      }
    },

    handleMouseDown(e) {
      if (e.shiftKey) {
        sequencerState.isDragging = true;
        const target = e.target;
        if (domElements.sequencerContainer.classList.contains("pencil")) {
          this.currentMode = "draw";
          toggleState.addClass(target, "active");
        } else if (
          domElements.sequencerContainer.classList.contains("eraser")
        ) {
          this.currentMode = "erase";
          toggleState.removeClass(target, "active");
        }
      }
    },

    handleMouseMove(e) {
      if (sequencerState.isDragging && e.shiftKey) {
        const target = e.target;
        if (this.currentMode === "draw") {
          toggleState.addClass(target, "active");
        } else if (this.currentMode === "erase") {
          toggleState.removeClass(target, "active");
        }
      }
    },

    handleModalClick(e) {
      if (e.target.id === "yesBtn") {
        transportItems.clearPattern();
        setTimeout(() => {
          domElements.closeModal();
        }, 50);
      } else {
        domElements.closeModal();
      }
    },
  };

  return editors;
};

const toggleState = editModeHandler();

const handleClickEvents = () => {
  const buttonConfig = {
    playBtn: transportItems.startSequence,
    pauseBtn: transportItems.pauseSequence,
    stopBtn: transportItems.stopSequence,
    metronomeBtn: transportItems.toggleMetronome.bind(transportItems),
    clearButton: domElements.openModal,
    exportButton: transportItems.exportMIDI.bind(transportItems),
  };

  Object.entries(buttonConfig).forEach(([id, handler]) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener("click", handler);
    }
  });
};

transportItems.editStateContainer.addEventListener("click", (e) => {
  toggleState.handleEditStateClick(e);
});

document.addEventListener("keydown", (e) => {
  toggleState.handleKeyDown(e);
});

domElements.modalBtnContainer.addEventListener("click", (e) => {
  toggleState.handleModalClick(e);
});

const handleMouseUp = () => {
  sequencerState.isDragging = false;
  toggleState.currentMode = null;
};

domElements.sequencerContainer.addEventListener(
  "mousedown",
  toggleState.handleMouseDown
);
domElements.sequencerContainer.addEventListener(
  "mousemove",
  toggleState.handleMouseMove
);
document.addEventListener("mouseup", handleMouseUp);

const updateBPM = (newBPM) => {
  sequencerState.updateBPM(newBPM);
  transportItems.tempoSlider.value = newBPM;
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
      transportItems.tempoSlider.value = Math.round(sequencerState.transport.bpm.value);
      updateTempoDisplay();
    });
  });

  transportItems.decrementTempoButton.addEventListener("mousedown", () => {
    startAdjustingTempo(() => {
      if (sequencerState.transport.bpm.value > 1) {
        sequencerState.transport.bpm.value -= 1;
        transportItems.tempoSlider.value = Math.round(sequencerState.transport.bpm.value);
        updateTempoDisplay();
      }
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

  transportItems.decrementTempoButton.addEventListener(
    "mouseup",
    stopAdjustingTempo
  );
  transportItems.decrementTempoButton.addEventListener(
    "mouseleave",
    stopAdjustingTempo
  );

  transportItems.tempoSlider.addEventListener("change", (e) => {
    updateBPM(parseInt(e.target.value));
  });

