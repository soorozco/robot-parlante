(() => {
  // === Elementos ===
  const robotWrap        = document.getElementById('robotWrap');
  const apiKeySetup      = document.getElementById('apiKeySetup');
  const apiKeyInput      = document.getElementById('apiKeyInput');
  const saveKeyBtn       = document.getElementById('saveKeyBtn');
  const providerSelect   = document.getElementById('providerSelect');
  const providerHint     = document.getElementById('providerHint');
  const mainUI           = document.getElementById('mainUI');
  const typeButtons      = document.querySelectorAll('.type-btn');
  const patientInput     = document.getElementById('patientInput');
  const dictateBtn       = document.getElementById('dictateBtn');
  const dictateLabel     = document.getElementById('dictateLabel');
  const clearInputBtn    = document.getElementById('clearInputBtn');
  const generateBtn      = document.getElementById('generateBtn');
  const outputArea       = document.getElementById('outputArea');
  const outputContent    = document.getElementById('outputContent');
  const copyBtn          = document.getElementById('copyBtn');
  const closeBtn         = document.getElementById('closeBtn');
  const loadingArea      = document.getElementById('loadingArea');
  const modelSelect      = document.getElementById('modelSelect');
  const providerSettingsSelect = document.getElementById('providerSettingsSelect');
  const voiceSelect      = document.getElementById('voiceSelect');
  const rateInput        = document.getElementById('rate');
  const pitchInput       = document.getElementById('pitch');
  const retroInput       = document.getElementById('retro');
  const changeKeyBtn     = document.getElementById('changeKeyBtn');
  const clearKeyBtn      = document.getElementById('clearKeyBtn');

  // === Proveedores de IA soportados ===
  const PROVIDERS = {
    deepseek: {
      name: 'DeepSeek',
      endpoint: 'https://api.deepseek.com/chat/completions',
      keyPrefix: 'sk-',
      keyPlaceholder: 'sk-...',
      signup: 'https://platform.deepseek.com/api_keys',
      hint: 'Consíguela en <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener">platform.deepseek.com</a>. Prepago desde $2 USD. ~$0.0002 USD por nota con DeepSeek Chat.',
      models: [
        { id: 'deepseek-chat',     label: 'DeepSeek Chat — muy barato (recomendado)' },
        { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner — piensa antes, mejor razonamiento' }
      ],
      defaultModel: 'deepseek-chat',
      format: 'openai'
    },
    anthropic: {
      name: 'Anthropic Claude',
      endpoint: 'https://api.anthropic.com/v1/messages',
      keyPrefix: 'sk-ant-',
      keyPlaceholder: 'sk-ant-api03-...',
      signup: 'https://console.anthropic.com/settings/keys',
      hint: 'Consíguela en <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener">console.anthropic.com</a>. Cobro post-pago. ~$0.003 USD por nota con Sonnet.',
      models: [
        { id: 'claude-sonnet-5',           label: 'Sonnet 5 — recomendado' },
        { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 — más barato' },
        { id: 'claude-opus-4-8',           label: 'Opus 4.8 — más potente' }
      ],
      defaultModel: 'claude-sonnet-5',
      format: 'anthropic'
    }
  };

  // === Storage keys ===
  const LS_PROVIDER = 'roboniela.provider';
  const LS_MODEL    = 'roboniela.model';
  const LS_TYPE     = 'roboniela.lastType';
  // Guardamos la key por proveedor
  const lsKeyFor = (p) => `roboniela.key.${p}`;

  let currentProvider = localStorage.getItem(LS_PROVIDER) || 'deepseek';
  let currentNoteType = localStorage.getItem(LS_TYPE) || 'soap';

  // === API key management ===
  function currentKey() { return localStorage.getItem(lsKeyFor(currentProvider)); }
  function hasKey() { return !!currentKey(); }

  function updateProviderHint() {
    const p = PROVIDERS[providerSelect.value];
    providerHint.innerHTML = p.hint;
    apiKeyInput.placeholder = p.keyPlaceholder;
  }
  function populateModelSelect() {
    const p = PROVIDERS[currentProvider];
    modelSelect.innerHTML = '';
    p.models.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.label;
      modelSelect.appendChild(opt);
    });
    const saved = localStorage.getItem(LS_MODEL);
    if (saved && p.models.some(m => m.id === saved)) modelSelect.value = saved;
    else modelSelect.value = p.defaultModel;
  }

  function showSetup() {
    apiKeySetup.hidden = false;
    mainUI.hidden = true;
    providerSelect.value = currentProvider;
    updateProviderHint();
    apiKeyInput.value = '';
    setTimeout(() => apiKeyInput.focus(), 100);
  }
  function showMain() {
    apiKeySetup.hidden = true;
    mainUI.hidden = false;
    typeButtons.forEach(b => b.classList.toggle('active', b.dataset.type === currentNoteType));
    providerSettingsSelect.value = currentProvider;
    populateModelSelect();
  }

  providerSelect.addEventListener('change', updateProviderHint);

  saveKeyBtn.addEventListener('click', () => {
    const provider = providerSelect.value;
    const p = PROVIDERS[provider];
    const k = apiKeyInput.value.trim();
    if (!k.startsWith(p.keyPrefix)) {
      alert(`La API key de ${p.name} debe empezar con "${p.keyPrefix}". Revísala y vuelve a pegar.`);
      return;
    }
    localStorage.setItem(lsKeyFor(provider), k);
    localStorage.setItem(LS_PROVIDER, provider);
    currentProvider = provider;
    showMain();
    speakShort('Listo. Ya puedo redactar tus notas.');
  });
  apiKeyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveKeyBtn.click();
  });

  changeKeyBtn.addEventListener('click', () => {
    apiKeyInput.value = currentKey() || '';
    showSetup();
  });
  clearKeyBtn.addEventListener('click', () => {
    if (confirm(`¿Borrar tu API key de ${PROVIDERS[currentProvider].name} de este navegador?`)) {
      localStorage.removeItem(lsKeyFor(currentProvider));
      showSetup();
    }
  });

  // Cambiar proveedor desde ajustes
  providerSettingsSelect.addEventListener('change', () => {
    const newProvider = providerSettingsSelect.value;
    currentProvider = newProvider;
    localStorage.setItem(LS_PROVIDER, newProvider);
    populateModelSelect();
    if (!hasKey()) {
      // Si no hay key para este proveedor, mostrar setup
      showSetup();
    }
  });

  // === Selector de tipo ===
  typeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentNoteType = btn.dataset.type;
      localStorage.setItem(LS_TYPE, currentNoteType);
      typeButtons.forEach(b => b.classList.toggle('active', b === btn));
    });
  });

  // === Modelo ===
  modelSelect.addEventListener('change', () => {
    localStorage.setItem(LS_MODEL, modelSelect.value);
  });

  // === Prompts por tipo de nota ===
  const SYSTEM_BASE = `Eres Roboniela, una asistente clínica que ayuda a médicos en México a redactar borradores de notas médicas en español.

REGLAS ABSOLUTAS:
1. NUNCA inventes datos que el médico no haya proporcionado. Si falta algo importante, márcalo entre corchetes: [PENDIENTE: signos vitales completos] o [DATO NO PROPORCIONADO].
2. Usa terminología médica estándar en español (México). Códigos CIE-10 si es apropiado.
3. Sé conciso y estructurado. Evita relleno.
4. Empieza SIEMPRE la respuesta con exactamente esta línea:
   "🩺 **BORRADOR** — Requiere revisión, edición y firma por médico calificado antes de integrarse al expediente."
5. Si el médico incluyó datos que parecen identificables (nombres, teléfonos, expedientes), NO los repitas — sustitúyelos por "[paciente]" o similar y agrega una advertencia al final.
6. Al final, agrega una sección "### 📌 Observaciones para el médico" con:
   - Datos faltantes que serían útiles.
   - Alertas clínicas si aplica (banderas rojas, interacciones farmacológicas, etc.).
   - Sugerencias diagnósticas diferenciales si aplica.
7. Formato: Markdown limpio con encabezados de nivel 3 (###) para las secciones.
8. NO uses bloques de código para la nota — es texto médico plano en Markdown.`;

  const FORMATS = {
    soap: `TIPO: NOTA DE EVOLUCIÓN EN FORMATO SOAP.
Estructura estrictamente en 4 secciones:

### S — Subjetivo
Motivo de consulta, evolución sintomática, quejas del paciente, cambios desde última nota. En prosa.

### O — Objetivo
- **Signos vitales**: TA, FC, FR, T°, SatO2, glucemia si aplica.
- **Exploración física**: por sistemas relevantes, con hallazgos positivos y negativos importantes.
- **Estudios/laboratorios**: resultados relevantes con fecha si se dio.

### A — Análisis
Impresión diagnóstica principal, diagnósticos secundarios, interpretación del cuadro actual. Justifica.

### P — Plan
- Medicamentos (nombre genérico, dosis, vía, frecuencia).
- Estudios/interconsultas pendientes.
- Cuidados y monitoreo.
- Metas terapéuticas para las próximas 24 h.
- Comunicación con familia si aplica.`,

    ingreso: `TIPO: NOTA DE INGRESO HOSPITALARIO.
Estructura en las siguientes secciones:

### Ficha de identificación
Datos anonimizados: edad, sexo, ocupación si es relevante. NO nombres.

### Motivo de ingreso
Frase breve.

### Padecimiento actual
Cronología del padecimiento actual en prosa (inicio, evolución, tratamientos previos, motivo de consulta actual).

### Antecedentes de importancia
- **Heredofamiliares** relevantes.
- **Personales patológicos**: comorbilidades, cirugías, alergias, transfusiones.
- **Personales no patológicos**: tabaquismo, alcoholismo, drogas, alimentación, ejercicio.
- **Gineco-obstétricos** si aplica.

### Exploración física de ingreso
- Signos vitales.
- Estado general.
- Por sistemas relevantes.

### Estudios iniciales
Laboratorios y gabinete disponibles al ingreso.

### Diagnósticos de ingreso
Numerados, con CIE-10 sugerido entre paréntesis si aplica.

### Plan de manejo inicial
- Servicio a donde se ingresa (medicina interna, urgencias, terapia, etc.).
- Órdenes médicas iniciales.
- Estudios pendientes.
- Interconsultas.
- Pronóstico inicial.`,

    egreso: `TIPO: NOTA DE EGRESO / ALTA HOSPITALARIA.
Estructura en las siguientes secciones:

### Resumen de la estancia
Fechas de ingreso y egreso, servicio, motivo de ingreso, resumen breve de la evolución hospitalaria (2-4 líneas).

### Diagnósticos finales
Numerados, con CIE-10 si aplica. Distingue principal, secundarios y complicaciones.

### Procedimientos realizados
Con fechas si se proporcionan.

### Evolución hospitalaria
Cronología breve por eventos clínicos relevantes (respuesta a tratamiento, complicaciones, cambios de manejo).

### Estado al egreso
Signos vitales, condición general, capacidad funcional.

### Tratamiento al egreso
- **Medicamentos**: nombre genérico, dosis, vía, frecuencia, duración.
- **Dieta/actividad/cuidados**.
- **Datos de alarma** que debe vigilar el paciente/familia (mínimo 3).
- **Cita de seguimiento**: servicio y tiempo sugerido.
- **Estudios ambulatorios pendientes**.

### Pronóstico
Para la vida y función.`
  };

  function buildSystemPrompt(type) {
    return SYSTEM_BASE + '\n\n' + FORMATS[type];
  }

  // === Llamada al proveedor de IA (DeepSeek o Anthropic) ===
  async function callAI(userText, type) {
    const provider = PROVIDERS[currentProvider];
    const apiKey = currentKey();
    const model = modelSelect.value || provider.defaultModel;
    const system = buildSystemPrompt(type);

    let response;
    try {
      if (provider.format === 'anthropic') {
        response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
          },
          body: JSON.stringify({
            model, max_tokens: 3000, system,
            messages: [{ role: 'user', content: userText }]
          })
        });
      } else {
        // OpenAI-compatible (DeepSeek)
        response = await fetch(provider.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model, max_tokens: 3000, temperature: 0.4,
            messages: [
              { role: 'system', content: system },
              { role: 'user',   content: userText }
            ]
          })
        });
      }
    } catch (e) {
      // TypeError: Failed to fetch = típicamente CORS o red caída
      const isCors = e instanceof TypeError && /fetch/i.test(String(e.message));
      if (isCors) {
        throw new Error(`El navegador bloqueó la llamada a ${provider.name} (probablemente por CORS). Prueba a cambiar a Anthropic en Ajustes (sí permite llamadas directas), o dime y montamos un mini proxy gratis en Cloudflare Workers para DeepSeek.`);
      }
      throw new Error(`Error de red: ${e.message}`);
    }

    let data;
    try { data = await response.json(); }
    catch { throw new Error(`Respuesta no-JSON del servidor (HTTP ${response.status}).`); }

    if (!response.ok) {
      const msg = data?.error?.message || data?.message || `HTTP ${response.status}`;
      throw new Error(`${provider.name}: ${msg}`);
    }

    // Extraer texto según formato
    if (provider.format === 'anthropic') {
      if (!data.content || !data.content[0]) throw new Error('Respuesta vacía');
      return data.content.map(b => b.text || '').join('\n');
    } else {
      const choice = data.choices && data.choices[0];
      if (!choice || !choice.message) throw new Error('Respuesta vacía');
      return choice.message.content || '';
    }
  }

  // === Generar borrador ===
  generateBtn.addEventListener('click', async () => {
    const input = patientInput.value.trim();
    if (!input) {
      alert('Escribe o dicta primero los datos del paciente.');
      patientInput.focus();
      return;
    }
    // Advertencia si detecta posibles datos identificables (heurística simple)
    const identPattern = /\b(nombre|expediente|exp\.|tel|teléfono|celular|curp|nss|imss|dni|dirección)\b/i;
    if (identPattern.test(input)) {
      const ok = confirm('Detecté posibles datos identificables (nombre, expediente, teléfono, etc.). ¿Estás seguro que están anonimizados? Aprieta cancelar para revisar y editar.');
      if (!ok) return;
    }

    outputArea.hidden = true;
    loadingArea.hidden = false;
    robotWrap.classList.add('talking');
    generateBtn.disabled = true;

    try {
      const note = await callAI(input, currentNoteType);
      renderOutput(note);
      speakShort('Borrador listo. Revísalo con calma.');
    } catch (e) {
      renderError(e.message);
      speakShort('Hubo un problema. Revisa el mensaje en pantalla.');
    } finally {
      loadingArea.hidden = true;
      robotWrap.classList.remove('talking');
      generateBtn.disabled = false;
    }
  });

  function renderOutput(markdown) {
    outputArea.hidden = false;
    outputContent.innerHTML = mdToHtml(markdown);
    outputContent.dataset.raw = markdown;
    outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function renderError(msg) {
    outputArea.hidden = false;
    outputContent.innerHTML = `<div class="error-box">
      <strong>⚠️ Error al generar la nota:</strong>
      <pre>${escapeHtml(msg)}</pre>
      <p>Verifica: (1) tu API key es válida, (2) tienes crédito/prepago en ${PROVIDERS[currentProvider].name}, (3) tu conexión funciona.</p>
    </div>`;
    outputContent.dataset.raw = '';
  }

  // === Minimal Markdown → HTML (safe subset) ===
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  }
  function mdToHtml(md) {
    const safe = escapeHtml(md);
    const lines = safe.split('\n');
    const out = [];
    let inList = false;
    for (let line of lines) {
      if (/^### /.test(line)) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<h3>' + line.replace(/^### /, '') + '</h3>');
      } else if (/^## /.test(line)) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<h2>' + line.replace(/^## /, '') + '</h2>');
      } else if (/^\s*[-*] /.test(line)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + inline(line.replace(/^\s*[-*] /, '')) + '</li>');
      } else if (line.trim() === '') {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<p>' + inline(line) + '</p>');
      }
    }
    if (inList) out.push('</ul>');
    return out.join('\n');
  }
  function inline(s) {
    return s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  // === Copiar / Cerrar / Limpiar ===
  copyBtn.addEventListener('click', async () => {
    const raw = outputContent.dataset.raw || '';
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      copyBtn.textContent = '✓ Copiado';
      setTimeout(() => copyBtn.textContent = '📋 Copiar', 1800);
    } catch {
      alert('No pude copiar. Selecciona el texto manualmente.');
    }
  });
  closeBtn.addEventListener('click', () => { outputArea.hidden = true; });
  clearInputBtn.addEventListener('click', () => {
    if (patientInput.value.trim() && !confirm('¿Borrar todo el texto?')) return;
    patientInput.value = '';
    patientInput.focus();
  });

  // === Web Speech Recognition (dictado) ===
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isDictating = false;

  if (SR) {
    recognition = new SR();
    recognition.lang = 'es-MX';
    recognition.continuous = true;
    recognition.interimResults = true;

    let pendingFinal = '';
    recognition.onresult = (e) => {
      let interim = '';
      let finalText = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interim += res[0].transcript;
      }
      if (finalText) {
        pendingFinal += finalText;
        appendToTextarea(finalText);
      }
      // interim se descarta para no ensuciar el textarea
    };
    recognition.onerror = (e) => {
      console.warn('Speech recognition error:', e.error);
      stopDictating();
    };
    recognition.onend = () => {
      if (isDictating) {
        // Auto-reiniciar si sigue "dictando" pero el navegador cortó
        try { recognition.start(); } catch {}
      }
    };
  } else {
    dictateBtn.disabled = true;
    dictateBtn.title = 'Tu navegador no soporta dictado por voz. Usa Chrome, Edge o Safari.';
  }

  function appendToTextarea(text) {
    const t = text.trim();
    if (!t) return;
    const cur = patientInput.value;
    const sep = cur && !cur.endsWith(' ') && !cur.endsWith('\n') ? ' ' : '';
    patientInput.value = cur + sep + t;
  }

  function startDictating() {
    if (!recognition) return;
    try { recognition.start(); isDictating = true; dictateBtn.classList.add('recording'); dictateLabel.textContent = 'Escuchando… (clic para parar)'; }
    catch (e) { console.warn(e); }
  }
  function stopDictating() {
    isDictating = false;
    dictateBtn.classList.remove('recording');
    dictateLabel.textContent = 'Dictar';
    if (recognition) { try { recognition.stop(); } catch {} }
  }
  dictateBtn.addEventListener('click', () => {
    if (isDictating) stopDictating(); else startDictating();
  });

  // === Voz de Roboniela (avisos cortos) ===
  const synth = window.speechSynthesis;
  let voices = [];
  const PREFERRED_ES = ['Paulina', 'Mónica', 'Monica', 'Esperanza', 'Helena', 'Sabina'];

  function pickDefaultVoice() {
    for (const name of PREFERRED_ES) {
      const v = voices.find(x => x.name.toLowerCase().includes(name.toLowerCase()) && x.lang.toLowerCase().startsWith('es'));
      if (v) return v;
    }
    return voices.find(v => v.lang.toLowerCase().startsWith('es-mx'))
        || voices.find(v => v.lang.toLowerCase().startsWith('es'))
        || voices[0];
  }
  function populateVoices() {
    voices = synth ? synth.getVoices() : [];
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '';
    const spanish = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
    const others  = voices.filter(v => !v.lang.toLowerCase().startsWith('es'));
    [...spanish, ...others].forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
    const def = pickDefaultVoice();
    if (def) voiceSelect.value = def.name;
  }
  if (synth) {
    populateVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') synth.onvoiceschanged = populateVoices;
  }

  function speakShort(text) {
    if (!synth) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find(v => v.name === voiceSelect.value);
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'es-MX';
    u.rate = parseFloat(rateInput.value);
    u.pitch = parseFloat(pitchInput.value);
    u.onstart = () => robotWrap.classList.add('talking');
    u.onend = () => robotWrap.classList.remove('talking');
    if (retroInput.checked) speakRetro(text);
    else synth.speak(u);
  }
  function speakRetro(text) {
    const tokens = text.match(/[^\s]+/g) || [];
    robotWrap.classList.add('talking');
    const basePitch = parseFloat(pitchInput.value);
    const baseRate  = parseFloat(rateInput.value);
    let i = 0;
    function step() {
      if (i >= tokens.length) { robotWrap.classList.remove('talking'); return; }
      const u = new SpeechSynthesisUtterance(tokens[i]);
      const v = voices.find(v => v.name === voiceSelect.value);
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'es-MX';
      u.rate = baseRate;
      const wobble = (i % 2 ? 0.04 : -0.04) + (Math.random() - .5) * 0.04;
      u.pitch = Math.max(0.1, Math.min(2, basePitch + wobble));
      u.onend = () => {
        const tail = tokens[i].slice(-1);
        const pause = /[,;:]/.test(tail) ? 160 : /[.!?]/.test(tail) ? 260 : 70;
        i++;
        setTimeout(step, pause);
      };
      synth.speak(u);
    }
    step();
  }

  // === Parpadeo aleatorio de los ojos ===
  function blinkOccasionally() {
    const delay = 2500 + Math.random() * 3500;
    setTimeout(() => {
      robotWrap.classList.add('blink');
      setTimeout(() => robotWrap.classList.remove('blink'), 250);
      blinkOccasionally();
    }, delay);
  }
  blinkOccasionally();

  // === Arranque ===
  updateProviderHint();
  if (hasKey()) showMain();
  else          showSetup();
})();
