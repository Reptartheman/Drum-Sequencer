// In roughCanvas.js
import rough from "roughjs";
import * as Tone from "tone";

const transport = Tone.getTransport();
const renderTempoSlider = () => {
  const sliderSvg = document.getElementById("tempoSlider");
  const rc = rough.svg(sliderSvg);
  
  // Draw base line
  const tempoSliderLine = rc.line(10, 20, 150, 20, { 
    strokeWidth: 2,
    roughness: 1.5
  });
  
  // Draw slider knob
  const sliderKnob = rc.rectangle(75, 10, 10, 20, {
    fill: "rgb(162, 23, 226)",
    fillWeight: 2,
    fillStyle: "solid",
    roughness: 1.5
  });

  sliderSvg.appendChild(tempoSliderLine);
  sliderKnob.id = "sliderKnob";
  sliderSvg.appendChild(sliderKnob);

  // Add drag functionality
  let isDragging = false;
  const knobWidth = 10;
  const minX = 10;
  const maxX = 150 - knobWidth;

  const updateSliderPosition = (x) => {
    const boundedX = Math.max(minX, Math.min(maxX, x - knobWidth/2));
    const percentage = (boundedX - minX) / (maxX - minX);
    const bpm = Math.round(20 + (260 - 20) * percentage);
    
    // Update knob position
    sliderKnob.style.transform = `translateX(${boundedX - 75}px)`;
    
    // Update BPM
    document.getElementById("tempoDisplay").textContent = `${bpm} BPM`;
    // Update Tone.js tempo
    transport.bpm.value = bpm;
  };

  sliderSvg.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = sliderSvg.getBoundingClientRect();
    updateSliderPosition(e.clientX - rect.left - 19);
    console.log(`I am clientX: ${e.clientX}
      I am left: ${rect.left}
      `)
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = sliderSvg.getBoundingClientRect();
    updateSliderPosition(e.clientX - rect.left - 19);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
};

renderTempoSlider();

export { renderTempoSlider };
