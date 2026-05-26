(() => {
  const robotWrap   = document.getElementById('robotWrap');
  const bubble      = document.getElementById('bubble');
  const textInput   = document.getElementById('textInput');
  const speakBtn    = document.getElementById('speakBtn');
  const stopBtn     = document.getElementById('stopBtn');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput   = document.getElementById('rate');
  const pitchInput  = document.getElementById('pitch');
  const retroInput  = document.getElementById('retro');

  const synth = window.speechSynthesis;
  let voices = [];

  // Voces femeninas en español preferidas (por orden de preferencia)
  const PREFERRED_FEMALE_ES = [
    'Paulina',    // es-MX (macOS)
    'Mónica',     // es-ES (macOS)
    'Monica',     // es-ES (variante sin tilde)
    'Esperanza',  // es-* (Windows)
    'Helena',     // es-ES (Windows)
    'Sabina',     // es-MX (Windows)
    'Catalina',   // es-* (varios)
  ];

  function pickDefaultVoice() {
    // 1) Intentar matchear por nombre conocido femenino
    for (const name of PREFERRED_FEMALE_ES) {
      const v = voices.find(x => x.name.toLowerCase().includes(name.toLowerCase()) &&
                                 x.lang.toLowerCase().startsWith('es'));
      if (v) return v;
    }
    // 2) Cualquier voz en es-MX
    const mx = voices.find(v => v.lang.toLowerCase().startsWith('es-mx'));
    if (mx) return mx;
    // 3) Cualquier voz en español
    const es = voices.find(v => v.lang.toLowerCase().startsWith('es'));
    if (es) return es;
    // 4) Lo que sea
    return voices[0];
  }

  // === Cargar voces ===
  function populateVoices() {
    voices = synth.getVoices();
    const spanish = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
    const others  = voices.filter(v => !v.lang.toLowerCase().startsWith('es'));
    const ordered = [...spanish, ...others];

    voiceSelect.innerHTML = '';
    ordered.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})${v.default ? ' — por defecto' : ''}`;
      voiceSelect.appendChild(opt);
    });

    const def = pickDefaultVoice();
    if (def) voiceSelect.value = def.name;
  }

  populateVoices();
  if (typeof synth.onvoiceschanged !== 'undefined') {
    synth.onvoiceschanged = populateVoices;
  }

  // === Parpadeo aleatorio ===
  function blinkOccasionally() {
    const delay = 2500 + Math.random() * 3500;
    setTimeout(() => {
      robotWrap.classList.add('blink');
      setTimeout(() => robotWrap.classList.remove('blink'), 250);
      blinkOccasionally();
    }, delay);
  }
  blinkOccasionally();

  // === Construir un utterance con la voz seleccionada ===
  function makeUtter(text) {
    const u = new SpeechSynthesisUtterance(text);
    const chosen = voices.find(v => v.name === voiceSelect.value);
    if (chosen) u.voice = chosen;
    u.lang = chosen ? chosen.lang : 'es-MX';
    u.rate  = parseFloat(rateInput.value);
    u.pitch = parseFloat(pitchInput.value);
    return u;
  }

  // === Hablar normal: una sola locución ===
  function speakNormal(text) {
    const u = makeUtter(text);
    u.onstart = onTalkStart(text);
    u.onend = onTalkEnd;
    u.onerror = onTalkError;
    synth.speak(u);
  }

  // === Hablar retro: palabra por palabra con micro-pausas y vibrato de tono ===
  // Esto simula el efecto staccato de robots de películas viejas (Robby, Daleks, etc.)
  function speakRetro(text) {
    // Partir en "tokens" preservando puntuación
    const tokens = text.match(/[^\s]+/g) || [];
    if (tokens.length === 0) return;

    robotWrap.classList.add('talking');
    bubble.textContent = text;
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');

    const basePitch = parseFloat(pitchInput.value);
    const baseRate  = parseFloat(rateInput.value);
    let stopped = false;

    function speakIdx(i) {
      if (stopped || i >= tokens.length) {
        robotWrap.classList.remove('talking');
        return;
      }
      const u = makeUtter(tokens[i]);
      // Vibrato de tono: alterna ligeramente arriba/abajo del basePitch
      const wobble = (i % 2 === 0 ? -0.05 : 0.05) + (Math.random() - 0.5) * 0.06;
      u.pitch = Math.max(0.1, Math.min(2, basePitch + wobble));
      u.rate  = baseRate;
      u.onend = () => {
        // Micro-pausa entre palabras (más larga si hay puntuación al final)
        const tail = tokens[i].slice(-1);
        const pause = /[,;:]/.test(tail) ? 180 :
                      /[.!?]/.test(tail) ? 280 : 80;
        setTimeout(() => speakIdx(i + 1), pause);
      };
      u.onerror = onTalkError;
      synth.speak(u);
    }

    // Exponer el "stop" para poder cortarlo
    activeRetroStopper = () => { stopped = true; };
    speakIdx(0);
  }

  // === Handlers compartidos ===
  let activeRetroStopper = null;
  function onTalkStart(text) {
    return () => {
      robotWrap.classList.add('talking');
      bubble.textContent = text;
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    };
  }
  function onTalkEnd() {
    robotWrap.classList.remove('talking');
  }
  function onTalkError(e) {
    robotWrap.classList.remove('talking');
    bubble.textContent = 'Ups, no pude hablar. Intenta de nuevo o cambia de voz.';
  }

  // === Punto de entrada ===
  function speak() {
    const text = textInput.value.trim();
    if (!text) {
      bubble.textContent = '¡Escríbeme algo primero!';
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      return;
    }
    synth.cancel();
    if (activeRetroStopper) { activeRetroStopper(); activeRetroStopper = null; }

    if (retroInput.checked) {
      speakRetro(text);
    } else {
      speakNormal(text);
    }
  }

  function stopSpeaking() {
    synth.cancel();
    if (activeRetroStopper) { activeRetroStopper(); activeRetroStopper = null; }
    robotWrap.classList.remove('talking');
  }

  speakBtn.addEventListener('click', speak);
  stopBtn.addEventListener('click', stopSpeaking);

  textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      speak();
    }
  });

  if (!('speechSynthesis' in window)) {
    bubble.textContent = 'Tu navegador no soporta la síntesis de voz. Prueba con Chrome, Edge o Safari.';
    speakBtn.disabled = true;
  }
})();
