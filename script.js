(() => {
  const robotWrap   = document.getElementById('robotWrap');
  const bubble      = document.getElementById('bubble');
  const textInput   = document.getElementById('textInput');
  const speakBtn    = document.getElementById('speakBtn');
  const stopBtn     = document.getElementById('stopBtn');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput   = document.getElementById('rate');

  const synth = window.speechSynthesis;
  let voices = [];

  // === Cargar voces ===
  function populateVoices() {
    voices = synth.getVoices();
    // Preferir voces en español
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

    // Seleccionar la primera en español si existe
    if (spanish.length > 0) {
      voiceSelect.value = spanish[0].name;
    }
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

  // === Hablar ===
  function speak() {
    const text = textInput.value.trim();
    if (!text) {
      bubble.textContent = '¡Escríbeme algo primero!';
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
      return;
    }

    // Cortar cualquier locución previa
    synth.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    const chosen = voices.find(v => v.name === voiceSelect.value);
    if (chosen) utter.voice = chosen;
    utter.lang = chosen ? chosen.lang : 'es-MX';
    utter.rate = parseFloat(rateInput.value);
    utter.pitch = 1.1;

    utter.onstart = () => {
      robotWrap.classList.add('talking');
      bubble.textContent = text;
      bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    };
    utter.onend = () => {
      robotWrap.classList.remove('talking');
    };
    utter.onerror = () => {
      robotWrap.classList.remove('talking');
      bubble.textContent = 'Ups, no pude hablar. Intenta de nuevo o cambia de voz.';
    };

    synth.speak(utter);
  }

  function stopSpeaking() {
    synth.cancel();
    robotWrap.classList.remove('talking');
  }

  speakBtn.addEventListener('click', speak);
  stopBtn.addEventListener('click', stopSpeaking);

  // Enter (sin shift) = hablar
  textInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      speak();
    }
  });

  // Aviso si el navegador no soporta Speech Synthesis
  if (!('speechSynthesis' in window)) {
    bubble.textContent = 'Tu navegador no soporta la síntesis de voz. Prueba con Chrome, Edge o Safari.';
    speakBtn.disabled = true;
  }
})();
