"use strict";
const audioContext = new AudioContext();
let futureTickTime, 
    counter = 1,
    metronome,
    tempo = 90,
    secondsPerBeat = 60 / tempo,
    counterTimeValue = (secondsPerBeat / 4),
    oscFrequency = 100,
    osc;

function playMetronome(time, playing) {
    if (playing) {
        osc = audioContext.createOscillator();
        osc.connect(audioContext.destination);
            if (counter === 1) {
                osc.frequency.value = 500;
            } else {
                osc.frequency.value = 300;
            }
        
        osc.connect(audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    }
}

function playTick() {
  console.log("This is 16th note: " + counter);
  counter += 1;
  futureTickTime += counterTimeValue;
  if (counter > 16) {
    counter = 1;
  }
}

function scheduler() {
    if (futureTickTime < audioContext.currentTime + 0.1) {
        playMetronome(futureTickTime, true);
        playTick();
    }
}



window.setTimeout(scheduler, 0);

window.onclick = function() {
  futureTickTime = audioContext.currentTime;
  osc = audioContext.createOscillator();
  metronome = audioContext.createGain();
  scheduler();
}