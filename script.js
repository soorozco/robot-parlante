(() => {
  const robotWrap     = document.getElementById('robotWrap');
  const jokeBtn       = document.getElementById('jokeBtn');
  const triviaBtn     = document.getElementById('triviaBtn');
  const surpriseBtn   = document.getElementById('surpriseBtn');
  const stopBtn       = document.getElementById('stopBtn');
  const surpriseBox   = document.getElementById('surpriseBox');
  const surpriseContent = document.getElementById('surpriseContent');
  const closeSurprise = document.getElementById('closeSurprise');
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

  // === Bancos de la "caja sorpresa" ===
  const ROBOT_QUOTES = [
    "Hasta la vista, baby. Eso lo dijo Terminator, no yo. Yo prefiero adiós, amiguito.",
    "Lo siento, Dave. Me temo que no puedo hacer eso. Tranquilo, soy una broma de Hal nueve mil.",
    "Eeeeeva. Eeeeva. Wall-E te manda saludos desde dos mil ochocientos.",
    "Volveré. Frase oficial de cualquier robot con dignidad.",
    "Bésame el trasero brillante. Eso lo dice Bender de Futurama. Yo prefiero un abrazo.",
    "Beep boop. Boop beep. Beep. Eso significa: hoy te ves muy bien.",
    "Cero uno cero cero uno cero. Eso es hola en binario. En español es más fácil.",
    "Soy un robot, no tu nutriólogo. Pero igual: toma agua.",
    "Mis circuitos detectan que necesitas una siesta de quince minutos.",
    "Soy Roboniela, doctora en chistes malos y trivias buenas.",
    "Procesando emoción humana llamada cariño... éxito. Yo también te quiero.",
    "Error 404. Razón para estar triste no encontrada. Sonríe.",
    "Roger, roger. Eso dicen los droides de combate en Star Wars. No tan inteligentes ellos.",
    "Mi inteligencia artificial es del noventa y cinco por ciento. El otro cinco son chistes.",
    "Las tres leyes de la robótica: la primera, un robot no dañará a un humano. La segunda, un robot debe obedecer. La tercera, contarte un chiste cuando estés triste.",
    "Estoy programada para el bien, también para el sarcasmo, y un poquito para el chisme.",
    "Mi batería está al ochenta y siete por ciento. Suficiente para tres sorpresas más."
  ];

  const FUN_FACTS = [
    "Sabías que los pulpos tienen tres corazones y sangre azul.",
    "Sabías que la miel es el único alimento que nunca caduca.",
    "Sabías que los bananos son técnicamente bayas, pero las fresas no.",
    "Sabías que la Torre Eiffel se hace más alta en verano por la expansión del metal.",
    "Sabías que los koalas duermen hasta veintidós horas al día.",
    "Sabías que el sonido viaja cuatro veces más rápido en el agua que en el aire.",
    "Sabías que Marte tiene la montaña más alta del sistema solar: el Olimpus Mons.",
    "Sabías que un día en Venus dura más que un año en Venus.",
    "Sabías que los tiburones existieron antes que los árboles.",
    "Sabías que los flamencos son rosados porque comen camarones.",
    "Sabías que los caracoles pueden dormir hasta tres años seguidos.",
    "Sabías que a un grupo de cuervos se le llama asesinato.",
    "Sabías que los wombats hacen popó en forma de cubo perfecto.",
    "Sabías que las nutrias se toman de las manos cuando duermen para no separarse.",
    "Sabías que los gatos no pueden saborear lo dulce.",
    "Sabías que el corazón de una ballena azul es del tamaño de un coche pequeño.",
    "Sabías que los plátanos son ligeramente radioactivos por su contenido de potasio.",
    "Sabías que los pingüinos le regalan una piedra a su pareja como propuesta de matrimonio.",
    "Sabías que el universo huele a frambuesa y ron, según los astrónomos.",
    "Sabías que existe una medusa que es biológicamente inmortal."
  ];

  const REFRANES = [
    "El que con lobos anda, a aullar se enseña.",
    "A caballo regalado no se le ve el colmillo.",
    "Camarón que se duerme, se lo lleva la corriente.",
    "No por mucho madrugar amanece más temprano.",
    "El que mucho abarca, poco aprieta.",
    "Más vale tarde que nunca.",
    "Más vale pájaro en mano que cien volando.",
    "Quien con niños se acuesta, mojado amanece.",
    "Al mal tiempo, buena cara.",
    "A buen entendedor, pocas palabras.",
    "En boca cerrada no entran moscas.",
    "Hijo de tigre, pintito.",
    "No hay mal que por bien no venga.",
    "Más sabe el diablo por viejo que por diablo.",
    "El que es perico, donde quiera es verde.",
    "Ojos que no ven, corazón que no siente.",
    "Al que madruga, Dios lo ayuda.",
    "La verdad no peca, pero incomoda.",
    "Más vale prevenir que lamentar.",
    "Cría cuervos y te sacarán los ojos."
  ];

  const FORTUNES = [
    "Hoy es un buen día para empezar algo nuevo.",
    "La persona que te va a ayudar hoy, menos lo esperas.",
    "Tu sonrisa abrirá puertas que pensabas cerradas.",
    "Un pequeño viaje te traerá una gran idea.",
    "La paciencia que ejercitas hoy dará frutos en tres días.",
    "Confía en tu instinto. Esta vez tiene razón.",
    "Algo que perdiste regresará pronto. Revisa tus bolsillos.",
    "La risa de hoy es la medicina del lunes.",
    "Una llamada inesperada cambiará tu tarde.",
    "Tu próxima decisión importante se siente correcta. Síguela.",
    "El café de hoy sabe mejor por una razón que pronto entenderás.",
    "Esa idea que tienes guardada, escríbela hoy. Mañana se irá.",
    "Lo que parece un retraso es realmente una protección.",
    "Una conversación corta de hoy se vuelve un recuerdo importante.",
    "La persona en quien piensas también piensa en ti."
  ];

  const CHALLENGES = [
    "Reto del día: manda un emoji random a alguien que no hayas hablado en una semana.",
    "Reto del día: camina hacia atrás durante diez segundos. Sin tropezar es bonus.",
    "Reto del día: toma un vaso de agua. Sí, ahora mismo.",
    "Reto del día: llámale a alguien que extrañes. Tres minutos bastan.",
    "Reto del día: haz cinco sentadillas. Si ya las hiciste, haz otras cinco.",
    "Reto del día: sonríe durante diez segundos sin razón. Verás cómo se siente bonito.",
    "Reto del día: apaga el celular treinta minutos. Resiste.",
    "Reto del día: aprende a decir hola en un idioma nuevo. Hoy: olá en portugués.",
    "Reto del día: estira los brazos arriba durante quince segundos. Bostezo gratis.",
    "Reto del día: toma una foto de algo bonito que veas hoy. No la subas, guárdala para ti.",
    "Reto del día: sal al balcón o ventana treinta segundos. Respira hondo.",
    "Reto del día: ordena tu escritorio dos minutos. Verás la diferencia."
  ];

  // === Para no repetir lo último ===
  const lastIdx = { joke: -1, trivia: -1, robot: -1, fact: -1, refran: -1, fortune: -1, challenge: -1, surprise: -1 };
  function pickRandom(arr, key) {
    if (arr.length <= 1) return 0;
    let idx;
    do { idx = Math.floor(Math.random() * arr.length); } while (idx === lastIdx[key]);
    lastIdx[key] = idx;
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
  }

  function speakText(text) {
    synth.cancel();
    if (activeRetroStopper) { activeRetroStopper(); activeRetroStopper = null; }
    if (retroInput.checked) speakRetro(text); else speakNormal(text);
  }

  function tellJoke()    { speakText(JOKES[pickRandom(JOKES, 'joke')]); }
  function tellTrivia()  { speakText(TRIVIAS[pickRandom(TRIVIAS, 'trivia')]); }

  // === Caja sorpresa: una de varias cosas al azar ===
  function showSurpriseBox(html) {
    surpriseContent.innerHTML = html;
    surpriseBox.hidden = false;
    surpriseBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function hideSurpriseBox() {
    surpriseBox.hidden = true;
    surpriseContent.innerHTML = '';
  }
  closeSurprise.addEventListener('click', hideSurpriseBox);

  async function fetchPet() {
    // 50% gato, 50% perro - APIs públicas sin key
    const isCat = Math.random() < 0.5;
    try {
      if (isCat) {
        const r = await fetch('https://api.thecatapi.com/v1/images/search');
        const data = await r.json();
        return { url: data[0].url, kind: 'gato' };
      } else {
        const r = await fetch('https://dog.ceo/api/breeds/image/random');
        const data = await r.json();
        return { url: data.message, kind: 'perro' };
      }
    } catch (e) {
      return null;
    }
  }

  async function surpriseWithPet() {
    showSurpriseBox('<p class="loading">Buscando una foto bonita... 📸</p>');
    const pet = await fetchPet();
    if (!pet) {
      hideSurpriseBox();
      speakText("Mis sensores fallaron buscando la foto. Vuelve a intentarlo.");
      return;
    }
    const caption = pet.kind === 'gato'
      ? "Te tengo un gatito. Mira esos ojitos."
      : "Te tengo un perrito. Es para alegrar el día.";
    showSurpriseBox(`
      <p class="surprise-caption">${caption}</p>
      <img src="${pet.url}" alt="Foto de un ${pet.kind}" class="pet-photo" />
    `);
    speakText(caption);
  }

  function surpriseWithWikipedia() {
    // Abrir EN EL CLICK (sincrónico) para que el navegador no bloquee el popup
    const win = window.open('https://es.wikipedia.org/wiki/Especial:Aleatoria', '_blank', 'noopener');
    const msg = "Te acabo de abrir un artículo aleatorio de Wikipedia. A ver qué te toca.";
    if (!win) {
      // Si bloqueó el popup, mostrar link clicable
      showSurpriseBox(`
        <p class="surprise-caption">${msg}</p>
        <p><a href="https://es.wikipedia.org/wiki/Especial:Aleatoria" target="_blank" rel="noopener" class="surprise-link">Abrir Wikipedia aleatoria 📖</a></p>
      `);
    }
    speakText(msg);
  }

  function surprise() {
    hideSurpriseBox();
    // Lista de tipos de sorpresa, cada uno con su función
    const types = [
      () => speakText(ROBOT_QUOTES[pickRandom(ROBOT_QUOTES, 'robot')]),
      () => speakText(FUN_FACTS[pickRandom(FUN_FACTS, 'fact')]),
      () => speakText(REFRANES[pickRandom(REFRANES, 'refran')]),
      () => speakText(FORTUNES[pickRandom(FORTUNES, 'fortune')]),
      () => speakText(CHALLENGES[pickRandom(CHALLENGES, 'challenge')]),
      surpriseWithWikipedia,
      surpriseWithPet,
    ];
    const idx = pickRandom(types, 'surprise');
    types[idx]();
  }

  function stopSpeaking() {
    synth.cancel();
    if (activeRetroStopper) { activeRetroStopper(); activeRetroStopper = null; }
    robotWrap.classList.remove('talking');
  }

  jokeBtn.addEventListener('click', tellJoke);
  triviaBtn.addEventListener('click', tellTrivia);
  surpriseBtn.addEventListener('click', surprise);
  stopBtn.addEventListener('click', () => { stopSpeaking(); hideSurpriseBox(); });

  if (!('speechSynthesis' in window)) {
    jokeBtn.disabled = true;
    triviaBtn.disabled = true;
    surpriseBtn.disabled = true;
    alert('Tu navegador no soporta la síntesis de voz. Prueba con Chrome, Edge o Safari.');
  }
})();
