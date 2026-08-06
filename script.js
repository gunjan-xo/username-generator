(function(){
  const nameInput = document.getElementById('nameInput');
  const stampBtn = document.getElementById('stampBtn');
  const moreBtn = document.getElementById('moreBtn');
  const moreRow = document.getElementById('moreRow');
  const grid = document.getElementById('grid');
  const hint = document.getElementById('hint');
  const countLabel = document.getElementById('countLabel');
  const chips = document.querySelectorAll('.style-chip');

  const accents = ['#c9891a', '#0f8f80', '#d1553d', '#5b63d1', '#c9891a', '#0f8f80'];

  const gamerWords = ['void','shadow','nova','ember','pulse','ronin','frost','ghost','blaze','drift','static','echo','raven','cipher','glitch','vortex','feral','omega','rogue','zenith'];
  const techyWords = ['dev','byte','pixel','node','stack','script','cloud','kernel','vector','proto','sync','logic','cache','build','loop'];
  const minimalSuffixes = ['co','hq','lab','room','desk','studio','space'];
  const cleanConnectors = ['.', '_', ''];

  let seenThisSession = new Set();
  let currentName = '';
  let currentStyle = 'all';
  let batchIndex = 0;

  function cleanName(raw){
    return raw.trim().replace(/[^a-zA-Z\s'-]/g, '');
  }

  function splitName(raw){
    const parts = cleanName(raw).split(/\s+/).filter(Boolean);
    return parts.length ? parts : ['user'];
  }

  function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function randInt(min, max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function titleCase(s){ return s.charAt(0).toUpperCase()+s.slice(1).toLowerCase(); }
  function lower(s){ return s.toLowerCase(); }

  function leet(s){
    return s.replace(/a/gi,'4').replace(/e/gi,'3').replace(/i/gi,'1').replace(/o/gi,'0');
  }

  // --- generators for each style, each returns {name, tag} ---
  function genClean(first, last){
    const options = [
      () => ({ name: lower(first) + rand(cleanConnectors) + lower(last), tag: 'first + last' }),
      () => ({ name: titleCase(first) + last.charAt(0).toUpperCase(), tag: 'name + initial' }),
      () => ({ name: lower(first) + randInt(1,999), tag: 'first + number' }),
      () => ({ name: lower(first.slice(0,1)+last), tag: 'initial + last' }),
      () => ({ name: titleCase(first) + '.' + titleCase(last), tag: 'formal' }),
      () => ({ name: lower(first) + '' + lower(last) + randInt(10,99), tag: 'full + number' }),
    ];
    return rand(options)();
  }

  function genGamer(first, last){
    const w = rand(gamerWords);
    const options = [
      () => ({ name: titleCase(w) + first.slice(0,Math.min(4,first.length)) , tag: 'gamer tag' }),
      () => ({ name: lower(first) + '_' + w + randInt(1,99), tag: 'gamer tag' }),
      () => ({ name: 'x' + titleCase(w) + titleCase(first.slice(0,3)) + 'x', tag: 'gamer tag' }),
      () => ({ name: titleCase(w) + randInt(10,999), tag: 'gamer tag' }),
      () => ({ name: leet(first) + w, tag: 'leet gamer tag' }),
    ];
    return rand(options)();
  }

  function genMinimal(first, last){
    const options = [
      () => ({ name: lower(first), tag: 'just first name' }),
      () => ({ name: lower(first.slice(0,3)+last.slice(0,3)), tag: 'short blend' }),
      () => ({ name: lower(first) + '.' + rand(minimalSuffixes), tag: 'minimal + suffix' }),
      () => ({ name: lower(first.charAt(0)+last), tag: 'compact' }),
      () => ({ name: lower(first) + '__', tag: 'clean underscore' }),
    ];
    return rand(options)();
  }

  function genTechy(first, last){
    const w = rand(techyWords);
    const options = [
      () => ({ name: lower(first) + '.' + w, tag: 'techy handle' }),
      () => ({ name: w + '_' + lower(last), tag: 'techy handle' }),
      () => ({ name: lower(first) + w + randInt(1,99), tag: 'techy handle' }),
      () => ({ name: 'dev.' + lower(first), tag: 'techy handle' }),
      () => ({ name: lower(first) + '0x' + randInt(1,99), tag: 'hex-style' }),
    ];
    return rand(options)();
  }

  const styleMap = { clean: genClean, gamer: genGamer, minimal: genMinimal, techy: genTechy };

  function generateOne(first, last, style){
    const pool = style === 'all' ? Object.keys(styleMap) : [style];
    const chosenStyle = rand(pool);
    return { ...styleMap[chosenStyle](first, last), style: chosenStyle };
  }

  function generateBatch(raw, style, count){
    const parts = splitName(raw);
    const first = parts[0] || 'user';
    const last = parts[1] || parts[0] || 'name';
    const results = [];
    let attempts = 0;
    while (results.length < count && attempts < count * 20){
      attempts++;
      const r = generateOne(first, last, style);
      const key = r.name.toLowerCase();
      if (seenThisSession.has(key)) continue;
      seenThisSession.add(key);
      results.push(r);
    }
    // fallback fill if we ran out of unique combos
    while (results.length < count){
      const r = generateOne(first, last, style);
      r.name = r.name + randInt(100,999);
      results.push(r);
    }
    return results;
  }

  function styleLabel(s){
    return { clean:'Clean', gamer:'Gamer', minimal:'Minimal', techy:'Techy' }[s] || s;
  }

  function renderBatch(items, append){
    if (!append) grid.innerHTML = '';
    items.forEach((item, i) => {
      const accent = accents[(batchIndex + i) % accents.length];
      const el = document.createElement('div');
      el.className = 'badge';
      el.style.setProperty('--badge-accent', accent);
      el.style.animationDelay = (i * 0.05) + 's';
      el.innerHTML = `
        <div class="dot">${item.name.charAt(0).toUpperCase()}</div>
        <div class="badge-name">
          <div class="uname">${item.name}</div>
          <div class="tag">${styleLabel(item.style)} · ${item.tag}</div>
        </div>
        <button class="copy-btn" title="Copy">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      `;
      const btn = el.querySelector('.copy-btn');
      btn.addEventListener('click', () => {
        navigator.clipboard.writeText(item.name).then(() => {
          btn.classList.add('copied');
          btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          }, 1400);
        });
      });
      grid.appendChild(el);
    });
    batchIndex += items.length;
    countLabel.textContent = grid.children.length + ' generated';
  }

  function runGenerate(){
    const raw = nameInput.value;
    if (!cleanName(raw)){
      hint.textContent = 'Type a name to get started.';
      nameInput.focus();
      return;
    }
    currentName = raw;
    seenThisSession = new Set();
    batchIndex = 0;
    hint.textContent = '';
    const items = generateBatch(currentName, currentStyle, 5);
    renderBatch(items, false);
    moreRow.style.display = 'flex';
  }

  function runMore(){
    if (!currentName) return runGenerate();
    moreBtn.classList.add('spin');
    setTimeout(() => moreBtn.classList.remove('spin'), 400);
    const items = generateBatch(currentName, currentStyle, 5);
    renderBatch(items, true);
    document.querySelectorAll('.badge').forEach((el, i, arr) => {
      if (i < arr.length - items.length) el.style.animation = 'none';
    });
  }

  stampBtn.addEventListener('click', runGenerate);
  nameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') runGenerate(); });
  moreBtn.addEventListener('click', runMore);

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentStyle = chip.dataset.style;
      if (currentName) runGenerate();
    });
  });

  grid.innerHTML = '<div class="empty">Your handles will show up here — type a name above and hit generate.</div>';
})();