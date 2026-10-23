/* Which view of the page is showing (the title, the game), and the UI's redraw clock. */
let view = 'title',
  uiT = 0;
function show(v) {
  view = v;
  document.querySelectorAll('.view').forEach(e => {
    e.hidden = e.id !== 'v-' + v;
  });
  try {
    window.scrollTo(0, 0);
  } catch (e) {}
}

function set_uiT(v) {
  return (uiT = v);
}
export {set_uiT, show, uiT, view};
