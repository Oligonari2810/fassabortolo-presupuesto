# 📋 Estructura del Proyecto - Calculadora FassaBortolo

## ✅ Completado

1. ✅ Archivos obsoletos eliminados
2. ✅ Carpeta `/sistemas` creada
3. ✅ `index.html` actualizado (solo botón a presupuesto)
4. ✅ `presupuesto.html` creado (calculadora completa)

## 📝 Pendiente - Necesitas Proporcionar

### 1. Archivo `sistemas-index.json`

Estructura requerida (array de objetos):
```json
[
  {
    "id": "T-70-13",
    "nombre": "Tabique 70-13",
    "descripcion": "Sistema de tabique con perfil 70mm y placa 13mm",
    "categoria": "Tabiques"
  },
  {
    "id": "T-90-13",
    "nombre": "Tabique 90-13",
    "descripcion": "Sistema de tabique con perfil 90mm y placa 13mm",
    "categoria": "Tabiques"
  }
  // ... 22 sistemas más
]
```

**Campos requeridos:**
- `id`: Identificador único (debe coincidir con el nombre del CSV)
- `nombre`: Nombre descriptivo del sistema
- `descripcion`: Descripción opcional
- `categoria`: Categoría del sistema (opcional)

### 2. Archivos CSV (24 sistemas)

Cada CSV debe tener la siguiente estructura:

```csv
Material,Coeficiente,Precio,Unidad
Perfil vertical 70mm,1.20,15.50,m
Placa Standard 13mm,2.00,8.75,m²
Masilla,0.15,12.00,kg
...
```

**Campos requeridos:**
- `Material` (o `material`): Nombre del material
- `Coeficiente` (o `coeficiente`): Coeficiente por m²
- `Precio` (o `precio`): Precio unitario
- `Unidad` (o `unidad`): Unidad de medida (m, m², kg, etc.)

**Nombres de archivos:**
- Deben coincidir con el `id` del JSON: `T-70-13.csv`, `T-90-13.csv`, etc.
- Todos dentro de la carpeta `/sistemas`

### 3. Logo FassaBortolo Caribe (Opcional)

- Formato: PNG o SVG
- Puedes proporcionarlo en base64 o como archivo
- Si lo proporcionas, lo integro en el PDF

## 🚀 Funcionalidades Implementadas

### `presupuesto.html` incluye:

1. ✅ Selector de sistemas (lee `sistemas-index.json`)
2. ✅ Carga dinámica de CSV por sistema
3. ✅ Upload de Excel tipo Larimar (estructura base)
4. ✅ Ingreso manual de m²
5. ✅ Configuración de desperdicio (%)
6. ✅ Descuento global (%)
7. ✅ Cálculo: `cantidad = coef × m² × (1 + desperdicio/100) × precio`
8. ✅ Tabla de resultados con totales
9. ✅ Exportación a PDF (jsPDF + autotable)
10. ✅ Diseño responsive
11. ✅ Colores oficiales: #e74c3c (rojo), #2c3e50 (gris oscuro)

## 📦 Librerías CDN Incluidas

- **PapaParse**: Lectura de CSV
- **jsPDF + autotable**: Generación de PDF
- **FontAwesome**: Iconos

## 🔄 Próximos Pasos

1. Sube los 24 archivos CSV a `/sistemas`
2. Reemplaza `sistemas-index.json` con tu estructura real
3. (Opcional) Proporciona el logo en base64
4. Prueba la calculadora
5. Commit y push

## 📝 Notas

- El código está listo y funcional
- Solo falta agregar los datos (CSV + JSON)
- Funciona sin backend, todo en el cliente
- Compatible con GitHub Pages y Vercel

