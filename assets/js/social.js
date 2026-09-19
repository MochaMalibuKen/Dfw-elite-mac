// Match the Facebook plugin's requested width to its actual frame.
(() => {
  const container = document.getElementById('facebookFeedContainer');
  const frame = document.getElementById('facebookFeed');
  if (!container || !frame) return;
  let width = Number(new URL(frame.src).searchParams.get('width'));
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
  const scheduleResize = () => {
    clearTimeout(timer);
    timer = setTimeout(resize, 250);
  };
  if ('ResizeObserver' in window) {
    new ResizeObserver(scheduleResize).observe(container);
  } else {
    window.addEventListener('resize', scheduleResize);
  }
})();
