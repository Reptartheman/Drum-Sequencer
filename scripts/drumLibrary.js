import * as Tone from 'tone';
const drumKits = [
  {
    name: 'Kit 1',
    sounds: {
      kick: new Tone.Player("./sounds/kick.wav").toDestination(),
      snare: new Tone.Player("./sounds/snare.wav").toDestination(),
      rim: new Tone.Player("./sounds/hihat.wav").toDestination(),
      hiHat: new Tone.Player("./sounds/rim.wav").toDestination(),
    },
  },
  {
    name: 'Kit 2',
    sounds: {
      kick: new Tone.Player('sounds/kit2/kick.wav').toDestination(),
      snare: new Tone.Player('sounds/kit2/snare.wav').toDestination(),
      rim: new Tone.Player('sounds/kit2/rim.wav').toDestination(),
      hiHat: new Tone.Player('sounds/kit2/hh.wav').toDestination(),
    },
  },
  {
    name: 'Kit 3',
    sounds: {
      kick: new Tone.Player('sounds/kit3/kick.wav').toDestination(),
      snare: new Tone.Player('sounds/kit3/snare.wav').toDestination(),
      rim: new Tone.Player('sounds/kit3/rim.wav').toDestination(),
      hiHat: new Tone.Player('sounds/kit3/hh.wav').toDestination(),
    },
  },
];

export default drumKits;
