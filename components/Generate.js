import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

// ---------------- UTILS ----------------

const getFormattedDate = () => {
  const date = new Date();
  return `${String(date.getDate()).padStart(2, "0")}_${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}_${date.getFullYear()}`;
};

const capitalizeFirstLetter = (str) =>
  str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const cleanProgramName = (nombre) => {
  let prefijos = [
    "tecnologia en ",
    "ingenieria en ",
    "ingenieria de ",
    "ingenieria ",
  ].map((p) => p.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

  let limpio = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const p of prefijos) {
    if (limpio.startsWith(p)) {
      limpio = limpio.replace(p, "").trim();
      break;
    }
  }

  return limpio
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
};
const capitalLetter = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .split(/\s+/)
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
// ---------------- HTML GENERATOR ----------------

const generarHTML = (
  dataArray,
  programa,
  tipoInforme,
  corteInicial,
  corteFinal,
) => {
  //console.log(programa, tipoInforme, corteInicial, corteFinal);
  const informeTitulo =
    {
      graduados: "Informe de estudiantes Graduados",
      desertados: "Informe de estudiantes Desertados",
      retenidos: "Informe de estudiantes Retenidos",
      general: "Informe General de Estudiantes",
      inactivos: "Informe de estudiantes Inactivos",
    }[tipoInforme] || "Informe";

  const notaTexto = {
    graduados: `Este Informe contiene los estudiantes <strong>GRADUADOS</strong>del programa ${programa.programa} que ingresaron en el período <strong>${dataArray[0].periodos.codigo_periodo}</strong>.`,
    desertados: `Este Informe contiene los estudiantes <strong>DESERTADOS</strong>del programa ${programa.programa} que ingresaron en el período <strong>${dataArray[0].periodos.codigo_periodo}</strong>.`,
    retenidos: `Este Informe contiene los estudiantes <strong>RETENIDOS</strong>del programa ${programa.programa} que ingresaron en el período <strong>${dataArray[0].periodos.codigo_periodo}</strong>.`,
    general: `Este Informe contiene <strong>TODOS</strong> los estudiantes del programa ${programa.programa} que ingresaron en el período <strong>${dataArray[0].periodos.codigo_periodo}</strong>.`,
    inactivos: `Este Informe contiene los estudiantes <strong>INACTIVOS</strong>del programa ${programa.programa} que ingresaron en el período <strong>${dataArray[0].periodos.codigo_periodo}</strong>.`,
  }[tipoInforme];

  return `
      <html>
      <head>
      <style>
        body { font-family: Arial; padding: 1em; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: .3em; }
        th { background: #2488E7; color: white; }
      </style>
      </head>
      <body>
        <h2 style="text-align:center;">${informeTitulo}</h2>
        <p><strong>Nota:</strong> ${notaTexto}</p>

        <table>
          <thead>
            <tr><th>Documento</th><th>Nombre Completo</th><th>Celular</th><th>Correo electrónico</th></tr>
          </thead>
          <tbody>
            ${dataArray
              .map(
                (d) => `
                <tr>
                  <td>${d.estudiantes.numero_documento || "N/A"}</td>
                  <td>${capitalLetter(d.estudiantes.nombre_completo) || "N/A"}</td>
                  <td>${d.estudiantes.celular || "N/A"}</td>
                  <td>${d.estudiantes.correo_electronico || "N/A"}</td>
                </tr>`,
              )
              .join("")}
          </tbody>
        </table>

        <p><strong>Total:</strong> ${dataArray.length}</p>
      </body>
      </html>
    `;
};

// ---------------- MAIN FUNCTION ----------------

export const generatePDF = async (
  dataArray,
  programa,
  tipoInforme,
  corteInicial,
  corteFinal,
) => {
  try {
    const html = generarHTML(
      dataArray,
      programa,
      tipoInforme,
      corteInicial,
      corteFinal,
    );

    // 1. Generar PDF temporal
    const { uri } = await Print.printToFileAsync({ html });

    const formattedDate = getFormattedDate();
    const cleanedProgramName = cleanProgramName(programa.programa);
    const fileName = `Informe_${tipoInforme}_${cleanedProgramName}_${formattedDate}.pdf`;

    // 2. Crear ubicación final en cache
    const finalPath = `${FileSystem.cacheDirectory}${fileName}`;

    // 3. Copiar archivo (NO mover — más estable)
    await FileSystem.copyAsync({
      from: uri,
      to: finalPath,
    });

    //console.log("PDF generado en:", finalPath);

    // 4. Compartir
    await Sharing.shareAsync(finalPath);

    return finalPath;
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    throw error;
  }
};
