const domEvents = {
  click: 'click',

}

const handleGridEventListeners = (arr, domEvent) => {
  arr.forEach((lane, index) => {
    lane.addEventListener(domEvent, (e) => {
      let target = e.target;
      if (target.classList.contains("subdivision")) {
        isDragging = true;
        hasPlayedSound = false;



        target.classList.toggle("active");

        if (!hasPlayedSound && target.classList.contains("active")) {
          soundSources[index].start();
          hasPlayedSound = true;
        }
      }
    });
  });
}

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (target && target.classList.contains("subdivision")) {
      target.classList.add("active");
    }
  }
  console.log(e.type);
});

document.addEventListener("mouseup", (e) => {
  isDragging = false;
  hasPlayedSound = false;
  console.log(e.type);
});



