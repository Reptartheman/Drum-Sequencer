// In roughCanvas.js
import rough from "roughjs";

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
};

renderTempoSlider();

export { renderTempoSlider };
