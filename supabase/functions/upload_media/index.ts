// @ts-ignore - This is a Deno function
import { createClient } from '@supabase/supabase-js'

// @ts-ignore - Deno.serve is available in Deno runtime
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UploadRequest {
  bucket: 'gallery' | 'audio' | 'videos'
  path: string
  clientId: string
  token?: string
  file: string // base64 encoded
  contentType: string
}

// @ts-ignore - Deno.serve is available in Deno runtime
Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json() as UploadRequest
    const { bucket, path, clientId, token, file, contentType } = body

    // Validate inputs
    if (!bucket || !path || !clientId || !file) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: bucket, path, clientId, file' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    // @ts-ignore - Deno.env is available in Deno runtime
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    // @ts-ignore - Deno.env is available in Deno runtime
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    // @ts-ignore - Deno.env is available in Deno runtime
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role key for uploads (more permissive)
    const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey)

    // Validar límites del plan antes de subir (solo para gallery y videos)
    if (bucket === 'gallery' || bucket === 'videos') {
      // Obtener datos del cliente
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('plan_type, plan_status, pending_plan, pending_since, upgrade_approved_at, upgrade_confirmed, original_plan_type')
        .eq('id', clientId)
        .single()

      if (!clientError && clientData) {
        // Determinar plan efectivo
        let effectivePlan = clientData.plan_type || 'basic'
        
        // Si hay upgrade aprobado pero no confirmado, usar el plan aprobado si no han pasado 24h
        if (clientData.plan_status === 'upgrade_approved' && 
            clientData.upgrade_approved_at && 
            !clientData.upgrade_confirmed &&
            clientData.pending_plan) {
          const approvedAt = new Date(clientData.upgrade_approved_at)
          const now = new Date()
          const diffHours = (now.getTime() - approvedAt.getTime()) / (1000 * 60 * 60)
          
          if (diffHours < 24) {
            effectivePlan = clientData.pending_plan
          }
        } else if (clientData.plan_status === 'pending_upgrade' && 
                   clientData.pending_plan && 
                   clientData.pending_since) {
          const pendingSince = new Date(clientData.pending_since)
          const now = new Date()
          const diffHours = (now.getTime() - pendingSince.getTime()) / (1000 * 60 * 60)
          
          if (diffHours < 24) {
            effectivePlan = clientData.pending_plan
          }
        }

        // Límites por plan
        const PLAN_LIMITS: Record<string, { photos: number; videos: number }> = {
          basic: { photos: 30, videos: 1 },
          premium: { photos: 80, videos: 3 },
          deluxe: { photos: Infinity, videos: Infinity }
        }

        const limits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.basic
        const resourceType = bucket === 'gallery' ? 'photos' : 'videos'
        const limit = limits[resourceType]

        if (limit !== Infinity) {
          // Contar archivos actuales
          const folder = bucket === 'gallery' ? 'hero' : 'video'
          const listPath = `${clientId}/${folder}`
          
          const { data: files, error: listError } = await supabase.storage
            .from(bucket)
            .list(listPath, { limit: 1000 })

          if (!listError && files) {
            const currentCount = files.filter(
              f => !f.name.startsWith('.') && f.id
            ).length

            // Validar si excede el límite (usando < en lugar de <=)
            if (currentCount >= limit) {
              return new Response(
                JSON.stringify({ 
                  error: `Has alcanzado el límite de ${limit} ${resourceType === 'photos' ? 'fotos' : 'videos'} para el plan ${effectivePlan.toUpperCase()}. Mejora tu plan para añadir más.` 
                }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              )
            }
          }
        }
      }
    }

    // Decode base64 file
    let fileBuffer: Uint8Array
    try {
      const binaryString = atob(file)
      fileBuffer = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i)
      }
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Invalid base64 file data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(
        JSON.stringify({ error: `Upload failed: ${uploadError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    const publicUrl = data.publicUrl

    if (!publicUrl) {
      return new Response(
        JSON.stringify({ error: 'Could not get public URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        publicUrl: publicUrl,
        path: path,
        bucket: bucket
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    console.error('Function error:', err)
    return new Response(
      JSON.stringify({ error: `Function error: ${err instanceof Error ? err.message : String(err)}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
