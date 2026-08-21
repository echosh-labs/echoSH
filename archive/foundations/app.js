document.addEventListener('DOMContentLoaded', () => {
  const titleEl = document.getElementById('story-title');
  const subtitleEl = document.getElementById('story-subtitle');
  const wrapperEl = document.getElementById('slides-wrapper');
  const dotsEl = document.getElementById('dots-container');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  
  let scenes = [];
  let currentIdx = 0;

  async function loadStory() {
    try {
      const response = await fetch('scenes.json');
      if (!response.ok) {
        throw new Error('Failed to load story scenes metadata');
      }
      scenes = await response.json();
      if (scenes.length === 0) {
        throw new Error('No scenes found in metadata');
      }
      renderStory();
    } catch (err) {
      console.error(err);
      showError(err.message);
    }
  }

  function showError(msg) {
    wrapperEl.innerHTML = `
      <div class="slide active">
        <div class="image-container" style="display: flex; align-items: center; justify-content: center; background: #1F121E;">
          <div style="text-align: center; color: var(--accent-peach);">
            <div style="font-size: 1.5rem; margin-bottom: 8px; font-family: var(--font-serif);">Unable to Load Story</div>
            <div>${msg}</div>
            <div style="margin-top: 16px; font-size: 0.85rem; opacity: 0.7;">Make sure this page is served via a local web server (e.g. <code>python -m http.server</code>).</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStory() {
    wrapperEl.innerHTML = '';
    dotsEl.innerHTML = '';
    
    scenes.forEach((scene, index) => {
      // Create slide element
      const slide = document.createElement('div');
      slide.className = `slide ${index === 0 ? 'active' : ''}`;
      
      const imgPath = `assets/scene${scene.id}.png`;
      
      slide.innerHTML = `
        <div class="image-container">
          <img src="${imgPath}" alt="${scene.title}" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800';">
        </div>
        <div class="text-container">
          <div class="scene-index">Scene ${scene.id} of ${scenes.length}</div>
          <h2 class="scene-title">${scene.title}</h2>
          <p class="scene-narrative">${scene.narrative}</p>
        </div>
      `;
      wrapperEl.appendChild(slide);
      
      // Create dot element
      const dot = document.createElement('div');
      dot.className = `dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(index));
      dotsEl.appendChild(dot);
    });
    
    updateControls();
  }

  function goToSlide(index) {
    if (index < 0 || index >= scenes.length) return;
    
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    slides[currentIdx].classList.remove('active');
    dots[currentIdx].classList.remove('active');
    
    currentIdx = index;
    
    slides[currentIdx].classList.add('active');
    dots[currentIdx].classList.add('active');
    
    updateControls();
  }

  function updateControls() {
    prevBtn.disabled = currentIdx === 0;
    nextBtn.disabled = currentIdx === scenes.length - 1;
  }

  prevBtn.addEventListener('click', () => goToSlide(currentIdx - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIdx + 1));
  
  // Arrow key navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      goToSlide(currentIdx - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentIdx + 1);
    }
  });

  loadStory();
});
