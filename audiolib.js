"use strict";

const audioContext = new AudioContext();

function audioFileLoader(fileDirectory) {
  let soundObj = {};
  let playSound = undefined;
  let getSound = new XMLHttpRequest();
  soundObj.fileDirectory = fileDirectory;
  getSound.open("GET", fileDirectory, true);
  getSound.responseType = "arraybuffer";
  getSound.onload = function () {
    audioContext.decodeAudioData(getSound.response, function (buffer) {
      soundObj.soundToPlay = buffer;
    });
  };
  getSound.send();

  soundObj.play = function (time, setStart, setDuration) {
    playSound = audioContext.createBufferSource();
    playSound.buffer = soundObj.soundToPlay;
    playSound.connect(audioContext.destination);
    playSound.start(
      audioContext.currentTime + time || audioContext.currentTime,
      setStart || 0,
      setDuration || soundObj.soundToPlay.duration
    );
  };
  soundObj.stop = function (time) {
    playSound.stop(audioContext.currentTime + time || audioContext.currentTime);
  };
  return soundObj;
}

function audioBatchLoader(obj) {
  for (let prop in obj) {
    obj[prop] = audioFileLoader(obj[prop]);
  }
  return obj;
}
