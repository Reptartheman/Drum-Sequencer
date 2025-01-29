import rough from "roughjs";

export const setMetronomeState = () => {
  const svg = document.querySelector('svg');
  const rc = rough.svg(svg);

  const fill = svg.appendChild(
    rc.rectangle(0, 0, 54, 54, {
    fill: 'rgba(255,0,0,0.2)',
    fillStyle: 'solid',
    roughness: 1.5,
  })
);

};


/* 
Look into pre-loading with script tags
Look into deferring scripts or using DOMContent loaded
Lazy loading???
*/
