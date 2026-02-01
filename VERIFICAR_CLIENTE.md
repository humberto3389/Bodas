# Verificar Cliente Creado

## Paso 1: Verificar en Supabase

Ejecuta estos comandos en **Supabase SQL Editor**:

```sql
-- 1. Ver el último cliente creado en la tabla clients
SELECT 
    id,
    client_name,
    subdomain,
    email,
    token,
    is_active,
    plan_type,
    created_at
FROM clients
ORDER BY created_at DESC
LIMIT 1;
```

Copia el resultado aquí y dime:
- ¿Cuál es el `subdomain`?
- ¿Cuál es el `token`?
- ¿Cuál es el `email`?

---

## Paso 2: Verificar si existe en auth.users

```sql
-- 2. Buscar el usuario en auth.users usando el email del cliente
SELECT 
    id,
    email,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at
FROM auth.users
WHERE email LIKE '%SUBDOMAIN_DEL_CLIENTE%'
ORDER BY created_at DESC;
```

Reemplaza `SUBDOMAIN_DEL_CLIENTE` con el subdomain que obtuviste en el Paso 1.

---

## Paso 3: ¿Cómo intentas iniciar sesión?

Hay **2 formas** de iniciar sesión como cliente:

### Opción A: Con Token (Recomendado)
1. Ve a: `/client-admin`
2. Ingresa el **token** completo (el que aparece en la tabla `clients`)
3. Click en "Acceder"

### Opción B: Con Email/Password (Si está configurado)
1. Ve a: `/client-admin`
2. Usa el email y password

---

## Problema Común: Usuario no creado en auth.users

Si el cliente se creó en la tabla `clients` pero **NO en `auth.users`**, necesitas crearlo manualmente.

### Solución: Crear usuario en auth.users

```sql
-- IMPORTANTE: Reemplaza estos valores con los del cliente que creaste
DO $$
DECLARE
    v_client_id UUID;
    v_email TEXT;
    v_token TEXT;
    v_subdomain TEXT;
    v_client_name TEXT;
    v_plan_type TEXT;
    v_user_id UUID;
BEGIN
    -- 1. Obtener datos del último cliente creado
    SELECT id, email, token, subdomain, client_name, plan_type
    INTO v_client_id, v_email, v_token, v_subdomain, v_client_name, v_plan_type
    FROM clients
    ORDER BY created_at DESC
    LIMIT 1;

    -- 2. Usar email si existe, sino generar uno
    IF v_email IS NULL OR v_email = '' THEN
        v_email := 'client-' || v_subdomain || '@invitacionbodas.com';
    END IF;

    -- 3. Verificar si ya existe el usuario
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_email;

    -- 4. Si no existe, crearlo
    IF v_user_id IS NULL THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            v_email,
            crypt(v_token, gen_salt('bf')), -- Password = Token
            NOW(),
            jsonb_build_object(
                'provider', 'email',
                'providers', ARRAY['email']
            ),
            jsonb_build_object(
                'role', 'client',
                'subdomain', v_subdomain,
                'clientId', v_client_id,
                'clientName', v_client_name,
                'planType', v_plan_type
            ),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        )
        RETURNING id INTO v_user_id;

        -- 5. Crear identity
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            format('{"sub":"%s","email":"%s"}', v_user_id, v_email)::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
        );

        RAISE NOTICE 'Usuario creado exitosamente: % (ID: %)', v_email, v_user_id;
    ELSE
        RAISE NOTICE 'El usuario ya existe: % (ID: %)', v_email, v_user_id;
    END IF;

    -- 6. Actualizar el email en la tabla clients si estaba vacío
    UPDATE clients
    SET email = v_email
    WHERE id = v_client_id AND (email IS NULL OR email = '');

END $$;
```

---

## Resumen de Credenciales

Después de ejecutar los scripts, tus credenciales de login serán:

**Para login con Token:**
- Token: `[El token de la tabla clients]`

**Para login con Email/Password:**
- Email: `[El email de la tabla clients o client-SUBDOMAIN@invitacionbodas.com]`
- Password: `[El mismo token]`

---

Ejecuta el Paso 1 primero y dime qué resultado obtienes.
