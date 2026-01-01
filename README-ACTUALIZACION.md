# 🚀 ACTUALIZACIÓN FASSA BORTOLO APP
## Instrucciones para subir a Netlify

---

## ✅ ARCHIVOS INCLUIDOS

```
fassa-corregido/
├── index.html              ← Página principal con disclaimer
├── tabiques.html           ← Selector de tabiques con validaciones
├── techos.html             ← Sistemas de techos
├── trasdosados.html        ← Sistemas de trasdosados
├── semi-intemperie.html    ← Sistemas exteriores (CORREGIDO)
├── presupuesto.html        ← Presupuesto con disclaimers
└── README-ACTUALIZACION.md ← Este archivo
```

---

## 🚨 CAMBIOS PRINCIPALES APLICADOS

### 1. Sistema SI-AQ-70-13 ELIMINADO ❌
- **Problema:** Placa AQUA en exteriores (INCORRECTO)
- **Solución:** Eliminado completamente del sistema
- **Ahora:** Solo 2 sistemas en exteriores (ambos con EXTERNA Light)

### 2. Disclaimers Legales Agregados ⚖️
- **index.html:** Disclaimer en página principal
- **presupuesto.html:** Disclaimer detallado + checkbox obligatorio
- **todas las páginas:** Disclaimer en footer

### 3. Validación de Altura ≥3,2m 📏
- **Alerta obligatoria** cuando altura ≥ 3.2m
- **Solo perfil 90mm** disponible en estas alturas
- **Mensaje claro:** "Se requiere perfil 90mm mínimo"

### 4. Badges Corregidos 🏷️
- **T-70-13:** Badge "CONDICIONADO" (placa BA)
- **Sistemas con placa F:** Badge "CORE"
- **Sistemas estándar:** Badge "USO GENERAL"
- **Nunca:** Badge que diga "EI-60" directamente

### 5. Textos EI-60/90 Corregidos 📝
- **Antes:** "EI-60 certificado" ❌
- **Ahora:** "Compatible con EI-60 según configuración ensayada" ✅
- **Siempre:** "EI sujeto a validación técnica"

### 6. Menú Simplificado 📱
- Solo 3 ítems visibles: Inicio, Selector (oculto), Presupuesto
- Páginas antiguas sin links visibles (backup técnico)

---

## 📦 OPCIÓN 1: Subir Manualmente a Netlify

### Paso 1: Descargar archivos
1. Descarga esta carpeta `fassa-corregido/`
2. Verifica que tienes los 6 archivos HTML

### Paso 2: Entrar a Netlify
1. Ve a: https://app.netlify.com/
2. Inicia sesión con tu cuenta

### Paso 3: Encontrar tu sitio
1. Busca tu sitio: `fassabortoloariasgroup`
2. Click en el sitio

### Paso 4: Subir archivos
1. Ve a: **Deploys** → **Deploy settings**
2. Click en: **Deploy via drag and drop**
3. Arrastra TODA la carpeta `fassa-corregido/`
4. Click en **Deploy site**

### Paso 5: Verificar
1. Espera 1-2 minutos
2. Visita tu URL: `https://fassabortoloariasgroup.netlify.app/`
3. Verifica que todo funcione correctamente

---

## 🔄 OPCIÓN 2: Desde Git (Recomendado)

### Paso 1: Clonar tu repositorio
```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git
cd TU_REPO
```

### Paso 2: Copiar archivos corregidos
```bash
# Copiar los archivos corregidos a tu repo
cp /ruta/a/fassa-corregido/*.html ./
```

### Paso 3: Commit y push
```bash
git add .
git commit -m "FIX: Correcciones EI-60/90, disclaimers y validaciones"
git push origin main
```

### Paso 4: Netlify se actualiza automáticamente
- No necesitas hacer nada más
- Netlify detecta el cambio y actualiza en 1-2 minutos

---

## ✅ VERIFICACIÓN FINAL

Una vez subidos los archivos, verifica:

### 1. Disclaimer en página principal
- [ ] Texto: "⚠️ IMPORTANTE: Esta herramienta es para uso interno..."

### 2. Menú simplificado
- [ ] Solo 3 ítems visibles en el menú

### 3. Sistema SI-AQ-70-13 eliminado
- [ ] Ir a /semi-intemperie
- [ ] NO debe aparecer "Semi-Intemperie AQUA"
- [ ] Solo 2 sistemas disponibles

### 4. Validación de altura en tabiques
- [ ] Ir a /tabiques
- [ ] Seleccionar altura ≥ 3.2m
- [ ] Debe aparecer alerta obligatoria
- [ ] Solo sistemas con 90mm disponibles

### 5. Checkbox en presupuesto
- [ ] Ir a /presupuesto
- [ ] Debe haber un disclaimer con checkbox
- [ ] Botones deshabilitados hasta marcar checkbox

### 6. Badges correctos
- [ ] T-70-13 debe tener badge "CONDICIONADO"
- [ ] Texto debe decir "EI sujeto a validación técnica"
- [ ] Ningún badge debe decir "EI-60" directamente

---

## 🆘 SI ALGO SALE MAL

### Problema: La web no carga
**Solución:**
1. Verifica que subiste TODOS los archivos
2. El archivo `index.html` debe estar en la raíz
3. Netlify distingue entre mayúsculas/minúsculas

### Problema: Página 404 (no encontrada)
**Solución:**
1. Verifica el nombre del archivo
2. `tabiques.html` (no `tabique.html`)
3. `semi-intemperie.html` (con guión)

### Problema: JavaScript no funciona
**Solución:**
1. Abre la consola del navegador (F12)
2. Mira si hay errores en rojo
3. Verifica que localStorage funcione

### Problema: Estilos rotos
**Solución:**
1. Verifica que Font Awesome cargue
2. Revisa la consola por errores de CSS
3. Limpia el caché del navegador (Ctrl+Shift+R)

---

## 📞 CONTACTO PARA DUDAS

Si necesitas ayuda:
1. Revisa los documentos PDF generados
2. Los textos exactos están en `TEXTOS_PARA_COPIAR_Y_PEGAR.md`
3. La guía completa está en `IMPLEMENTACION_GUIA_COMPLETA.md`

---

## 🎯 RESUMEN DE CAMBIOS CRÍTICOS

| Cambio | Estado | Verificación |
|--------|--------|--------------|
| EI-60/90 corregidos | ✅ | Texto dice "sujeto a validación" |
| Altura ≥3,2m validada | ✅ | Alerta + solo 90mm |
| SI-AQ-70-13 eliminado | ✅ | No aparece en exteriores |
| Disclaimers agregados | ✅ | 3 lugares |
| Menú simplificado | ✅ | Solo 3 ítems |
| Badges corregidos | ✅ | CONDICIONADO, no EI-60 |

---

## ✅ COMANDO GIT FINAL (opcional)

Si usas Git y todo está correcto:

```bash
git add .
git commit -m "LANZAMIENTO: Fassa-safe, menú 3 ítems, EI no fijo, alturas validadas"
git push origin main
```

---

**Fecha de actualización:** 2025-12-28
**Versión:** 2.0 (Correcciones aplicadas)
**Estado:** ✅ Listo para lanzamiento

---

¡Buena suerte con el lanzamiento! 🚀
