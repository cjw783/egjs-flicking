const flickingSnap = new Flicking("#flicking-snap-viewport", {
  align: "prev",
  moveType: 'snap',
  threshold: 150
});


const flickingFree = new Flicking("#flicking-free-viewport", {
  align: "prev",
  moveType: 'freeScroll',
});

