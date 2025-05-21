class GeneracionIA {
  // Propiedades (atributos) privadas simuladas con "_"
  _apiClient;
  _paramDificultad;
  _estadoHistoria;
  _contextoActual;
  _opcionesActuales;
  _ultimaDecision;
  _preferenciasUsuario;
  _historiaId;
  _etica;
  _historia;

  constructor(apiKey) {
    this._apiClient = apiKey;  // En tu código actual, esto es solo la key string
    this._paramDificultad = null; // Por implementar: AdaptarDificultad
    this._estadoHistoria = null;  // Por implementar: ProgresionHistoria
    this._contextoActual = null;   // Por implementar: Contexto
    this._opcionesActuales = [];
    this._ultimaDecision = null;   // Por implementar: Decision
    this._preferenciasUsuario = null; // PersonalizacionDTO
    this._historiaId = null;       // String
    this._etica = null;            // Por implementar: Etica
    this._historia = "";
  }

  async inicializarHistoria(preferencias) {
    this._preferenciasUsuario = preferencias;
    this._historiaId = this._generarIdHistoria(); // Ejemplo, método privado para ID
    await this._generarParrafoInicial();
    this._opcionesActuales = await this._crearOpciones(this._historia);
  }

  obtenerOpciones() {
    return this._opcionesActuales;
  }

  async elegirOpcion(opcionId) {
    // Buscamos el texto de la opción seleccionada
    const opcionSeleccionada = this._opcionesActuales.find(op => op.id === opcionId);
    if (!opcionSeleccionada) throw new Error("Opción inválida");

    this._ultimaDecision = opcionSeleccionada;
    await this._generarSiguienteFragmento(opcionSeleccionada.texto);
    this._opcionesActuales = await this._crearOpciones(this._historia);

    return this._historia;
  }

  async _generarParrafoInicial() {
    const prompt = this._crearPromptInicial(this._preferenciasUsuario);
    this._historia = await this._llamarApi(prompt);
  }

  async _generarSiguienteFragmento(textoDecision) {
    const prompt = this._historia + "\n\nContinuar historia considerando: " + textoDecision;
    const siguienteFragmento = await this._llamarApi(prompt);

    if (this._validarEtica(siguienteFragmento)) {
      this._historia += "\n\n" + siguienteFragmento;
    } else {
      this._historia += "\n\n[Fragmento eliminado por contenido no ético]";
    }
  }

  async _crearOpciones(fragmento) {
    const promptOpciones = `
Dada la siguiente historia:
"${fragmento}"

Sugiere 3 opciones para continuar la historia. Devuelve un arreglo JSON con objetos que tengan "id" y "texto", ejemplo:

[
  { "id": "1", "texto": "Opción uno" },
  { "id": "2", "texto": "Opción dos" },
  { "id": "3", "texto": "Opción tres" }
]

Solo devuelve el JSON, nada más.
`;

    const respuesta = await this._llamarApi(promptOpciones);

    try {
      const opciones = JSON.parse(respuesta);
      if (!Array.isArray(opciones) || opciones.length === 0) return [];
      return opciones;
    } catch {
      return [];
    }
  }

  _crearPromptInicial(preferencias) {
    return `Genera una historia de género ${preferencias.genero}, con tono ${preferencias.tono}, ambientación ${preferencias.ambientacion} y longitud ${preferencias.longitud}. Comienza la historia.`;
  }

  _validarEtica(fragmento) {
    // Por implementar: validar contenido ético del texto
    return true;
  }

  _ajustarDificultad() {
    // Por implementar: lógica para adaptar la dificultad
  }

  _generarIdHistoria() {
    // Ejemplo simple de generación de ID único
    return "hist-" + Date.now();
  }

  async _llamarApi(prompt) {
    const response = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this._apiClient}`,
        "Content-Type": "application/json",
        "Cohere-Version": "2022-12-06"
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.9
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg = errorData?.message || response.statusText;
      throw new Error("Error en API: " + errorMsg);
    }

    const data = await response.json();
    return data.generations[0].text.trim();
  }
}

// Código para la página (igual que antes, solo nombres actualizados)
document.addEventListener("DOMContentLoaded", async () => {
  const historiaDiv = document.getElementById("historia");
  const opcionesDiv = document.getElementById("opciones");

  const preferenciasJSON = localStorage.getItem("preferenciasUsuario");
  if (!preferenciasJSON) {
    historiaDiv.textContent = "No se encontraron preferencias. Regresa a la página de personalización.";
    return;
  }

  const preferencias = JSON.parse(preferenciasJSON);

  const apiKey = "3mC5a9IysvBHTkYqHTLWLiExLgQFVLK5qShlX9V8";

  const generador = new GeneracionIA(apiKey);

  historiaDiv.textContent = "Generando historia...";
  try {
    await generador.inicializarHistoria(preferencias);
    historiaDiv.textContent = generador._historia;

    const mostrarOpciones = () => {
      opcionesDiv.innerHTML = "";
      const opciones = generador.obtenerOpciones();
      if (opciones.length === 0) {
        opcionesDiv.textContent = "No hay opciones disponibles para continuar la historia.";
        return;
      }
      opciones.forEach(opcion => {
        const btn = document.createElement("button");
        btn.textContent = opcion.texto;
        btn.onclick = async () => {
          btn.disabled = true;
          historiaDiv.textContent += "\n\n>>> Elegiste: " + opcion.texto + "\n\nGenerando continuación...";
          try {
            await generador.elegirOpcion(opcion.id);
            historiaDiv.textContent = generador._historia;
            mostrarOpciones();
          } catch (e) {
            alert("Error generando la historia: " + e.message);
          }
        };
        opcionesDiv.appendChild(btn);
      });
    };

    mostrarOpciones();
  } catch (e) {
    historiaDiv.textContent = "Error generando la historia: " + e.message;
  }
});
