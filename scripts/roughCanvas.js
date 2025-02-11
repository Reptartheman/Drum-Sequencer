import rough from "roughjs";
import * as Tone from "tone";

const transport = Tone.getTransport();
const renderTempoSlider = () => {
  const sliderSvg = document.getElementById("tempoSlider");
  const rc = rough.svg(sliderSvg);
  
  const tempoSliderLine = rc.line(10, 20, 150, 20, { 
    strokeWidth: 2,
    roughness: 1.5
  });
  
  const sliderKnob = rc.rectangle(75, 10, 10, 20, {
    fill: "rgb(162, 23, 226)",
    fillWeight: 2,
    fillStyle: "solid",
    roughness: 1.5
  });

  sliderSvg.appendChild(tempoSliderLine);
  sliderKnob.id = "sliderKnob";
  sliderSvg.appendChild(sliderKnob);

  let isDragging = false;
  const knobWidth = 10;
  const minX = 10;
  const maxX = 150 - knobWidth;

  const updateSliderPosition = (x) => {
    const boundedX = Math.max(minX, Math.min(maxX, x - knobWidth/2));
    const percentage = (boundedX - minX) / (maxX - minX);
    const bpm = Math.round(20 + (260 - 20) * percentage);
    
    sliderKnob.style.transform = `translateX(${boundedX - 75}px)`;
    
    document.getElementById("tempoDisplay").textContent = `${bpm} BPM`;
    transport.bpm.value = bpm;
  };

  sliderSvg.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = sliderSvg.getBoundingClientRect();
    const rectDrag = rect.x + 1
    updateSliderPosition(e.clientX - rectDrag);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = sliderSvg.getBoundingClientRect();
    const rectDrag = rect.x + 1
    updateSliderPosition(e.clientX - rectDrag);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
};

export { renderTempoSlider };
