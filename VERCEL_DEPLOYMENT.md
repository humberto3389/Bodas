# Guía de Despliegue y Acceso - Vercel

## Problemas Comunes y Soluciones

### 1. Error 404 en Rutas Dinámicas

Si las rutas como `/invitacion/humberto-nelida` o `/admin` dan error 404:

**Solución:**
1. Asegúrate de que el archivo `vercel.json` esté en la raíz del proyecto
2. Haz commit y push de los cambios:
   ```bash
   git add vercel.json
   git commit -m "Fix: Configuración de Vercel para SPA"
   git push
   ```
3. Vercel debería detectar el cambio y hacer redeploy automáticamente
4. Si no se redeploya automáticamente, ve al dashboard de Vercel y haz "Redeploy"

### 2. Verificar Configuración en Vercel Dashboard

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **General**
3. Verifica que:
   - **Framework Preset**: Vite (o detectado automáticamente)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Acceso al Panel Admin Master

**URL de acceso:**
```
https://bodas-ez22.vercel.app/admin/login
```

**Credenciales:**
- Email: Tu email autorizado (según código: `mhuallpasullca@gmail.com`)
- Contraseña: La contraseña configurada en Supabase Auth

**Nota:** El sistema verifica que el usuario tenga:
- Email en la lista blanca, O
- Rol `master_admin` en Supabase

**Si no puedes acceder:**
1. Verifica que tu usuario en Supabase tenga el rol `master_admin`
2. Puedes verificar/actualizar el rol en Supabase Dashboard → Authentication → Users
3. El rol debe estar en `app_metadata.role` o `user_metadata.role`

### 4. Verificar Variables de Entorno

**⚠️ CRÍTICO**: Debes configurar las variables de entorno en DOS formatos:

#### Para el Cliente (Frontend) - Con prefijo VITE_:
- `VITE_SUPABASE_URL` - URL de tu proyecto Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anónima pública de Supabase
- `VITE_MAIN_DOMAIN` (opcional) - Dominio principal

#### Para Funciones Serverless (API Routes) - SIN prefijo VITE_:
- `SUPABASE_URL` - URL de tu proyecto Supabase (mismo valor que VITE_SUPABASE_URL)
- `SUPABASE_ANON_KEY` - Clave anónima pública de Supabase (mismo valor que VITE_SUPABASE_ANON_KEY)

**IMPORTANTE**: Las funciones serverless en Vercel NO pueden acceder a variables con prefijo `VITE_`. Por eso necesitas configurar ambas versiones.

**Cómo configurar:**
1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Agrega las 4 variables (2 con VITE_ y 2 sin VITE_)
3. Usa los mismos valores para `VITE_SUPABASE_URL` y `SUPABASE_URL`
4. Usa los mismos valores para `VITE_SUPABASE_ANON_KEY` y `SUPABASE_ANON_KEY`
5. Selecciona los ambientes: Production, Preview (y Development si lo necesitas)
6. Haz un **Redeploy** después de agregar las variables

**Ver más detalles en:** `VERCEL_ENV_SETUP.md`

### 5. Verificar Logs de Build

Si el problema persiste:
1. Ve a Vercel Dashboard → Deployments
2. Abre el último deployment
3. Revisa los logs de build para ver si hay errores
4. Revisa los logs de runtime si la aplicación se desplegó pero no funciona

### 6. Forzar Redeploy

Si los cambios no se aplican:
1. Ve a Vercel Dashboard → Deployments
2. Haz clic en los tres puntos del último deployment
3. Selecciona "Redeploy"
4. Espera a que termine el build

## Rutas Disponibles

- `/` - Landing page
- `/login` - Login de clientes
- `/admin/login` - Login de admin master
- `/admin` - Panel admin master
- `/client-admin` - Panel admin del cliente
- `/panel` - Vista previa del cliente (requiere autenticación)
- `/invitacion/:subdomain` - Invitación pública del cliente

## Solución de Problemas Adicionales

### Si las rutas siguen dando 404 después de redeploy:

1. Verifica que el archivo `dist/index.html` existe después del build
2. Verifica que el build se complete sin errores
3. Prueba acceder directamente a `https://bodas-ez22.vercel.app/` para ver si la app carga
4. Abre la consola del navegador (F12) y revisa si hay errores de JavaScript

### Si el admin master no carga:

1. Verifica que la ruta `/admin/login` carga (debería mostrar el formulario de login)
2. Si `/admin/login` da 404, el problema es de configuración de Vercel
3. Si `/admin/login` carga pero no puedes hacer login, el problema es de autenticación en Supabase
