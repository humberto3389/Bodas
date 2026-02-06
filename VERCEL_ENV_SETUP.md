# 🔧 Configuración de Variables de Entorno en Vercel

## ⚠️ PROBLEMA CRÍTICO

Si ves errores como:
```
[BFF] Error en handler: Error: Las variables de entorno de Supabase no están configuradas en el servidor. SUPABASE_URL: FALTA, SUPABASE_ANON_KEY: FALTA
```

**Esto significa que las variables de entorno NO están configuradas correctamente en Vercel.**

## 📋 Variables de Entorno Requeridas

### Para el Cliente (Frontend)
Estas variables se exponen al navegador durante el build:

- `VITE_SUPABASE_URL` - URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anónima pública de Supabase
- `VITE_MAIN_DOMAIN` (opcional) - Dominio principal

### Para las Funciones Serverless (API Routes)
**⚠️ IMPORTANTE**: Las funciones serverless en Vercel NO pueden acceder a variables con prefijo `VITE_`. Necesitas configurar las mismas variables SIN el prefijo:

- `SUPABASE_URL` - URL de tu proyecto Supabase (mismo valor que VITE_SUPABASE_URL)
- `SUPABASE_ANON_KEY` - Clave anónima pública de Supabase (mismo valor que VITE_SUPABASE_ANON_KEY)

## 🚀 Cómo Configurar en Vercel

### Paso 1: Obtener los Valores de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL** → Este es tu `SUPABASE_URL`
   - **anon public** key → Este es tu `SUPABASE_ANON_KEY`

### Paso 2: Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

#### Variables para el Cliente (con prefijo VITE_):
```
VITE_SUPABASE_URL = https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Variables para Funciones Serverless (SIN prefijo VITE_):
```
SUPABASE_URL = https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ CRÍTICO**: Debes configurar AMBAS versiones (con y sin prefijo VITE_) con los mismos valores.

### Paso 3: Seleccionar Ambientes

Para cada variable, asegúrate de seleccionar:
- ✅ **Production**
- ✅ **Preview** (opcional, pero recomendado)
- ✅ **Development** (opcional)

### Paso 4: Redeploy

Después de agregar las variables:

1. Ve a **Deployments**
2. Haz clic en los tres puntos (⋯) del último deployment
3. Selecciona **Redeploy**
4. Espera a que termine el deployment

## ✅ Verificar que Funciona

1. Ve a los logs del deployment en Vercel
2. Busca en los logs: `[BFF Debug] SUPABASE_URL: Definida`
3. Si ves `UNDEFINED`, las variables no están configuradas correctamente

## 🔍 Troubleshooting

### Error: "SUPABASE_URL: FALTA"
- Verifica que agregaste `SUPABASE_URL` (SIN prefijo VITE_) en Vercel
- Verifica que seleccionaste el ambiente correcto (Production/Preview)
- Haz un redeploy después de agregar las variables

### Error: "VITE_SUPABASE_URL is not defined" (en el cliente)
- Verifica que agregaste `VITE_SUPABASE_URL` (CON prefijo VITE_) en Vercel
- Verifica que seleccionaste el ambiente correcto
- Haz un redeploy después de agregar las variables

### La vista previa no funciona
- Verifica que ambas variables (`SUPABASE_URL` y `VITE_SUPABASE_URL`) están configuradas
- Verifica los logs de Vercel para ver si hay errores 503 en `/api/public/wedding-data`
- Haz un redeploy completo

## 📝 Notas Importantes

1. **Nunca compartas tus claves de Supabase públicamente**
2. Las variables con prefijo `VITE_` se exponen al navegador (son públicas)
3. Las variables sin prefijo `VITE_` solo están disponibles en funciones serverless (más seguras)
4. Para producción, siempre usa las variables sin prefijo en funciones serverless

## 🔗 Referencias

- [Documentación de Vercel sobre Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)
- [Documentación de Supabase sobre Claves](https://supabase.com/docs/guides/api/api-keys)
