"use strict";
const audioContext = new AudioContext();
let futureTickTime, 
    counter = 1,
    metronome,
    metronomeVolume = 1,
    tempo = 90,
    secondsPerBeat = 60 / tempo,
    counterTimeValue = (secondsPerBeat / 4),
    oscFrequency = 100,
    osc;

let sounds = audioBatchLoader({
    kick: './sounds/Kick.wav',
    snare: './sounds/Snare.wav',
    hihat: './sounds/HiHat.wav',
    shaker: './sounds/Shaker.wav'
});


let kickTrack = [1, 9, 11],
    snareTrack = [5,13],
    hiHatTrack = [13, 14, 15, 16],
    shakerTrack = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  16];


function scheduleSound (trackArray, sound, count, time) {
    for (let i = 0; i < trackArray.length; i+= 1) {
        if (count === trackArray[i]) {
            sound.play(time);
        }
    }
}

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

        scheduleSound(kickTrack, sounds.kick, counter, futureTickTime
            - audioContext.currentTime);
                scheduleSound(snareTrack, sounds.snare, counter, futureTickTime
            - audioContext.currentTime);
                scheduleSound(hiHatTrack, sounds.hihat, counter, futureTickTime
            - audioContext.currentTime);
                scheduleSound(shakerTrack, sounds.shaker, counter,
            futureTickTime - audioContext.currentTime);
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