import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Papa from 'papaparse';
import { showMessage } from 'react-native-flash-message';
import { FontAwesome5 } from '@expo/vector-icons';
import { CheckBox } from 'react-native-elements';
import { API_BASE_URL } from './Config';

const COLS_ESTUDIANTES = ['PEGE_DOCUMENTOIDENTIDAD', 'PROG_CODIGOICFES', 'PERIODO'];
const COLS_GRADUADOS   = ['numero_documento', 'nombre_programa', 'fecha_graduacion'];

const TIPO_OPTIONS = [
  { label: 'Tecnología', value: 'Tecnologia' },
  { label: 'Profesional', value: 'Profesional' },
];

const capitalizeFirstLetter = (str) =>
  (str || '')
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const CargarCSV = () => {
  // ── Modo: null | 'estudiantes' | 'graduados' ─────────────────────────────────
  const [modo, setModo] = useState(null);

  // ── Estado de archivo (compartido) ───────────────────────────────────────────
  const [csvData,        setCsvData]        = useState(null);
  const [fileName,       setFileName]       = useState('');
  const [isModalVisible, setModalVisible]   = useState(false);

  // ── Estado exclusivo de modo Estudiantes ─────────────────────────────────────
  const [programas,          setProgramas]          = useState([]);
  const [programasFiltrados, setProgramasFiltrados] = useState([]);
  const [parsedSnies,        setParsedSnies]        = useState('');
  const [selectedOption,     setSelectedOption]     = useState('');
  const [selectedCareers,    setSelectedCareers]    = useState([]);
  const [showRelacion,       setShowRelacion]       = useState(null);
  const [mostrarTipoSel,     setMostrarTipoSel]     = useState(false);
  const [tipoConfirmado,     setTipoConfirmado]     = useState(false);
  const [verificando,        setVerificando]        = useState(false);

  // ── Reset ─────────────────────────────────────────────────────────────────────
  const resetFile = () => {
    setCsvData(null);
    setFileName('');
    setModalVisible(false);
    setParsedSnies('');
    setSelectedOption('');
    setSelectedCareers([]);
    setShowRelacion(null);
    setMostrarTipoSel(false);
    setTipoConfirmado(false);
    setVerificando(false);
  };

  const seleccionarModo = (nuevoModo) => {
    resetFile();
    setProgramas([]);
    setProgramasFiltrados([]);
    setModo(nuevoModo);
  };

  const volver = () => {
    resetFile();
    setProgramas([]);
    setProgramasFiltrados([]);
    setModo(null);
  };

  // ── Fetch programas (solo modo Estudiantes) ────────────────────────────────
  useEffect(() => {
    if (modo !== 'estudiantes') return;
    const fetchProgramas = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/programas`);
        const data = await response.json();
        const mapped = data.map((el) => ({
          cod_snies: String(el.codigo_snies),
          programa:  el.nombre,
          tipo:      el.tipos_programa?.nombre,
          id:        el.id_carrera,
        }));
        setProgramas(mapped);
      } catch {
        showMessage({
          message: 'Error',
          description: 'No se pudo conectar con la base de datos.',
          type: 'danger',
          icon: 'danger',
          duration: 3000,
        });
      }
    };
    fetchProgramas();
  }, [modo]);

  // ── Verificar programa por SNIES cuando carga el CSV ─────────────────────────
  useEffect(() => {
    if (modo !== 'estudiantes' || !parsedSnies || programas.length === 0) return;

    const encontrado = programas.find((p) => p.cod_snies === parsedSnies);
    if (encontrado) {
      setSelectedOption(encontrado.tipo || '');
      setMostrarTipoSel(false);
      setProgramasFiltrados(programas.filter((p) => p.cod_snies !== parsedSnies));
    } else {
      setMostrarTipoSel(true);
      setProgramasFiltrados(programas);
    }
    setVerificando(false);
  }, [parsedSnies, programas]);

  // ── Selector de archivo ────────────────────────────────────────────────────────
  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'text/csv' });
      if (res.canceled) {
        showMessage({
          message: 'Advertencia',
          description: 'Se canceló la selección del archivo.',
          type: 'warning',
          icon: 'warning',
          position: 'top',
          duration: 3000,
        });
        return;
      }

      const { uri, name } = res.assets[0];
      const csvContent = await (await fetch(uri)).text();

      Papa.parse(csvContent, {
        header: true,
        complete: (results) => {
          const rows = results.data.filter((r) =>
            Object.values(r).some((v) => String(v).trim() !== '')
          );

          if (rows.length === 0) {
            showMessage({
              message: 'Archivo vacío',
              description: 'El archivo no contiene registros.',
              type: 'danger',
              icon: 'danger',
              position: 'top',
              duration: 3000,
            });
            return;
          }

          const columnas = Object.keys(rows[0]);
          const requeridas = modo === 'estudiantes' ? COLS_ESTUDIANTES : COLS_GRADUADOS;
          const faltantes = requeridas.filter((c) => !columnas.includes(c));

          if (faltantes.length > 0) {
            showMessage({
              message: 'Formato incorrecto',
              description: `Columnas faltantes: ${faltantes.join(', ')}`,
              type: 'danger',
              icon: 'danger',
              position: 'top',
              duration: 6000,
            });
            return;
          }

          // Reiniciar estado de archivo antes de asignar nuevo
          resetFile();
          setCsvData(rows);
          setFileName(name);

          if (modo === 'estudiantes') {
            setVerificando(true);
            setParsedSnies(String(rows[0]?.PROG_CODIGOICFES || ''));
          }
        },
        error: () => {
          showMessage({
            message: 'Error',
            description: 'Error al leer el archivo CSV.',
            type: 'danger',
            icon: 'danger',
            position: 'top',
            duration: 3000,
          });
        },
      });
    } catch {
      showMessage({
        message: 'Error',
        description: 'Error al seleccionar el archivo.',
        type: 'danger',
        icon: 'danger',
        position: 'top',
        duration: 3000,
      });
    }
  };

  // ── Carga ──────────────────────────────────────────────────────────────────────
  const upload = async () => {
    setModalVisible(false);
    if (!csvData || csvData.length === 0) return;

    try {
      const endpoint =
        modo === 'estudiantes'
          ? `${API_BASE_URL}/api/cargageneral`
          : `${API_BASE_URL}/api/carga_graduados`;

      const body =
        modo === 'estudiantes'
          ? JSON.stringify({ csvData, selectedOption, selectedCareers })
          : JSON.stringify(csvData);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      const result = await response.json();

      if (result.success) {
        showMessage({
          message: 'Carga exitosa',
          description: `Se procesaron ${csvData.length} registros con éxito.`,
          type: 'success',
          icon: 'success',
          position: 'top',
          duration: 4000,
        });
        resetFile();
      } else {
        showMessage({
          message: 'Error en la carga',
          description: result.message || 'Hubo un error al procesar el archivo.',
          type: 'danger',
          icon: 'danger',
          position: 'top',
          duration: 5000,
        });
      }
    } catch {
      showMessage({
        message: 'Error en el servidor',
        description: 'No se pudo enviar los datos al servidor.',
        type: 'danger',
        icon: 'danger',
        position: 'top',
        duration: 3000,
      });
    }
  };

  const puedeCargar =
    csvData &&
    (modo === 'graduados' || (modo === 'estudiantes' && selectedOption));

  // ─────────────────────────────────────────────────────────────────────────────
  // Render: pantalla de selección de modo
  // ─────────────────────────────────────────────────────────────────────────────
  if (modo === null) {
    return (
      <ImageBackground
        source={require('../assets/fondoinicio.jpg')}
        style={styles.backgroundImage}
      >
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Carga de datos</Text>
          <Text style={styles.subtitle}>
            Seleccione el tipo de archivo que desea cargar:
          </Text>

          <TouchableOpacity
            style={styles.modoButton}
            onPress={() => seleccionarModo('estudiantes')}
          >
            <FontAwesome5 name="users" size={44} color="#132F20" />
            <Text style={styles.modoButtonTitle}>Estudiantes</Text>
            <Text style={styles.modoButtonDesc}>
              Carga masiva de registros de matrícula
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modoButton}
            onPress={() => seleccionarModo('graduados')}
          >
            <FontAwesome5 name="graduation-cap" size={44} color="#132F20" />
            <Text style={styles.modoButtonTitle}>Graduados</Text>
            <Text style={styles.modoButtonDesc}>
              Registro de estudiantes que se graduaron
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render: flujo de carga
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../assets/fondoinicio.jpg')}
      style={styles.backgroundImage}
    >
      <ScrollView style={styles.container}>

        {/* Botón volver */}
        <TouchableOpacity style={styles.backButton} onPress={volver}>
          <FontAwesome5 name="arrow-left" size={16} color="#132F20" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {modo === 'estudiantes' ? 'Cargar Estudiantes' : 'Cargar Graduados'}
        </Text>
        <Text style={styles.subtitle}>
          {modo === 'estudiantes'
            ? 'Seleccione un archivo CSV con los datos de matrícula.'
            : 'Seleccione un archivo CSV con los datos de graduados.'}
        </Text>

        {/* Selector de archivo */}
        <TouchableOpacity style={styles.button} onPress={pickDocument}>
          <FontAwesome5 name="cloud-upload-alt" size={55} color="#132F20" />
          <Text style={styles.buttonText}>
            {fileName ? 'Seleccionar otro archivo' : 'Seleccionar archivo'}
          </Text>
          {fileName && <View style={styles.separator} />}
          {fileName && (
            <View style={styles.fileContainer}>
              <FontAwesome5 name="file-csv" size={24} color="#132F20" />
              <Text style={styles.fileName}>{fileName}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Modo Estudiantes: selección de tipo de programa ─────────────────── */}
        {modo === 'estudiantes' && fileName && !verificando && mostrarTipoSel && (
          <View style={styles.checkboxContainer}>
            {!tipoConfirmado ? (
              <View>
                <Text style={styles.subtitlecheck}>
                  Selecciona el tipo de programa al que pertenece la carrera.
                </Text>
                {TIPO_OPTIONS.map((option) => (
                  <CheckBox
                    key={option.value}
                    title={option.label}
                    checkedColor="#C3D730"
                    checked={selectedOption === option.value}
                    onPress={() => {
                      setSelectedOption(option.value);
                      setTipoConfirmado(true);
                    }}
                    textStyle={{ fontSize: 16, color: '#132F20', fontFamily: 'Montserrat-Bold' }}
                    containerStyle={{ backgroundColor: 'transparent', margin: -5 }}
                  />
                ))}
              </View>
            ) : (
              <View style={{ padding: 5 }}>
                <Text style={styles.subtitlecheck}>
                  El programa es de tipo{' '}
                  {selectedOption === 'Profesional' ? 'Profesional.' : 'Tecnología.'}
                </Text>
                <TouchableOpacity
                  style={{ alignItems: 'center' }}
                  onPress={() => setTipoConfirmado(false)}
                >
                  <Text style={{ fontSize: 16, color: '#C3D730', fontFamily: 'Montserrat-Bold' }}>
                    Cambiar
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── Modo Estudiantes: carreras relacionadas ──────────────────────────── */}
        {modo === 'estudiantes' &&
          fileName &&
          (showRelacion === null || showRelacion === true) && (
          <View style={styles.scroll}>
            {showRelacion === null && (
              <View style={styles.checkboxContainer1}>
                <Text style={styles.subtitlecheck}>
                  ¿Esta carrera tiene relación con otro programa académico?
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.buttonSelection}
                    onPress={() => setShowRelacion(true)}
                  >
                    <View style={styles.buttonContainer}>
                      <FontAwesome5 name="check" size={24} color="#C3D730" />
                      <Text style={styles.buttonText}>  Sí</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.buttonSelection}
                    onPress={() => {
                      setShowRelacion(false);
                      setSelectedCareers([]);
                    }}
                  >
                    <View style={styles.buttonContainer}>
                      <FontAwesome5 name="times" size={24} color="#6D100A" />
                      <Text style={styles.buttonText}>  No</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {showRelacion && (
              <View style={styles.checkboxContainer1}>
                {programasFiltrados.length === 0 ? (
                  <Text style={styles.subtitlecheck}>
                    No hay carreras disponibles en este momento.
                  </Text>
                ) : (
                  <>
                    <Text style={styles.subtitlecheck}>
                      Selecciona las carreras relacionadas.
                    </Text>
                    {programasFiltrados.map((career) => (
                      <CheckBox
                        key={career.id}
                        title={capitalizeFirstLetter(career.programa)}
                        checkedColor="#C3D730"
                        checked={selectedCareers.includes(career.id)}
                        onPress={() =>
                          setSelectedCareers((prev) =>
                            prev.includes(career.id)
                              ? prev.filter((id) => id !== career.id)
                              : [...prev, career.id]
                          )
                        }
                        textStyle={{ fontSize: 16, color: '#132F20', fontFamily: 'Montserrat-Bold' }}
                        containerStyle={{ backgroundColor: 'transparent', margin: -5 }}
                      />
                    ))}
                  </>
                )}
              </View>
            )}
          </View>
        )}

        {/* Botón cargar */}
        {puedeCargar && (
          <TouchableOpacity style={styles.button1} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText1}>Cargar archivo</Text>
          </TouchableOpacity>
        )}

        {/* Modal de confirmación */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FontAwesome5 name="exclamation-circle" size={100} color="#6D100A" />
            <Text style={styles.modalText}>
              {modo === 'graduados'
                ? `Estás a punto de cargar ${csvData?.length ?? 0} registros de graduados.`
                : `Estás a punto de cargar un archivo de matrícula de tipo ${selectedOption}.`}
            </Text>
            <TouchableOpacity style={styles.button1} onPress={upload}>
              <Text style={styles.buttonText1}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonTextCancel}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 30,
  },
  title: {
    fontSize: 40,
    fontFamily: 'Montserrat-Bold',
    alignSelf: 'flex-start',
    marginBottom: 20,
    color: '#C3D730',
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Medium',
    alignSelf: 'flex-start',
    color: '#132F20',
    marginBottom: 20,
  },
  subtitlecheck: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginBottom: 10,
    color: '#132F20',
  },
  // ── Tarjetas de selección de modo ──────────────────────────────────────────
  modoButton: {
    backgroundColor: '#F0FFF2',
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 20,
  },
  modoButtonTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: '#132F20',
    marginTop: 12,
    marginBottom: 4,
  },
  modoButtonDesc: {
    fontSize: 15,
    fontFamily: 'Montserrat-Medium',
    color: '#575756',
    textAlign: 'center',
  },
  // ── Botón volver ────────────────────────────────────────────────────────────
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#132F20',
    marginLeft: 8,
  },
  // ── Picker ──────────────────────────────────────────────────────────────────
  button: {
    backgroundColor: '#F0FFF2',
    padding: 18,
    marginBottom: 8,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#132F20',
    fontSize: 17,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileName: {
    marginLeft: 10,
    fontSize: 20,
    fontFamily: 'Montserrat-Medium',
  },
  separator: {
    height: 2,
    width: '60%',
    backgroundColor: '#C3D730',
    marginVertical: 10,
  },
  // ── Cargar ──────────────────────────────────────────────────────────────────
  button1: {
    backgroundColor: 'white',
    padding: 5,
    marginBottom: 50,
    width: '60%',
    marginTop: 15,
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#132F20',
    justifyContent: 'center',
  },
  buttonText1: {
    color: '#132F20',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Montserrat-Bold',
  },
  // ── Checkboxes ──────────────────────────────────────────────────────────────
  checkboxContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    marginBottom: 8,
  },
  scroll: {
    padding: 10,
  },
  checkboxContainer1: {
    width: '100%',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonSelection: {
    padding: 10,
    borderRadius: 5,
    width: '49%',
    alignItems: 'center',
  },
  // ── Modal ────────────────────────────────────────────────────────────────────
  modalContent: {
    flex: 1,
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalText: {
    fontSize: 20,
    fontFamily: 'Montserrat-Medium',
    color: '#132F20',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  buttonCancel: {
    backgroundColor: '#6D100A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  buttonTextCancel: {
    color: 'white',
    fontFamily: 'Montserrat-Bold',
  },
});

export default CargarCSV;
