"use strict";
/* CODE THAT WORKS BUT CAUSES PROBLEMS */



/* let sounds = audioBatchLoader({
    kick:"sounds/kick.mp3",
    snare:"sounds/snare.mp3",
    hihat:"sounds/hihat.mp3"
});

let tempo = 120; //_____BPM (beats per minute)
let eighthNoteTime = (60 / tempo) / 2;
function playDrums() {
  // Play 4 bars of the following:
  for (let bar = 0; bar < 4; bar++) {
    let time = bar * 8 * eighthNoteTime;
    // Play the bass (kick) drum on beats 1, 5
    sounds.kick.play(time);
    sounds.kick.play(time + 4 * eighthNoteTime);
    // Play the snare drum on beats 3, 7
    sounds.snare.play(time + 2 * eighthNoteTime);
    sounds.snare.play(time + 6 * eighthNoteTime);
    // Play the hi-hat every eighth note.
    for (let i = 0; i < 8; ++i) {
      sounds.hihat.play(time + i * eighthNoteTime);
    }
  }
}
window.onclick = function(event) {
    playDrums();
} */

//  {#de2,3}
/* The block above works but causes a problem because, while it will play, "If you wanted to change the tempo relationship of these sounds in the middle of the four bars, you can't.
    - This is true with any scheduled event in JS, and goes beyond changing tempo.
*/



/* let sound = audioBatchLoader({
    kick:"sounds/kick.mp3",
    snare:"sounds/snare.mp3",
    hihat:"sounds/hihat.mp3"
});

let speed = 120, //_____BPM (beats per minute)
    milliseconds = 1000,
    eighthNotes = ((60 * milliseconds) / tempo) / 2,
    counter = 1;

function playSequence(){
    window.setInterval(function() {
          if (counter === 8) {
            counter = 1;
          } else {
            counter += 1;
          }
          if (counter) {
            sounds.hihat.play();
          }
          if (counter === 3 || counter === 7) {
            sounds.snare.play();
          }
          if (counter === 1 || counter === 5) {
            sounds.kick.play();
          }
        }, eighthNoteTime);
}

window.onclick = function(event) {
    playSequence();
} */

/* The block above contains the setInterval function and the setTimeout function. 
    - "Uses the setInterval to increment a counter at a specified BPM and depending on the counter value, a particular drum sound is played. This creates a rhythmic pattern."
    - Those two functions have 'timings that are imprecise and unstable...
        * The smallest unit of time available is 1 millisecond, which is not precise enough for sample level values. I.E: 44.1 or 48 kHz.
        * These methods can also be interrupted by browers activity such as page rendering and redraws.

*/



/* let audioContext = new AudioContext();
let futureTickTime = audioContext.currentTime;
function scheduler() {
  if (futureTickTime < audioContext.currentTime + 0.1) {
    futureTickTime += 0.5; */ /*_can be any time value. 0.5 happens to
be a quarter note at 120 bpm */
 /*    console.log(futureTickTime);
  }
  window.setTimeout(scheduler, 0);
}
window.onclick = function(){
   audioContext = new AudioContext();
   futureTickTime = audioContext.currentTime;
   scheduler();
} */

/* THIS WORKS BECAUSE...
    * the setTimeout function loops recursively, and when an interation happens the condition is checked...
        - if futureTickTime is within a tenth of a second of the audioContext.currentTime then the futureTickTime variable is incremented. 
    * In Web Audio API time that is considered a half of a second...
        - futureTickTime will remain at the same value until the audioContext.currentTime catches up.    
*/


/* let audioContext
let futureTickTime;
let counter = 1;
function scheduler() {
    if (futureTickTime < audioContext.currentTime + 0.1) {
        futureTickTime += 0.5; /*_can be any time
value. 0.5 happens to be a quarter note at 120 bpm */
/*         console.log("This is beat: " + counter);
        counter += 1;
        if (counter > 4) {
            counter = 1;
        }
   }
   window.setTimeout(scheduler, 0);
}

window.onclick = function () {
    audioContext = new AudioContext();
    futureTickTime = audioContext.currentTime;
    scheduler();
}  */


/* THE CODE BELOW BUILDS ON THE PREVIOUS CODE */



let audioContext,
    futureTickTime,
    counter = 1,
    metronome,
    tempo = 90,
    secondsPerBeat = 60 / tempo,
    counterTimeValue = (secondsPerBeat / 4),
    oscFrequency = 100,
    osc;

    function playMetronome(time) {
        let osc = audioContext.createOscillator();
        if (counter === 1) {
            oscFrequency = 400;
        } else {
            oscFrequency = 100;
        }
        osc.connect(audioContext.destination);
        osc.frequency.value = oscFrequency;
        osc.start(time);
        osc.stop(time + 0.1);
    }


    function scheduler() {
        if (futureTickTime < audioContext.currentTime + 0.1) {
            playMetronome(futureTickTime);
            futureTickTime += counterTimeValue;
            console.log("This is beat: " + counter);
    
            counter += 1;
            if (counter > 16) {
                counter = 1;
            }
        }
        window.setTimeout(scheduler, 0);
    
    
    
    }
        
    window.onclick = function () {
        audioContext = new AudioContext();
        futureTickTime = audioContext.currentTime;
        osc = audioContext.createOscillator();
        metronome = audioContext.createGain();
        scheduler();
    
    
    }