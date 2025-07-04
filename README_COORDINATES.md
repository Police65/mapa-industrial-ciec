# Sistema de Coordenadas DMS (Grados, Minutos, Segundos)

## Descripción

El sistema ahora permite ingresar coordenadas en formato DMS (Grados, Minutos, Segundos) como "10°09'52.8"N 67°57'49.9"W" en lugar de solo coordenadas decimales.

## Formato de Entrada

### Formato DMS
- **Latitud**: `10°09'52.8"N` (10 grados, 9 minutos, 52.8 segundos Norte)
- **Longitud**: `67°57'49.9"W` (67 grados, 57 minutos, 49.9 segundos Oeste)
- **Formato completo**: `10°09'52.8"N 67°57'49.9"W`

### Símbolos utilizados
- `°` = Grados
- `'` = Minutos  
- `"` = Segundos
- `N/S` = Norte/Sur (para latitud)
- `E/W` = Este/Oeste (para longitud)

## Funcionalidades

### 1. Conversión Automática
- Al ingresar coordenadas en formato DMS, se convierten automáticamente a decimales para almacenamiento
- Al editar una empresa existente, las coordenadas decimales se muestran en formato DMS

### 2. Campos en el Formulario
- **Campo principal**: Coordenadas en formato DMS (ej: `10°09'52.8"N 67°57'49.9"W`)
- **Campo latitud**: Coordenada decimal de latitud (se actualiza automáticamente)
- **Campo longitud**: Coordenada decimal de longitud (se actualiza automáticamente)

### 3. Visualización en Lista
- Las coordenadas se muestran en formato DMS en la tabla de empresas
- Formato: `10°09'52.8"N 67°57'49.9"W`

## Ejemplos de Uso

### Coordenadas válidas:
```
10°09'52.8"N 67°57'49.9"W
10°10'00.0"N 67°58'00.0"W
10°09'30.5"S 67°57'15.2"E
```

### Conversiones:
- `10°09'52.8"N` → `10.164666666666667`
- `67°57'49.9"W` → `-67.96386111111111`

## Validación

El sistema valida que:
- El formato sea correcto (grados°minutos'segundos"dirección)
- Los grados estén entre 0-90 para latitud y 0-180 para longitud
- Los minutos estén entre 0-59
- Los segundos estén entre 0-59.9
- La dirección sea N, S, E o W

## Archivos Modificados

- `utils/coordinates.ts` - Funciones de conversión
- `pages/CompanyForm.tsx` - Formulario de empresas
- `pages/CompaniesList.tsx` - Lista de empresas
- `types.ts` - Tipos de datos

## Notas Técnicas

- Las coordenadas se almacenan en la base de datos como decimales
- La conversión DMS ↔ Decimal es bidireccional
- El sistema mantiene compatibilidad con coordenadas decimales existentes 