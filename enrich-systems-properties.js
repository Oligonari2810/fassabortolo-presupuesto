const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'sistemas', 'sistemas-index.json');

console.log('📖 Leyendo sistemas-index.json...');
const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

if (!data.systems || !Array.isArray(data.systems)) {
  throw new Error('Formato inválido: se espera { systems: [...] }');
}

console.log(`🔍 Procesando ${data.systems.length} sistemas...`);

let enriched = 0;
let mixedPlates = 0;

data.systems.forEach((system, index) => {
  // 1. Calcular placa_tipo
  const tiposPlaca = system.placas.map(p => p.tipo);
  const tiposUnicos = [...new Set(tiposPlaca)];
  
  let placa_tipo;
  if (tiposUnicos.length === 1) {
    placa_tipo = tiposUnicos[0];
  } else {
    placa_tipo = tiposUnicos.join('+');
    mixedPlates++;
  }
  
  // 2. Calcular es_humedo (true si al menos una placa es AQUA)
  const es_humedo = tiposPlaca.includes('AQUA');
  
  // 3. Calcular es_exterior (true si tipo === "EXTERIOR")
  const es_exterior = system.tipo === 'EXTERIOR';
  
  // 4. Calcular es_doble_capa (true si capas_por_cara === 2)
  const es_doble_capa = system.capas_por_cara === 2;
  
  // 5. Calcular perfil_tipo (mapear estructura)
  let perfil_tipo;
  switch (system.estructura) {
    case 'montante_rail':
      perfil_tipo = 'montante/rail';
      break;
    case 'omega':
      perfil_tipo = 'perfil omega';
      break;
    case 'tc':
      perfil_tipo = 'perfil TC';
      break;
    default:
      perfil_tipo = system.estructura; // fallback si hay un valor no esperado
      console.warn(`⚠️  Estructura desconocida en ${system.id}: ${system.estructura}`);
  }
  
  // Añadir los nuevos campos al sistema
  system.placa_tipo = placa_tipo;
  system.es_humedo = es_humedo;
  system.es_exterior = es_exterior;
  system.es_doble_capa = es_doble_capa;
  system.perfil_tipo = perfil_tipo;
  
  enriched++;
});

console.log(`✅ ${enriched} sistemas enriquecidos`);
console.log(`🔀 ${mixedPlates} sistemas con placas mixtas detectados`);

// Validación: Verificar sistema mixto esperado
const aqstd = data.systems.find(s => s.id === 'M-70-13-AQSTD-2');
if (aqstd) {
  console.log('\n📋 Verificación sistema mixto (M-70-13-AQSTD-2):');
  console.log(`   placa_tipo: ${aqstd.placa_tipo}`);
  console.log(`   es_humedo: ${aqstd.es_humedo}`);
  console.log(`   es_exterior: ${aqstd.es_exterior}`);
  console.log(`   es_doble_capa: ${aqstd.es_doble_capa}`);
  console.log(`   perfil_tipo: ${aqstd.perfil_tipo}`);
  
  if (aqstd.placa_tipo === 'STD+AQUA' && aqstd.es_humedo === true && aqstd.es_doble_capa === true) {
    console.log('   ✅ Validación correcta');
  } else {
    console.log('   ❌ Validación fallida');
    process.exit(1);
  }
}

// Guardar el JSON enriquecido
console.log('\n💾 Guardando sistemas-index.json enriquecido...');
fs.writeFileSync(indexPath, JSON.stringify(data, null, 2) + '\n', 'utf8');

console.log('✨ Proceso completado exitosamente');

