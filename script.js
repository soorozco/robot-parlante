(() => {
  const robotWrap   = document.getElementById('robotWrap');
  const bubble      = document.getElementById('bubble');
  const jokeBtn     = document.getElementById('jokeBtn');
  const triviaBtn   = document.getElementById('triviaBtn');
  const stopBtn     = document.getElementById('stopBtn');
  const voiceSelect = document.getElementById('voiceSelect');
  const rateInput   = document.getElementById('rate');
  const pitchInput  = document.getElementById('pitch');
  const retroInput  = document.getElementById('retro');

  const synth = window.speechSynthesis;
  let voices = [];

  // === Banco de chistes de doctores ===
  const JOKES = [
    "Doctor, doctor, me duele todo el cuerpo. Donde toco, me duele. Pues debe tener el dedo roto.",
    "¿Cuál es el colmo de un oftalmólogo? Que su esposa no lo vea con buenos ojos.",
    "Doctor, doctor, tengo amnesia. ¿Desde cuándo? ¿Desde cuándo qué?",
    "Paciente: Doctor, ¿es grave? Doctor: Bueno, le diré, no compre nada a plazos largos.",
    "¿Por qué los médicos siempre escriben mal? Porque la receta es jeroglífica.",
    "¿Cuál es el doctor más romántico? El cardiólogo, porque siempre le late tu corazón.",
    "Doctor, doctor, me siento como una cortina. Pues asómese.",
    "¿Por qué los esqueletos no pelean? Porque no tienen agallas.",
    "Doctor: Necesita lentes. Paciente: ¿Cómo lo supo? Doctor: Porque entró por la ventana.",
    "Doctor, no consigo dormir. ¿Ha probado contar ovejas? Sí, pero al llegar a cincuenta mil ya es hora de levantarme.",
    "¿Cuál es el santo patrón de los anestesiólogos? San Soporífero.",
    "Doctor, mi marido cree que es una rana. ¿Y desde cuándo? Desde que se cayó al charco. Croac.",
    "¿Cómo se llama el dentista que va a la guerra? Sacamuelas.",
    "¿Cuál es el peor diagnóstico médico? El que dice: vuelva en seis meses y veremos.",
    "Doctor: Veo en su expediente que es hipocondríaco. Paciente: ¿Y eso es grave?",
    "¿Cuál es la diferencia entre un cirujano y Dios? Que Dios no se cree cirujano.",
    "¿Por qué los radiólogos son tan tranquilos? Porque ven a través de la gente.",
    "Paciente: Doctor, me duele aquí cuando me toco. Doctor: Pues no se toque.",
    "¿Qué le dice un termómetro a otro? Me sacas de quicio.",
    "¿Cuál es el colmo de un dermatólogo? Que su trabajo le dé sarpullido.",
    "Doctor, doctor, ¿me podrá curar? Eso depende. ¿De qué? De su seguro médico.",
    "¿Cuál es el médico favorito de los electricistas? El cardiólogo, porque trata las corrientes.",
    "¿Por qué la sal fue al doctor? Porque tenía la presión muy alta."
  ];

  // === Banco de trivias médicas ===
  const TRIVIAS = [
    "Sabías que el corazón humano late aproximadamente cien mil veces al día.",
    "Sabías que un adulto tiene 206 huesos, pero un bebé nace con cerca de 300.",
    "Sabías que el ácido del estómago es tan fuerte que podría disolver una hoja de afeitar.",
    "Sabías que la piel es el órgano más grande del cuerpo humano.",
    "Sabías que el cerebro humano consume el veinte por ciento de la energía del cuerpo.",
    "Sabías que los pulmones contienen alrededor de trescientos millones de alvéolos.",
    "Sabías que la sangre tarda menos de un minuto en dar la vuelta completa al cuerpo.",
    "Sabías que el hígado puede regenerarse incluso si se le extrae el setenta y cinco por ciento.",
    "Sabías que tu cuerpo produce veinticinco millones de células nuevas cada segundo.",
    "Sabías que el esmalte dental es la sustancia más dura del cuerpo humano.",
    "Sabías que los impulsos nerviosos pueden viajar hasta a 432 kilómetros por hora.",
    "Sabías que producimos alrededor de un litro y medio de saliva al día.",
    "Sabías que el intestino delgado mide entre 6 y 7 metros de largo.",
    "Sabías que los riñones filtran unos 180 litros de sangre al día.",
    "Sabías que los humanos compartimos cerca del cincuenta por ciento de nuestro ADN con los plátanos.",
    "Sabías que los ojos pueden distinguir alrededor de diez millones de colores diferentes.",
    "Sabías que la penicilina fue descubierta por accidente en 1928 por Alexander Fleming.",
    "Sabías que un estornudo viaja a más de 160 kilómetros por hora.",
    "Sabías que el cuerpo humano contiene alrededor de 37 billones de células.",
    "Sabías que cada huella digital es única, incluso entre gemelos idénticos.",
    "Sabías que el músculo más fuerte del cuerpo, en proporción a su tamaño, es el masetero, en la mandíbula.",
    "Sabías que el sonido más común que perciben los bebés en el vientre es el latido materno.",
    "Sabías que la fiebre no es la enfermedad, sino una respuesta inmune que ayuda a combatir infecciones.",
    "Sabías que los huesos del oído son los más pequeños del cuerpo humano: martillo, yunque y estribo.",
    "Sabías que la córnea es el único tejido del cuerpo que no recibe sangre, toma oxígeno directamente del aire."
  ];

  // Para no repetir el mismo justo después
  let lastJokeIdx = -1;
  let lastTriviaIdx = -1;
  function pickRandom(arr, lastIdx) {
    if (arr.length <= 1) return 0;
    let idx;
    do { idx = Math.floor(Math.random() * arr.length); } while (idx === lastIdx);
    return idx;
  }

  // === Voces ===
  const PREFERRED_FEMALE_ES = [
    'Paulina', 'Mónica', 'Monica', 'Esperanza', 'Helena', 'Sabina', 'Catalina',
  ];

  function pickDefaultVoice() {
    for (const name of PREFERRED_FEMALE_ES) {
      const v = voices.find(x => x.name.toLowerCase().includes(name.toLowerCase()) &&
                                 x.lang.toLowerCase().startsWith('es'));
      if (v) return v;
    }
    const mx = voices.find(v => v.lang.toLowerCase().startsWith('es-mx'));
    if (mx) return mx;
    const es = voices.find(v => v.lang.toLowerCase().startsWith('es'));
    if (es) return es;
    return voices[0];
  }

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

  // === Hablar ===
  function makeUtter(text) {
    const u = new SpeechSynthesisUtterance(text);
    const chosen = voices.find(v => v.name === voiceSelect.value);
    if (chosen) u.voice = chosen;
    u.lang = chosen ? chosen.lang : 'es-MX';
    u.rate  = parseFloat(rateInput.value);
    u.pitch = parseFloat(pitchInput.value);
    return u;
  }

  function speakNormal(text) {
    const u = makeUtter(text);
    u.onstart = () => { robotWrap.classList.add('talking'); };
    u.onend = () => { robotWrap.classList.remove('talking'); };
    u.onerror = onTalkError;
    synth.speak(u);
  }

  function speakRetro(text) {
    const tokens = text.match(/[^\s]+/g) || [];
    if (tokens.length === 0) return;
    robotWrap.classList.add('talking');

    const basePitch = parseFloat(pitchInput.value);
    const baseRate  = parseFloat(rateInput.value);
    let stopped = false;

    function speakIdx(i) {
      if (stopped || i >= tokens.length) {
        robotWrap.classList.remove('talking');
        return;
      }
      const u = makeUtter(tokens[i]);
      const wobble = (i % 2 === 0 ? -0.05 : 0.05) + (Math.random() - 0.5) * 0.06;
      u.pitch = Math.max(0.1, Math.min(2, basePitch + wobble));
      u.rate  = baseRate;
      u.onend = () => {
        const tail = tokens[i].slice(-1);
        const pause = /[,;:]/.test(tail) ? 180 :
                      /[.!?]/.test(tail) ? 280 : 80;
        setTimeout(() => speakIdx(i + 1), pause);
      };
      u.onerror = onTalkError;
      synth.speak(u);
    }
    activeRetroStopper = () => { stopped = true; };
    speakIdx(0);
  }

  let activeRetroStopper = null;
  function onTalkError() {
    robotWrap.classList.remove('talking');
    bubble.textContent = 'Ups, no pude hablar. Intenta de nuevo o cambia de voz.';
  }

  function speakText(text) {
    synth.cancel();
    if (activeRetroStopper) { activeRetroStopper(); activeRetroStopper = null; }
    bubble.textContent = text;
    bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
    if (retroInput.checked) speakRetro(text); else speakNormal(text);
  }

  function tellJoke() {
    const idx = pickRandom(JOKES, lastJokeIdx);
    lastJokeIdx = idx;
    speakText(JOKES[idx]);
  }

  function tellTrivia() {
    const idx = pickRandom(TRIVIAS, lastTriviaIdx);
    lastTriviaIdx = idx;
    speakText(TRIVIAS[idx]);
  }

  function stopSpeaking() {
    synth.cancel();
    if (activeRetroStopper) { activeRetroStopper(); activeRetroStopper = null; }
    robotWrap.classList.remove('talking');
  }

  jokeBtn.addEventListener('click', tellJoke);
  triviaBtn.addEventListener('click', tellTrivia);
  stopBtn.addEventListener('click', stopSpeaking);

  if (!('speechSynthesis' in window)) {
    bubble.textContent = 'Tu navegador no soporta la síntesis de voz. Prueba con Chrome, Edge o Safari.';
    jokeBtn.disabled = true;
    triviaBtn.disabled = true;
  }
})();
