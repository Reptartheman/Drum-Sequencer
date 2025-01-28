const createSoundSources = () => {
  // First, create an object that holds all our sound sources
  const sources = {
      kick: new Tone.Player("./sounds/kick.wav").toDestination(),
      snare: new Tone.Player("./sounds/snare.wav").toDestination(),
      hihat: new Tone.Player("./sounds/hihat.wav").toDestination(),
      rim: new Tone.Player("./sounds/rim.wav").toDestination(),
      metronome: new Tone.Synth().toDestination()
  };
  
  // Return methods to interact with our sounds
  return {
      // Method to play any sound by name
      play(soundName) {
          sources[soundName]?.start();
      },
      
      // Method to get a specific sound source if needed
      getSource(soundName) {
          return sources[soundName];
      },
      
      // Get all sources as an array (for compatibility with existing code)
      getAllSources() {
          return [
              sources.kick,
              sources.snare,
              sources.hihat,
              sources.rim
          ];
      }
  };
};

// Initialize our sound sources
const soundManager = createSoundSources();



