import rough from "roughjs";


const metronomeButton = document.getElementById('metronomeButton');
const rc = rough.svg(metronomeButton);

metronomeButton.appendChild(rc.rectangle(0, 0, 54, 54, {
  fill: 'rgba(255,0,0,0.2)',
  fillStyle: 'solid',
  roughness: 1.5
}));;

