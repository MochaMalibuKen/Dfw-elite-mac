// Match the Facebook plugin's requested width to its actual frame.
(() => {
  const container = document.getElementById('facebookFeedContainer');
  const frame = document.getElementById('facebookFeed');
  if (!container || !frame) return;
  let width = 500;
  let timer;
  const resize = () => {
    const nextWidth = Math.min(500, Math.floor(container.clientWidth));
    if (!nextWidth || nextWidth === width) return;
    width = nextWidth;
    const url = new URL(frame.src);
    url.searchParams.set('width', String(width));
    frame.width = String(width);
    frame.src = url.href;
  };
  resize();
  window.addEventListener('resize', () => {
    clearTimeout(timer);
    timer = setTimeout(resize, 250);
  });
})();
