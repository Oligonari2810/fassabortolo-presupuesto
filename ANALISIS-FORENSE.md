# ANÁLISIS FORENSE - Estado de la Aplicación

## RESUMEN EJECUTIVO

**ESTADO: APP DESVIADA**

La aplicación tiene inconsistencias críticas entre:
- HTML (estructura de selectores)
- JavaScript (lógica de eventos y filtrado)
- Flujo de datos (índices enriquecidos vs base)

---

## 1) CAMBIOS RECIENTES IDENTIFICADOS

### A) `filtrarYMostrarSistemas()` - Línea ~914

**Qué se pretendía mejorar:**
- Usar índice enriquecido para filtrado inteligente
- Implementar flujo: Ambiente → Elemento → Placa → Estructura → Capas
- Soporte para sistemas mixtos (AQSTD)

**Qué cambió realmente:**
- ❌ **DESVIACIÓN CRÍTICA**: Función SIGUE usando `document.querySelector('input[name="ambiente"]:checked')` (línea 915)
- ❌ Lee de `<input type="radio">` cuando el HTML tiene `<select id="selectAmbiente">`
- ❌ Usa `systemsIndexRaw` (legacy) en lugar de `systemsIndexEnriched`
- ❌ Orden incorrecto: lee "ambiente, placa, tipo, perfileria, modulacion, capas" (orden antiguo)

**Riesgo introducido:**
- **CRÍTICO**: Función NUNCA encuentra elementos (retorna undefined silenciosamente)
- **CRÍTICO**: Usa índice legacy en lugar de enriquecido
- **CRÍTICO**: Orden de selectores incorrecto (no coincide con HTML)

**Estado actual:**
- HTML: `<select id="selectAmbiente">` ✅
- JavaScript: `querySelector('input[name="ambiente"]')` ❌
- **RESULTADO: DESINCRONIZACIÓN TOTAL**

---

### B) `calcularYMostrarConSistema()` - Línea ~659

**Qué se pretendía mejorar:**
- Mantener función estable (no debería haber cambiado)
- Aceptar metadata completa del sistema

**Qué cambió realmente:**
- **VERIFICAR**: Parece intacta, pero hay wrapper `calcularYMostrar()` en línea ~1162
- El wrapper usa `sistemaActualMeta` (variable global)

**Riesgo introducido:**
- **BAJO**: Si `sistemaActualMeta` no se setea correctamente, el cálculo no se ejecuta
- El wrapper podría ocultar errores si `sistemaActualMeta` es null/undefined

**Estado actual:**
- Función principal parece intacta
- Depende de `sistemaActualMeta` siendo seteado correctamente

---

### C) Flujo de eventos del HTML - Líneas ~353-441

**Qué se pretendía mejorar:**
- Reorganizar a: Ambiente → Elemento → Placa → Estructura → Capas
- Cambiar de radio buttons a `<select>` dropdowns (consistencia UI)

**Qué cambió realmente:**
- HTML reorganizado: 5 pasos (eliminado paso "Modulación")
- Estructura ahora es: `<select id="selectAmbiente">`, `<select id="selectElemento">`, etc.

**Riesgo introducido:**
- **CRÍTICO**: Si `initSelectionFlow()` no está sincronizada con el nuevo HTML, los eventos no se conectan
- **CRÍTICO**: Si `filtrarYMostrarSistemas()` lee de elementos que no existen, retorna undefined

**Estado actual:**
- HTML tiene `<select>` elements con IDs correctos
- Necesita verificar que `initSelectionFlow()` esté conectada

---

## 2) ANÁLISIS DETALLADO POR FUNCIÓN

### `filtrarYMostrarSistemas()` - Línea ~914

**Código actual REAL:**
```javascript
async function filtrarYMostrarSistemas() {
  const ambiente = document.querySelector('input[name="ambiente"]:checked')?.value;
  const placa = document.querySelector('input[name="placa"]:checked')?.value;
  const tipo = document.querySelector('input[name="tipo"]:checked')?.value;
  const perfileria = document.querySelector('input[name="perfileria"]:checked')?.value;
  const modulacion = document.querySelector('input[name="modulacion"]:checked')?.value;
  const capas = document.querySelector('input[name="capas"]:checked')?.value;
  // ...
  if (systemsIndexRaw.length === 0) {
    systemsIndexRaw = await loadIndexRaw();
  }
  const sistemasFiltrados = systemsIndexRaw.filter(sys => { ... });
}
```

**Problemas detectados:**
1. ❌ **CRÍTICO**: Lee de `querySelector('input[name="ambiente"]')` cuando HTML tiene `<select id="selectAmbiente">`
2. ❌ **CRÍTICO**: Orden incorrecto (placa antes de tipo, perfileria antes de estructura)
3. ❌ **CRÍTICO**: Usa `systemsIndexRaw` (legacy) en lugar de `systemsIndexEnriched`
4. ❌ **CRÍTICO**: Busca "modulacion" que NO existe en el nuevo HTML (solo 5 pasos)

**Veredicto:** Función está COMPLETAMENTE DESINCRONIZADA con el HTML. NUNCA funciona.

---

### `initSelectionFlow()` - Línea ~988

**Código actual REAL:**
```javascript
function initSelectionFlow() {
  // Paso 1: Ambiente
  document.querySelectorAll('input[name="ambiente"]').forEach(radio => {
    radio.addEventListener('change', () => {
      updatePlacaOptions(radio.value);
    });
  });
  // ...
}
```

**Problemas detectados:**
1. ❌ **CRÍTICO**: Busca `input[name="ambiente"]` cuando HTML tiene `<select id="selectAmbiente">`
2. ❌ **CRÍTICO**: Llama a `updatePlacaOptions()` que probablemente no existe o está desincronizada
3. ❌ **CRÍTICO**: Orden incorrecto (placa antes de elemento)
4. ✅ Se llama en línea 1625 (correcto)

**Riesgo:**
- Event listeners NUNCA se conectan (querySelector retorna array vacío)
- Selector no responde a cambios
- **RESULTADO: SELECTOR COMPLETAMENTE ROTO**

---

### Variables globales - Líneas ~635 y ~1609

**Estado actual REAL:**
```javascript
// Línea 635 (legacy):
let systemsIndexRaw = [];
let sistemaActualMeta = null;

// Línea 1609 (nuevo, pero NO declarado globalmente):
if (systemsIndexEnriched.length === 0) {
  systemsIndexEnriched = await loadIndexEnriched();
}
if (systemsIndexBase.length === 0) {
  systemsIndexBase = await loadIndexBase();
}
```

**Problemas detectados:**
1. ❌ **CRÍTICO**: `systemsIndexEnriched` y `systemsIndexBase` NO están declarados como `let` globales
2. ❌ **CRÍTICO**: Se usan dentro de IIFE pero `filtrarYMostrarSistemas()` usa `systemsIndexRaw`
3. ❌ **CRÍTICO**: Mezcla de código legacy (`systemsIndexRaw`) y nuevo (`systemsIndexEnriched`)

**Veredicto:** Variables globales INCONSISTENTES. Código nuevo y legacy coexisten sin sincronización.

---

## 3) CAMBIOS QUE ROMPEN EL CONTRATO

### Contrato del objeto `result`

**Contrato esperado (línea ~756):**
```javascript
const result = {
  system: meta.id,
  systemName: meta.nombre_comercial || meta.id,
  area, waste, incoterm, logisticaPct, margenPct,
  costeNetoSistema, costeTotalSistema, precioVentaSistema,
  costeTotalM2, ventaM2,
  rows: rowsData,
  meta
};
```

**Riesgo:**
- Si `calcularYMostrarConSistema()` no cambió → ✅ Contrato intacto
- Si `meta` no se pasa correctamente → ❌ Falla downstream

---

### Orden del árbol de selección

**Esperado:**
1. Ambiente → 2. Elemento → 3. Placa → 4. Estructura → 5. Capas

**Actual (HTML):**
- Paso 1: `<select id="selectAmbiente">` ✅
- Paso 2: `<select id="selectElemento">` ✅
- Paso 3: `<select id="selectPlaca">` ✅
- Paso 4: `<select id="selectEstructura">` ✅
- Paso 5: `<select id="selectCapas">` ✅

**Veredicto:** HTML está en orden correcto

---

### Cuándo se recalcula/renderiza

**Esperado:**
- Cambio en cualquier selector → Recalcula automáticamente
- Cambio en inputs (m², desperdicio, logística, margen) → Recalcula automáticamente

**Riesgo:**
- Si eventos no están conectados → No recalcula
- Si `sistemaActualMeta` no se setea → No calcula

---

## 4) PUNTOS CRÍTICOS A REVISAR (PRIORIZADO)

### 🔴 CRÍTICO #1: JavaScript lee de elementos que NO EXISTEN
**Ubicación:** `filtrarYMostrarSistemas()` línea 915-920
**Problema CONFIRMADO:** 
- JavaScript: `querySelector('input[name="ambiente"]:checked')`
- HTML: `<select id="selectAmbiente">`
- **RESULTADO: querySelector retorna null, función retorna undefined silenciosamente**
**Síntoma:** Selector no funciona, ningún sistema se filtra, tabla vacía
**Impacto:** **BLOQUEO TOTAL DEL SELECTOR**

### 🔴 CRÍTICO #2: `initSelectionFlow()` busca elementos que NO EXISTEN
**Ubicación:** Línea 990
**Problema CONFIRMADO:**
- JavaScript: `querySelectorAll('input[name="ambiente"]')`
- HTML: `<select id="selectAmbiente">`
- **RESULTADO: querySelectorAll retorna array vacío, event listeners NUNCA se conectan**
**Síntoma:** Cambios en dropdowns NO disparan actualizaciones
**Impacto:** **SELECTOR COMPLETAMENTE NO RESPONSIVO**

### 🔴 CRÍTICO #3: Variables globales mezclan código legacy y nuevo
**Ubicación:** Línea 635 (legacy) y línea 1609 (nuevo, pero dentro de IIFE)
**Problema CONFIRMADO:**
- `filtrarYMostrarSistemas()` usa `systemsIndexRaw` (legacy)
- Código nuevo declara `systemsIndexEnriched` dentro de IIFE (no accesible)
- **RESULTADO: Mezcla de código legacy y nuevo sin sincronización**
**Síntoma:** Funciones nuevas no encuentran variables, funciones legacy usan datos antiguos
**Impacto:** **BLOQUEO DE FUNCIONALIDAD NUEVA**

### 🟡 MEDIO #4: `sistemaActualMeta` no seteado
**Ubicación:** `cargarCSV()` línea ~646 y `filtrarYMostrarSistemas()` línea ~914
**Problema:** Si `sistemaActualMeta` no se setea cuando se selecciona sistema → `calcularYMostrar()` falla
**Síntoma:** Tabla de materiales vacía, resumen no se muestra
**Verificación:** Buscar dónde se setea `sistemaActualMeta = sistema`

### 🟢 BAJO #5: Carga de índices
**Ubicación:** `loadIndexEnriched()` y `loadIndexBase()` línea ~638-643
**Problema:** Si índices no se cargan antes de usar → Errores asíncronos
**Síntoma:** "Cannot read property 'filter' of undefined"
**Verificación:** Verificar que se cargan antes de `filtrarYMostrarSistemas()`

---

## RESUMEN FINAL

**VEREDICTO: APP COMPLETAMENTE DESVIADA**

**Estado CONFIRMADO:**
- HTML reorganizado correctamente ✅ (`<select id="selectAmbiente">` etc.)
- JavaScript **NO ACTUALIZADO** ❌ (sigue usando `input[name="..."]`)
- Desincronización HTML ↔ JavaScript **TOTAL** ❌
- Eventos **NUNCA se conectan** ❌ (querySelector retorna null)

**Hallazgos críticos:**
1. ❌ `filtrarYMostrarSistemas()` línea 915: lee de `input[name="ambiente"]` cuando HTML tiene `<select id="selectAmbiente">`
2. ❌ `initSelectionFlow()` línea 990: busca `input[name="ambiente"]` cuando HTML tiene `<select>`
3. ❌ Variables globales: `systemsIndexRaw` (legacy) vs `systemsIndexEnriched` (nuevo, pero no declarado globalmente)
4. ❌ Orden incorrecto: JavaScript busca "placa, tipo, perfileria, modulacion" cuando HTML tiene "Ambiente, Elemento, Placa, Estructura, Capas"

**Prioridad de revisión (ORDEN CORRECTO):**
1. **🔴 CRÍTICO**: Actualizar `filtrarYMostrarSistemas()` para leer de `<select id="selectX">` en lugar de `input[name="x"]`
2. **🔴 CRÍTICO**: Actualizar `initSelectionFlow()` para conectar eventos a `<select>` elements
3. **🔴 CRÍTICO**: Declarar `systemsIndexEnriched` y `systemsIndexBase` como variables globales
4. **🟡 MEDIO**: Actualizar orden de selectores en JavaScript (Ambiente → Elemento → Placa → Estructura → Capas)
5. **🟡 MEDIO**: Eliminar código legacy (`systemsIndexRaw`, `loadIndexRaw`) o migrarlo completamente

**Recomendación INMEDIATA:**
- El HTML está correcto, pero el JavaScript está 100% desincronizado
- Es necesario reescribir `filtrarYMostrarSistemas()` y `initSelectionFlow()` desde cero usando los IDs correctos del HTML
- NO es un problema de "validación" o "event listeners no conectados": es que el código busca elementos que NO EXISTEN

