// Manual navigation keeps visitors in control of playback and motion.
(() => {
  const track = document.querySelector('#catering-video-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.catering-video-card')];
  const videos = cards.map(card => card.querySelector('video'));
  const controls = document.querySelector('.catering-gallery-controls');
  const arrows = [...controls.querySelectorAll('button')];
  const count = controls.querySelector('.catering-gallery-count');
  let active = 0;
  const center = card => card.getBoundingClientRect().left + card.clientWidth / 2;
  function update() {
    const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
    active = cards.reduce((best, card, index) =>
      Math.abs(center(card) - middle) < Math.abs(center(cards[best]) - middle) ? index : best, 0);
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
    arrows[0].disabled = active === 0;
    arrows[1].disabled = active === cards.length - 1;
    videos.forEach((video, index) => { if (index !== active) video.pause(); });
  }
  function go(index) {
    const target = Math.max(0, Math.min(cards.length - 1, index));
    const middle = track.getBoundingClientRect().left + track.clientWidth / 2;
    track.scrollBy({ left: center(cards[target]) - middle,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  arrows.forEach(button => button.addEventListener('click', () => go(active + Number(button.dataset.direction))));
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      go(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let timer;
  track.addEventListener('scroll', () => { clearTimeout(timer); timer = setTimeout(update, 100); }, { passive: true });
  window.addEventListener('resize', update);
  videos.forEach(video => video.addEventListener('play', () => {
    videos.forEach(other => { if (other !== video) other.pause(); });
  }));
  controls.hidden = false;
  update();
})();
