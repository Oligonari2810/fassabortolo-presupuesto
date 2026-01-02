// Validador estricto de sistemas
// Uso: node validate-systems.js

const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'sistemas', 'sistemas-index.json');
const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

let errors = [];
let warnings = [];

// 1. Validar IDs únicos
const ids = json.systems.map(s => s.id);
const duplicateIds = ids.filter((id, idx) => ids.indexOf(id) !== idx);
if (duplicateIds.length > 0) {
  errors.push(`❌ IDs duplicados: ${[...new Set(duplicateIds)].join(', ')}`);
}

// 2. Validar CSVs únicos
const csvs = json.systems.map(s => s.csv);
const duplicateCsvs = csvs.filter((csv, idx) => csvs.indexOf(csv) !== idx);
if (duplicateCsvs.length > 0) {
  errors.push(`❌ CSVs duplicados: ${[...new Set(duplicateCsvs)].join(', ')}`);
}

// 3. Validar cada sistema
json.systems.forEach(sys => {
  const sysId = sys.id;
  
  // Prohibir MIX solo en campos estructurales (NO en texto libre)
  // Campos de texto libre que pueden contener "mixto": titulo_pdf, descripcion_sistema, uso_recomendado, nombre_comercial, descripcion_tecnica_pdf
  const camposEstructurales = {
    id: sys.id,
    csv: sys.csv,
    nombre_comercial: sys.nombre_comercial,
    tipo: sys.tipo,
    estructura: sys.estructura,
    perfil_mm: sys.perfil_mm,
    zincado: sys.zincado
  };
  
  // Verificar MIX solo en campos estructurales
  const mixCheck = Object.values(camposEstructurales)
    .filter(v => v !== null && v !== undefined)
    .some(v => String(v).toUpperCase().includes('MIX'));
  
  if (mixCheck) {
    errors.push(`❌ ${sysId}: Contiene "MIX" en campo estructural (prohibido)`);
  }
  
  // Verificar placas[] individualmente
  if (Array.isArray(sys.placas)) {
    sys.placas.forEach((placa, idx) => {
      if (placa.tipo && String(placa.tipo).toUpperCase().includes('MIX')) {
        errors.push(`❌ ${sysId}: placas[${idx}].tipo contiene "MIX" (prohibido)`);
      }
    });
  }
  
  // capas_por_cara debe ser 1 o 2
  if (sys.capas_por_cara !== 1 && sys.capas_por_cara !== 2) {
    errors.push(`❌ ${sysId}: capas_por_cara=${sys.capas_por_cara} (debe ser 1 o 2)`);
  }
  
  // tipo=EXTERIOR → zincado debe ser Z2
  if (sys.tipo === 'EXTERIOR' && sys.zincado !== 'Z2') {
    errors.push(`❌ ${sysId}: tipo=EXTERIOR pero zincado=${sys.zincado} (debe ser Z2)`);
  }
  
  // name de EXTERIOR no puede contener "Techo TC"
  if (sys.tipo === 'EXTERIOR' && sys.nombre_comercial && /Techo\s+TC/.test(sys.nombre_comercial)) {
    errors.push(`❌ ${sysId}: nombre_comercial contiene "Techo TC" pero tipo es EXTERIOR`);
  }
  
  // placas debe ser array
  if (!Array.isArray(sys.placas)) {
    errors.push(`❌ ${sysId}: placas debe ser array, recibido: ${typeof sys.placas}`);
  } else {
    // Si placas.length > 1, verificar que no tenga "placa mixta" en CSV
    if (sys.placas.length > 1) {
      const csvPath = path.join(__dirname, 'sistemas', sys.csv);
      if (fs.existsSync(csvPath)) {
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        if (csvContent.includes('Placa mixta') || csvContent.includes('mixta')) {
          warnings.push(`⚠️  ${sysId}: placas.length > 1 pero CSV contiene "placa mixta" - considerar separar en líneas por placa`);
        }
      }
    }
  }
  
  // Validar estructura de placas
  if (Array.isArray(sys.placas)) {
    sys.placas.forEach((placa, idx) => {
      if (!placa.tipo || !placa.espesor_mm) {
        errors.push(`❌ ${sysId}: placas[${idx}] debe tener tipo y espesor_mm`);
      }
    });
  }
  
  // Validar CSV tiene formato nuevo (NO legacy)
  const csvPath = path.join(__dirname, 'sistemas', sys.csv);
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length > 1) {
      const header = lines[0].toLowerCase();
      const headerCols = lines[0].split(',');
      const idxFamilia = headerCols.findIndex(h => h.trim().toLowerCase() === 'familia_precio');
      const idxPrecio = headerCols.findIndex(h => h.trim().toLowerCase() === 'precio_catalogo_almeria');
      const idxCodigo = headerCols.findIndex(h => h.trim().toLowerCase() === 'codigo' || h.trim().toLowerCase() === 'sku');
      const idxConcepto = headerCols.findIndex(h => h.trim().toLowerCase() === 'concepto');
      
      // Validar header tiene campos requeridos (formato nuevo)
      if (!header.includes('precio_catalogo_almeria')) {
        errors.push(`❌ ${sysId}: CSV ${sys.csv} falta precio_catalogo_almeria en header`);
      }
      if (!header.includes('familia_precio')) {
        errors.push(`❌ ${sysId}: CSV ${sys.csv} falta familia_precio en header (formato legacy no permitido)`);
      }
      
      // Validar líneas
      if (idxFamilia >= 0) {
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = lines[i].split(',');
          
          // Validar familia_precio presente y válida
          const familia = cols[idxFamilia] ? cols[idxFamilia].trim().toUpperCase() : '';
          if (!familia) {
            const codigo = idxCodigo >= 0 && cols[idxCodigo] ? cols[idxCodigo].trim() : '';
            const concepto = idxConcepto >= 0 && cols[idxConcepto] ? cols[idxConcepto].trim() : '';
            errors.push(`❌ ${sysId}: CSV ${sys.csv} línea ${i + 1} (${codigo || concepto || 'sin código'}) falta familia_precio`);
          } else if (familia !== 'PLACA' && familia !== 'RESTO') {
            errors.push(`❌ ${sysId}: CSV ${sys.csv} línea ${i + 1} tiene familia_precio inválida: ${familia} (debe ser PLACA o RESTO)`);
          }
          
          // Validar precio_catalogo_almeria existe y es numérico
          if (idxPrecio >= 0) {
            const precioStr = cols[idxPrecio] ? cols[idxPrecio].trim() : '';
            if (!precioStr) {
              errors.push(`❌ ${sysId}: CSV ${sys.csv} línea ${i + 1} falta precio_catalogo_almeria`);
            } else {
              const precio = parseFloat(precioStr.replace(',', '.'));
              if (isNaN(precio) || precio <= 0) {
                errors.push(`❌ ${sysId}: CSV ${sys.csv} línea ${i + 1} tiene precio_catalogo_almeria inválido: ${precioStr}`);
              }
            }
          }
        }
      }
    }
  }
});

// Reporte
console.log('\n=== VALIDACIÓN DE SISTEMAS ===\n');

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Todos los sistemas son válidos\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log('❌ ERRORES CRÍTICOS:\n');
  errors.forEach(e => console.log(e));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  ADVERTENCIAS:\n');
  warnings.forEach(w => console.log(w));
  console.log('');
}

if (errors.length > 0) {
  console.log(`\n💥 Build fallido: ${errors.length} error(es) encontrado(s)\n`);
  process.exit(1);
}

