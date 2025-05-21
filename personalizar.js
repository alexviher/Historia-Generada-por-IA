class PersonalizacionDTO {
  constructor(genero, tono, ambientacion, longitud) {
    this.genero = genero;
    this.tono = tono;
    this.ambientacion = ambientacion;
    this.longitud = longitud;
  }
}

class Personalizar {
  constructor() {
    this.preferencias = null;
  }

  capturarPreferencias(formData) {
    const genero = formData.get("genero").trim();
    const tono = formData.get("tono").trim();
    const ambientacion = formData.get("ambientacion").trim();
    const longitud = formData.get("longitud").trim();

    this.preferencias = new PersonalizacionDTO(genero, tono, ambientacion, longitud);
  }

  validarPreferencias() {
    return (
      this.preferencias &&
      this.preferencias.genero.length > 0 &&
      this.preferencias.tono.length > 0 &&
      this.preferencias.ambientacion.length > 0 &&
      this.preferencias.longitud.length > 0
    );
  }

  getPreferencias() {
    return this.preferencias;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formPersonalizacion");
  const inputs = form.querySelectorAll("input[type=text]");
  
  const mensajeErrorId = "mensaje-error-preferencias";

  function limpiarErrores() {
    const msgError = document.getElementById(mensajeErrorId);
    if (msgError) msgError.remove();

    inputs.forEach(input => {
      input.style.borderColor = "#ddd";
    });
  }

  function mostrarErrores(camposInvalidos) {
    limpiarErrores();
    
    camposInvalidos.forEach(name => {
      const input = form.querySelector(`input[name=${name}]`);
      if (input) input.style.borderColor = "#e74c3c";
    });

    const msgError = document.createElement("p");
    msgError.id = mensajeErrorId;
    msgError.textContent = "Por favor completa todos los campos marcados en rojo.";
    msgError.style.color = "#e74c3c";
    msgError.style.marginBottom = "15px";
    msgError.style.fontWeight = "600";
    form.prepend(msgError);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    limpiarErrores();

    const formData = new FormData(form);
    const personalizar = new Personalizar();
    personalizar.capturarPreferencias(formData);

    const prefs = personalizar.getPreferencias();
    const camposInvalidos = [];

    if (!prefs.genero) camposInvalidos.push("genero");
    if (!prefs.tono) camposInvalidos.push("tono");
    if (!prefs.ambientacion) camposInvalidos.push("ambientacion");
    if (!prefs.longitud) camposInvalidos.push("longitud");

    if (camposInvalidos.length === 0) {
      localStorage.setItem("preferenciasUsuario", JSON.stringify(prefs));
      window.location.href = "generacion.html";
    } else {
      mostrarErrores(camposInvalidos);
    }
  });
});
