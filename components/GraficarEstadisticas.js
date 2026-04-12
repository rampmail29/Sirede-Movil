import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { BarChart } from "react-native-gifted-charts";

const Graficar = ({ route, navigation }) => {
  const {
    selectedCorteInicial,
    selectedCorteFinal,
    programaSeleccionado,
    datosBackend,
  } = route?.params || {};
  console.log("selectedCorteInicial en GraficarEstadisticas recibidos:", selectedCorteInicial); 
  if(!(route?.params)){return;}

  // Puedes usar valores por defecto
  const corteInicial = selectedCorteInicial || null;
  const corteFinal = selectedCorteFinal || null;
  const programa = programaSeleccionado || null;
  const datos = datosBackend || [];
  const porcentajeGraduados = (
    (datosBackend.totalGra * 100) /
    datosBackend.totalEstp
  ).toFixed(2);
  const porcentajeDesertados = (
    (datosBackend.totalDes * 100) /
    datosBackend.totalEstp
  ).toFixed(2);
  const porcentajeRetirados = (
    (datosBackend.totalRet * 100) /
    datosBackend.totalEstp
  ).toFixed(2);
  const totalMasculino =
    datosBackend.graPorSexo.Masculino +
    datosBackend.retPorSexo.Masculino +
    datosBackend.desPorSexo.Masculino;
  const totalFemenino =
    datosBackend.graPorSexo.Femenino +
    datosBackend.retPorSexo.Femenino +
    datosBackend.desPorSexo.Femenino;

  const porcentajeGraMasculino = (
    (datosBackend.graPorSexo.Masculino / totalMasculino) *
    100
  ).toFixed(2);
  const porcentajeGraFemenino = (
    (datosBackend.graPorSexo.Femenino / totalFemenino) *
    100
  ).toFixed(2);
  const porcentajeRetMasculino = (
    (datosBackend.retPorSexo.Masculino / totalMasculino) *
    100
  ).toFixed(2);
  const porcentajeRetFemenino = (
    (datosBackend.retPorSexo.Femenino / totalFemenino) *
    100
  ).toFixed(2);
  const porcentajeDesMasculino = (
    (datosBackend.desPorSexo.Masculino / totalMasculino) *
    100
  ).toFixed(2);
  const porcentajeDesFemenino = (
    (datosBackend.desPorSexo.Femenino / totalFemenino) *
    100
  ).toFixed(2);

  const grupos = {
    masculino: {
      nombre: "los hombres",
      nombreSingular: "hombres",
      total: totalMasculino,

      porcentajeGraduados: porcentajeGraMasculino,
      cantidadGraduados: datosBackend.graPorSexo.Masculino,

      porcentajeDesertores: porcentajeDesMasculino,
      cantidadDesertores: datosBackend.desPorSexo.Masculino,

      porcentajeRetenidos: porcentajeRetMasculino,
      cantidadRetenidos: datosBackend.retPorSexo.Masculino,
    },
    femenino: {
      nombre: "las mujeres",
      nombreSingular: "mujeres",
      total: totalFemenino,

      porcentajeGraduados: porcentajeGraFemenino,
      cantidadGraduados: datosBackend.graPorSexo.Femenino,

      porcentajeDesertores: porcentajeDesFemenino,
      cantidadDesertores: datosBackend.desPorSexo.Femenino,

      porcentajeRetenidos: porcentajeRetFemenino,
      cantidadRetenidos: datosBackend.retPorSexo.Femenino,
    },
  };

  // Determinar el grupo menor y mayor para graduados
  const [grupoMenorGraduados, grupoMayorGraduados] =
    grupos.masculino.porcentajeGraduados > grupos.femenino.porcentajeGraduados
      ? [grupos.femenino, grupos.masculino]
      : [grupos.masculino, grupos.femenino];

  // Frase dinámica para "X de cada Y" para graduados
  const ratioMenorGraduados = Math.round(
    (grupoMenorGraduados.cantidadGraduados / grupoMenorGraduados.total) * 10
  );
  const ratioMayorGraduados = Math.round(
    (grupoMayorGraduados.cantidadGraduados / grupoMayorGraduados.total) * 10
  );

  // Determinar el grupo menor y mayor para desertores
  const [grupoMenorDesertores, grupoMayorDesertores] =
    grupos.masculino.cantidadDesertores > grupos.femenino.cantidadDesertores
      ? [grupos.femenino, grupos.masculino]
      : [grupos.masculino, grupos.femenino];

  // Frase dinámica para "X de cada Y" para desertores
  const ratioMenorDesertores = Math.round(
    (grupoMenorDesertores.cantidadDesertores / grupoMenorDesertores.total) * 10
  );
  const ratioMayorDesertores = Math.round(
    (grupoMayorDesertores.cantidadDesertores / grupoMayorDesertores.total) * 10
  );

  // Determinar el grupo menor y mayor para retenidos
  const [grupoMenorRetenidos, grupoMayorRetenidos] =
    grupos.masculino.cantidadRetenidos > grupos.femenino.cantidadRetenidos
      ? [grupos.femenino, grupos.masculino]
      : [grupos.masculino, grupos.femenino];

  // Frase dinámica para "X de cada Y" para retenidos
  const ratioMenorRetenidos = Math.round(
    (grupoMenorRetenidos.cantidadRetenidos / grupoMenorRetenidos.total) * 10
  );
  const ratioMayorRetenidos = Math.round(
    (grupoMayorRetenidos.cantidadRetenidos / grupoMayorRetenidos.total) * 10
  );

  const pieData = [
    {
      value: datosBackend.totalGra,
      color: "#C3D730",
      gradientCenterColor: "#A2B929",
      focused: true,
    },
    {
      value: datosBackend.totalRet,
      color: "#FF9F33",
      gradientCenterColor: "#FF9F33",
    },
    {
      value: datosBackend.totalDes,
      color: "#6D100A",
      gradientCenterColor: "#5A0D08",
    },
  ];

  const barDataGraduados = [
    {
      value: parseFloat(porcentajeGraMasculino),
      label: "Graduados\nmasculinos",
      frontColor: "#C3D730",
      topLabelComponent: () => (
        <Text
          style={{
            color: "#C3D730",
            fontSize: 15,
            marginBottom: 6,
            fontFamily: "Montserrat-Bold",
          }}
        >
          {" "}
          {parseFloat(porcentajeGraMasculino)}%
        </Text>
      ),
      labelTextStyle: {
        fontFamily: "Montserrat-Bold",
        color: "#132F20",
        fontSize: 12,
      },
    },

    {
      value: parseFloat(porcentajeGraFemenino),
      label: "Graduados \nfemeninos",
      frontColor: "#C3D730",
      topLabelComponent: () => (
        <Text
          style={{
            color: "#C3D730",
            fontSize: 15,
            marginBottom: 6,
            fontFamily: "Montserrat-Bold",
          }}
        >
          {" "}
          {parseFloat(porcentajeGraFemenino)}%
        </Text>
      ),
      labelTextStyle: {
        fontFamily: "Montserrat-Bold",
        color: "#132F20",
        fontSize: 12,
      },
    },
  ];

  const barDataRetenidos = [
    {
      value: parseFloat(porcentajeRetMasculino),
      label: "Retenidos\nmasculinos",
      frontColor: "#fcb552",
      topLabelComponent: () => (
        <Text
          style={{
            color: "#fcb552",
            fontSize: 15,
            marginBottom: 6,
            fontFamily: "Montserrat-Bold",
          }}
        >
          {" "}
          {parseFloat(porcentajeRetMasculino)}%
        </Text>
      ),
      labelTextStyle: {
        fontFamily: "Montserrat-Bold",
        color: "#132F20",
        fontSize: 12,
      },
    },

    {
      value: parseFloat(porcentajeRetFemenino),
      label: "Retenidos\nfemeninos",
      frontColor: "#fcb552",
      topLabelComponent: () => (
        <Text
          style={{
            color: "#fcb552",
            fontSize: 15,
            marginBottom: 6,
            fontFamily: "Montserrat-Bold",
          }}
        >
          {" "}
          {parseFloat(porcentajeRetFemenino)}%
        </Text>
      ),
      labelTextStyle: {
        fontFamily: "Montserrat-Bold",
        color: "#132F20",
        fontSize: 12,
      },
    },
  ];
  const barDataDesertados = [
    {
      value: parseFloat(porcentajeDesMasculino),
      label: "Desertados\nmasculinos",
      frontColor: "#fd563f",
      topLabelComponent: () => (
        <Text
          style={{
            color: "#fd563f",
            fontSize: 15,
            marginBottom: 6,
            fontFamily: "Montserrat-Bold",
          }}
        >
          {" "}
          {parseFloat(porcentajeDesMasculino)}%
        </Text>
      ),
      labelTextStyle: {
        fontFamily: "Montserrat-Bold",
        color: "#132F20",
        fontSize: 12,
      },
    },

    {
      value: parseFloat(porcentajeDesFemenino),
      label: "Desertados\nfemeninos",
      frontColor: "#fd563f",
      topLabelComponent: () => (
        <Text
          style={{
            color: "#fd563f",
            fontSize: 15,
            marginBottom: 6,
            fontFamily: "Montserrat-Bold",
          }}
        >
          {" "}
          {parseFloat(porcentajeDesFemenino)}%
        </Text>
      ),
      labelTextStyle: {
        fontFamily: "Montserrat-Bold",
        color: "#132F20",
        fontSize: 12,
      },
    },
  ];

  const renderDot = (color) => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 10,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    return (
      <>
        <View style={styles.legendGeneral}>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              {renderDot("#C3D730")}
              <Text
                style={{ color: "#34531F", fontFamily: "Montserrat-Medium" }}
              >
                Graduados: {datosBackend.totalGra}
              </Text>
            </View>
            <View style={styles.legendItem}>
              {renderDot("#FF9F33")}
              <Text
                style={{ color: "#34531F", fontFamily: "Montserrat-Medium" }}
              >
                Retenidos: {datosBackend.totalRet}
              </Text>
            </View>
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              {renderDot("#6D100A")}
              <Text
                style={{ color: "#34531F", fontFamily: "Montserrat-Medium" }}
              >
                Desertados: {datosBackend.totalDes}
              </Text>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <ImageBackground
        source={require("../assets/fondoinicio.jpg")}
        style={styles.backgroundImage}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Resultados del análisis</Text>
          <Text style={styles.subtitle}>Estadistica General</Text>
          <View style={styles.pieChartContainer}>
            <PieChart
              data={pieData}
              donut
              showGradient
              focusOnPress
              toggleFocusOnPress={false}
              radius={100}
              innerRadius={70}
              innerCircleColor={"#132F20"}
              centerLabelComponent={() => {
                return (
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {porcentajeGraduados}%
                    </Text>
                    <Text style={{ fontSize: 14, color: "white" }}>
                      Graduados
                    </Text>
                  </View>
                );
              }}
            />
            {renderLegendComponent()}
          </View>
          <View style={styles.resultadosContainer}>
            <Text style={styles.resultadosText}>
              Total de Estudiantes: {datosBackend.totalEstp}
            </Text>
            <Text style={styles.notaText1}>
              <Text style={styles.generalText}>
                En el rango analizado se evidencia que desde el corte inicial
              </Text>
              <Text style={styles.keywordText}>
                {` ${selectedCorteInicial} `}
              </Text>
              <Text style={styles.generalText}>hasta el corte final</Text>
              <Text style={styles.keywordText}>
                {` ${selectedCorteFinal} `}
              </Text>
              <Text style={styles.generalText}>del programa académico</Text>
              <Text style={styles.keywordText}>
                {` ${programaSeleccionado}, `}
              </Text>
              <Text style={styles.generalText}>el</Text>
              <Text style={styles.keywordText}>
                {` ${porcentajeGraduados}% `}
              </Text>
              <Text style={styles.generalText}>
                de los estudiantes logró obtener su título profesional, el
              </Text>
              <Text style={styles.keywordText}>
                {` ${porcentajeRetirados}% `}
              </Text>
              <Text style={styles.generalText}>
                de estudiantes se retiró de la universidad y el
              </Text>
              <Text style={styles.keywordText}>
                {` ${porcentajeDesertados}% `}
              </Text>
              <Text style={styles.generalText}>de estudiantes desertó.</Text>
              {"\n"}
            </Text>

            <Text style={styles.subtitle}> Estadistica por Genero </Text>
            <Text style={styles.notaText2}>
              <Text style={styles.generalText}>
                Este es un análisis gráfico que muestra la distribución
                porcentual de los estudiantes según su género, permitiendo
                visualizar tendencias y diferencias entre los grupos.{" "}
              </Text>
            </Text>
            <Text style={styles.notaText2}>
              <Text style={styles.generalText}>
                En la carrera y cortes academicos seleccionados, se encontraron
                un total de
                <Text style={styles.keywordText}>
                  {` ${totalMasculino} hombres`}
                </Text>{" "}
                y{" "}
                <Text style={styles.keywordText}>
                  {`${totalFemenino} mujeres`}
                </Text>
                , con base en esta informacion se puede hacer el siguiente
                analisis:{" "}
              </Text>
            </Text>

            <View style={styles.barChartContainer}>
              <BarChart
                data={barDataGraduados}
                barWidth={50}
                showValueOnTopOfBar={true}
                isAnimated={true}
                spacing={40}
                barBorderRadius={5}
                xAxisTextNumberOfLines={2}
                yAxisTextStyle={{
                  color: "#000",
                  fontFamily: "Montserrat-Medium",
                  fontSize: 12,
                }}
              />
            </View>

            {parseFloat(grupoMenorGraduados.porcentajeGraduados) === 0 &&
            parseFloat(grupoMayorGraduados.porcentajeGraduados) === 0 &&
            ratioMenorGraduados === 0 &&
            ratioMayorGraduados === 0 ? (
              <Text style={styles.notaText2}>
                <Text style={styles.generalText}>
                  Ningún estudiante de{" "}
                  <Text style={styles.keywordText}>
                    {grupoMenorGraduados.nombre}
                  </Text>{" "}
                  ni de{" "}
                  <Text style={styles.keywordText}>
                    {grupoMayorGraduados.nombre}
                  </Text>{" "}
                  se ha graduado durante este período, lo cual es una situación
                  preocupante que requiere atención inmediata para mejorar la
                  tasa de graduación.
                </Text>
              </Text>
            ) : (
              <Text style={styles.notaText2}>
                <Text style={styles.generalText}>
                  Un{" "}
                  <Text style={styles.keywordText}>
                    {parseFloat(grupoMenorGraduados.porcentajeGraduados)}%
                  </Text>{" "}
                  de {grupoMenorGraduados.nombre}{" "}
                  <Text style={styles.keywordText}>
                    ({grupoMenorGraduados.cantidadGraduados} de{" "}
                    {grupoMenorGraduados.total})
                  </Text>{" "}
                  lograron <Text style={styles.keywordText}>graduarse</Text>,
                  mientras que un{" "}
                  <Text style={styles.keywordText}>
                    {parseFloat(grupoMayorGraduados.porcentajeGraduados)}%
                  </Text>{" "}
                  de {grupoMayorGraduados.nombreSingular}{" "}
                  <Text style={styles.keywordText}>
                    ({grupoMayorGraduados.cantidadGraduados} de{" "}
                    {grupoMayorGraduados.total})
                  </Text>{" "}
                  alcanzaron la graduación. Este análisis sugiere que
                  aproximadamente,{" "}
                  <Text style={styles.keywordText}>
                    {ratioMenorGraduados} de cada 10{" "}
                    {grupoMenorGraduados.nombreSingular}
                  </Text>{" "}
                  completaron sus estudios, frente a{" "}
                  <Text style={styles.keywordText}>
                    {ratioMayorGraduados} de cada 10{" "}
                    {grupoMayorGraduados.nombreSingular}
                  </Text>
                  . Las cifras destacan una tendencia de finalización académica{" "}
                  <Text style={styles.keywordText}>
                    favorable para {grupoMayorGraduados.nombre}
                  </Text>
                  .
                </Text>
              </Text>
            )}

            <View style={styles.barChartContainer}>
              <BarChart
                data={barDataRetenidos}
                barWidth={50}
                showValueOnTopOfBar={true}
                isAnimated={true}
                spacing={40}
                barBorderRadius={5}
                xAxisTextNumberOfLines={2}
                yAxisTextStyle={{
                  color: "#000",
                  fontFamily: "Montserrat-Medium",
                  fontSize: 12,
                }}
              />
            </View>

            {parseFloat(grupoMenorRetenidos.porcentajeRetenidos) === 0 &&
            parseFloat(grupoMayorRetenidos.porcentajeRetenidos) === 0 &&
            ratioMenorRetenidos === 0 &&
            ratioMayorRetenidos === 0 ? (
              <Text style={styles.notaText2}>
                <Text style={styles.generalText}>
                  Afortunadamente, tanto{" "}
                  <Text style={styles.keywordText}>
                    {grupoMenorRetenidos.nombre}
                  </Text>{" "}
                  como{" "}
                  <Text style={styles.keywordText}>
                    {grupoMayorRetenidos.nombre}
                  </Text>{" "}
                  no tuvieron estudiantes retenidos durante este período.
                </Text>
              </Text>
            ) : (
              <Text style={styles.notaText2}>
                <Text style={styles.generalText}>
                  Un{" "}
                  <Text style={styles.keywordText}>
                    {parseFloat(grupoMenorRetenidos.porcentajeRetenidos)}%
                  </Text>{" "}
                  de {grupoMenorRetenidos.nombre}{" "}
                  <Text style={styles.keywordText}>
                    ({grupoMenorRetenidos.cantidadRetenidos} de{" "}
                    {grupoMenorRetenidos.total})
                  </Text>{" "}
                  quedaron en<Text style={styles.keywordText}> retención</Text>,
                  mientras que un{" "}
                  <Text style={styles.keywordText}>
                    {parseFloat(grupoMayorRetenidos.porcentajeRetenidos)}%
                  </Text>{" "}
                  de {grupoMayorRetenidos.nombreSingular}{" "}
                  <Text style={styles.keywordText}>
                    ({grupoMayorRetenidos.cantidadRetenidos} de{" "}
                    {grupoMayorRetenidos.total})
                  </Text>{" "}
                  enfrentaron la misma situación. Esto sugiere que
                  aproximadamente{" "}
                  <Text style={styles.keywordText}>
                    {ratioMenorRetenidos} de cada 10{" "}
                    {grupoMenorRetenidos.nombreSingular}
                  </Text>{" "}
                  continúan en riesgo de no completar sus estudios, frente a{" "}
                  <Text style={styles.keywordText}>
                    {ratioMayorRetenidos} de cada 10{" "}
                    {grupoMayorRetenidos.nombreSingular}
                  </Text>
                  . Estos resultados destacan un{" "}
                  <Text style={styles.keywordText}>
                    problema preocupante de retención entre{" "}
                    {grupoMayorRetenidos.nombre}
                  </Text>
                  .
                </Text>
              </Text>
            )}

            <View style={styles.barChartContainer}>
              <BarChart
                data={barDataDesertados}
                barWidth={50}
                showValueOnTopOfBar={true}
                isAnimated={true}
                spacing={40}
                barBorderRadius={5}
                xAxisTextNumberOfLines={2}
                yAxisTextStyle={{
                  color: "#000",
                  fontFamily: "Montserrat-Medium",
                  fontSize: 12,
                }}
              />
            </View>
            {parseFloat(grupoMenorDesertores.porcentajeDesertores) === 0 &&
            parseFloat(grupoMayorDesertores.porcentajeDesertores) === 0 ? (
              <Text style={styles.notaText2}>
                <Text style={styles.generalText}>
                  Excelente noticia: Ningún estudiante de{" "}
                  <Text style={styles.keywordText}>
                    {grupoMenorDesertores.nombre}
                  </Text>{" "}
                  ni de{" "}
                  <Text style={styles.keywordText}>
                    {grupoMayorDesertores.nombre}
                  </Text>{" "}
                  ha desertado en este período. ¡Esto demuestra un fuerte
                  compromiso con la continuidad académica!
                </Text>
              </Text>
            ) : parseFloat(grupoMenorDesertores.porcentajeDesertores) ===
                parseFloat(grupoMayorDesertores.porcentajeDesertores) &&
              parseFloat(grupoMenorDesertores.porcentajeDesertores) !== 0 ? (
              <Text style={styles.notaText2}>
                <Text style={styles.generalText}>
                  Tanto{" "}
                  <Text style={styles.keywordText}>
                    {grupoMenorDesertores.nombre}
                  </Text>{" "}
                  como{" "}
                  <Text style={styles.keywordText}>
                    {grupoMayorDesertores.nombreSingular}
                  </Text>{" "}
                  enfrentan un serio desafío, ya que ambos han registrado una
                  tasa de deserción del{" "}
                  <Text style={styles.keywordText}>
                    {parseFloat(grupoMenorDesertores.porcentajeDesertores)}%
                  </Text>
                  . Este dato refleja una tendencia preocupante que afecta de
                  igual manera a hombres y mujeres, lo que indica que no hay un
                  grupo significativamente más vulnerable. Sin embargo, es
                  alarmante que{" "}
                  <Text style={styles.keywordText}>
                    {grupoMenorDesertores.cantidadDesertores} de{" "}
                    {grupoMenorDesertores.total}
                  </Text>{" "}
                  estudiantes en cada grupo hayan desertado. Es crucial
                  implementar medidas urgentes para abordar esta problemática y
                  mejorar las condiciones académicas.
                </Text>
              </Text>
            ) : (
              <Text style={styles.notaText2}>
                <Text style={styles.generalText}>
                  Un{" "}
                  <Text style={styles.keywordText}>
                    {parseFloat(grupoMenorDesertores.porcentajeDesertores)}%
                  </Text>{" "}
                  de {grupoMenorDesertores.nombre}{" "}
                  <Text style={styles.keywordText}>
                    ({grupoMenorDesertores.cantidadDesertores} de{" "}
                    {grupoMenorDesertores.total})
                  </Text>{" "}
                  desertaron, mientras que un{" "}
                  <Text style={styles.keywordText}>
                    {parseFloat(grupoMayorDesertores.porcentajeDesertores)}%
                  </Text>{" "}
                  de {grupoMayorDesertores.nombreSingular}{" "}
                  <Text style={styles.keywordText}>
                    ({grupoMayorDesertores.cantidadDesertores} de{" "}
                    {grupoMayorDesertores.total})
                  </Text>{" "}
                  abandonaron sus estudios. Este análisis indica que
                  aproximadamente{" "}
                  <Text style={styles.keywordText}>
                    {ratioMenorDesertores} de cada 10{" "}
                    {grupoMenorDesertores.nombreSingular}
                  </Text>{" "}
                  no continuaron con su formación, en comparación con{" "}
                  <Text style={styles.keywordText}>
                    {ratioMayorDesertores} de cada 10{" "}
                    {grupoMayorDesertores.nombreSingular}
                  </Text>
                  , lo cual es una{" "}
                  <Text style={styles.keywordText}>
                    señal preocupante para {grupoMayorDesertores.nombre}
                  </Text>
                  .
                </Text>
              </Text>
            )}

            <Text style={styles.notaText1}>
              <Text style={styles.keywordText}>Nota:</Text>{" "}
              <Text style={styles.generalText}>
                La diferencia entre estudiantes "
                <Text style={styles.keywordText}>retenidos</Text>", "
                <Text style={styles.keywordText}>desertores</Text>" y "
                <Text style={styles.keywordText}>graduados</Text>" se refiere a
                su estado académico o situación en la institución educativa:
              </Text>
            </Text>

            <View style={styles.notaContainer}>
              <Text style={styles.notaText}>
                <Text style={styles.generalText}>
                  <Text style={styles.keywordText}>Graduados:</Text> Son los
                  estudiantes que han completado satisfactoriamente todos los Se
                  refiere a los estudiantes que continúan matriculados en la
                  institución pero que no han logrado avanzar satisfactoriamente
                  en su proceso educativo. Esto puede deberse a un rendimiento
                  académico deficiente, la repetición de cursos o cualquier otra
                  razón que haya impedido su progreso normal.
                </Text>
              </Text>
            </View>

            <View style={styles.notaContainer1}>
              <Text style={styles.notaText}>
                <Text style={styles.generalText}>
                  <Text style={styles.keywordText}>Retenidos:</Text> Se refiere
                  a los estudiantes que continúan matriculados en la institución
                  pero que no han logrado avanzar satisfactoriamente en su
                  proceso educativo. Esto puede deberse a un rendimiento
                  académico deficiente, la repetición de cursos o cualquier otra
                  razón que haya impedido su progreso normal.
                </Text>
              </Text>
            </View>

            <View style={styles.notaContainer2}>
              <Text style={styles.notaText}>
                <Text style={styles.generalText}>
                  <Text style={styles.keywordText}>Desertores:</Text> Son
                  aquellos estudiantes que abandonan la institución educativa
                  antes de completar su programa de estudios. Pueden hacerlo por
                  diversas razones, como problemas personales, dificultades
                  académicas, falta de interés, entre otros.
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 30,
  },
  title: {
    fontSize: 40,
    fontFamily: "Montserrat-Bold",
    alignSelf: "flex-start",
    marginBottom: 20,
    color: "#C3D730",
  },
  subtitle: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#132F20",
    marginBottom: 10,
  },
  pieChartContainer: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F0FFF2",
    borderColor: "#34531F",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 20,
    borderWidth: 3, // Ancho del borde
    borderColor: "#34531F", // Color del borde
    justifyContent: "center",
  },
  legendGeneral: {
    justifyContent: "center",
    marginTop: 20,
    justifyContent: "center",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: 180,
    justifyContent: "center",
  },
  resultadosContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  resultadosText: {
    fontSize: 15,
    fontFamily: "Montserrat-Medium",
    marginTop: -10,
    marginBottom: 10,
    color: "#132F20",
  },
  analisisText: {
    fontSize: 18,
    textAlign: "justify",
    fontFamily: "Montserrat-Medium",
  },
  notaText1: {
    fontSize: 18,
    textAlign: "justify",
    fontFamily: "Montserrat-Medium",
  },
  notaText2: {
    fontSize: 18,
    textAlign: "justify",
    fontFamily: "Montserrat-Medium",
    marginBottom: 10,
  },

  notaText: {
    fontSize: 18,
    padding: 20,
    textAlign: "justify",
    fontFamily: "Montserrat-Medium",
  },
  notaContainer: {
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: "#F8E9D4",
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#C3D730",
  },
  notaContainer1: {
    marginBottom: 20,
    backgroundColor: "#F8E9D4",
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#C3D730",
  },
  notaContainer2: {
    marginBottom: 100,
    backgroundColor: "#F8E9D4",
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "#C3D730",
  },
  keywordText: {
    fontFamily: "Montserrat-Bold",
    color: "#132F20",
  },
  generalText: {
    fontFamily: "Montserrat-Medium",
    color: "#132F20",
  },
  barChartContainer: {
    width: "100%",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F0FFF2",
    borderColor: "#34531F",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderWidth: 3,
  },
});

export default Graficar;
