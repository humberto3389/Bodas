import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { getCurrentClientData } from '../lib/client-data'
import { validateClientToken, authenticateClientWithToken, type ClientToken } from '../lib/auth-system'
import { formatTimeDisplay, localToUTC, UTCToLocal24h, validateAndFormatTime } from '../lib/timezone-utils'
import { compressImageForWeb } from '../utils/compressImage'

import { ToastContainer } from '../components/Toast'

import { useToast } from '../hooks/useToast'
import { useConfirmDialog } from '../hooks/useConfirmDialog'

import type { MediaFile } from '../hooks/useUploader'

// Import Lazy Loaded Admin Sections
import { AdminHeader } from './admin-sections/AdminHeader'
import { AdminStats } from './admin-sections/AdminStats'
import { ShareLink } from './admin-sections/ShareLink'
import { ContentEditor } from './admin-sections/ContentEditor'
import { RSVPManager } from './admin-sections/RSVPManager'
import { MessageManager } from './admin-sections/MessageManager'
import { MediaManager } from './admin-sections/MediaManager'

type RSVP = {
  name: string;
  email: string;
  phone?: string;
  guests: number;
  created_at?: string;
  is_attending?: boolean;
  attending_names?: string;
  not_attending_names?: string;
}

type Message = { name: string; message: string; created_at?: string }

export default function Admin() {
  const { toasts, addToast, removeToast } = useToast()
  const { dialog } = useConfirmDialog()

  // Auth State
  const [authed, setAuthed] = useState(() => !!sessionStorage.getItem('clientAuth'))
  const [tokenInput, setTokenInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'content' | 'rsvps' | 'messages' | 'media'>('content')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [clientSession, setClientSession] = useState<ClientToken | null>(() => {
    try {
      const s = sessionStorage.getItem('clientAuth')
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  // Data State
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [imageFiles, setImageFiles] = useState<MediaFile[]>([])
  const [audioFiles, setAudioFiles] = useState<MediaFile[]>([])
  const [videoFiles, setVideoFiles] = useState<MediaFile[]>([])

  const totalGuests = useMemo(() => rsvps.reduce((a, r) => {
    if (r.is_attending === false) return a;
    return a + (Number(r.guests) || 0) + 1;
  }, 0), [rsvps])

  const totalNotAttending = useMemo(() => rsvps.reduce((a, r) => {
    if (r.is_attending !== false) return a;
    return a + 1;
  }, 0), [rsvps])


  const detectedClient = getCurrentClientData()
  const clientLike = authed ? (clientSession || detectedClient) : null
  const clientId = clientLike ? clientLike.id : null

  // Form State
  const [editForm, setEditForm] = useState({
    clientName: clientLike?.clientName || 'Humberto & Nelida',
    groomName: clientLike?.groomName || 'Humberto',
    brideName: clientLike?.brideName || 'Nelida',
    weddingDate: clientLike?.weddingDate ? (typeof clientLike.weddingDate === 'string' ? (clientLike.weddingDate as string).split('T')[0] : (clientLike.weddingDate as Date).toISOString().split('T')[0]) : '2026-01-24',
    weddingTime: formatTimeDisplay(clientLike?.weddingTime || '18:00', false),
    weddingLocation: clientLike?.weddingLocation || 'Iglesia San José',
    weddingType: clientLike?.weddingType || 'Boda Cristiana',
    religiousSymbol: clientLike?.religiousSymbol || '✝',
    bibleVerse: clientLike?.bibleVerse || 'El amor es paciente, es bondadoso… el amor nunca deja de ser.',
    bibleVerseBook: clientLike?.bibleVerseBook || '1 Corintios 13',
    invitationText: clientLike?.invitationText || 'Están cordialmente invitados a celebrar con nosotros este día tan especial.',
    backgroundAudioUrl: clientLike?.backgroundAudioUrl || '',
    heroBackgroundUrl: clientLike?.heroBackgroundUrl || '/boda.avif',
    heroBackgroundVideoUrl: clientSession?.heroBackgroundVideoUrl || '',
    heroDisplayMode: (clientSession?.heroDisplayMode || 'image') as 'image' | 'video',
    heroVideoAudioEnabled: clientSession?.heroVideoAudioEnabled || false,
    advancedAnimations: clientSession?.advancedAnimations || {
      enabled: false,
      particleEffects: false,
      parallaxScrolling: false,
      floatingElements: false
    },
    mapCoordinates: clientLike?.mapCoordinates || { lat: -12.0932, lng: -77.0314 },
    churchName: clientLike?.churchName || 'Iglesia San José',
    ceremonyLocationName: clientLike?.ceremonyLocationName || 'Iglesia San José',
    receptionLocationName: clientLike?.receptionLocationName || '',
    receptionTime: formatTimeDisplay(clientLike?.receptionTime || '21:00', false),
    ceremonyAddress: clientLike?.ceremonyAddress || '',
    ceremonyReference: clientLike?.ceremonyReference || '',
    ceremonyMapUrl: clientLike?.ceremonyMapUrl || '',
    receptionAddress: clientLike?.receptionAddress || '',
    receptionReference: clientLike?.receptionReference || '',
    receptionMapUrl: clientLike?.receptionMapUrl || '',
    isReceptionSameAsCeremony: clientLike?.isReceptionSameAsCeremony || false
  })

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  // Maintain Auth
  useEffect(() => {
    if (!authed || !clientSession?.token) return
    const maintainAuth = async () => await authenticateClientWithToken(clientSession.token)
    maintainAuth()
    const interval = setInterval(maintainAuth, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [authed, clientSession?.token])

  // Load Client Data
  useEffect(() => {
    if (!authed || !clientId) return

    // safe session access
    const currentSession = clientSession

    const loadClientData = async () => {
      try {
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .maybeSingle()

        if (error || !clientData || !currentSession) return

        const currentPlanType = currentSession.planType || 'basic'

        // Logic to respect Plan limits when loading form data (similar to old admin)
        const audioUrl = ['premium', 'deluxe'].includes(currentPlanType) && clientData.background_audio_url
          ? clientData.background_audio_url
          : (currentSession.backgroundAudioUrl || undefined)

        const videoUrl = clientData.hero_background_video_url || currentSession.heroBackgroundVideoUrl || undefined

        const advAnimations = currentPlanType === 'deluxe'
          ? (clientData.advanced_animations || currentSession.advancedAnimations || { enabled: false, particleEffects: false, parallaxScrolling: false, floatingElements: false })
          : { enabled: false, particleEffects: false, parallaxScrolling: false, floatingElements: false }

        const updated: ClientToken = {
          ...currentSession,
          clientName: clientData.client_name || currentSession.clientName,
          groomName: clientData.groom_name || currentSession.groomName,
          brideName: clientData.bride_name || currentSession.brideName,
          weddingDate: clientData.wedding_date ? (typeof clientData.wedding_date === 'string' ? clientData.wedding_date.split('T')[0] : clientData.wedding_date) : currentSession.weddingDate,
          weddingTime: clientData.wedding_datetime_utc
            ? UTCToLocal24h(clientData.wedding_datetime_utc)
            : formatTimeDisplay(clientData.wedding_time || currentSession.weddingTime, false),
          weddingLocation: clientData.wedding_location || currentSession.weddingLocation,
          weddingType: clientData.wedding_type || currentSession.weddingType,
          religiousSymbol: clientData.religious_symbol || currentSession.religiousSymbol,
          bibleVerse: clientData.bible_verse || currentSession.bibleVerse,
          bibleVerseBook: clientData.bible_verse_book || currentSession.bibleVerseBook,
          invitationText: clientData.invitation_text || currentSession.invitationText,
          ceremonyAddress: clientData.ceremony_address || currentSession.ceremonyAddress,
          ceremonyReference: clientData.ceremony_reference || currentSession.ceremonyReference,
          ceremonyMapUrl: clientData.ceremony_map_url || currentSession.ceremonyMapUrl,
          receptionAddress: clientData.reception_address || currentSession.receptionAddress,
          receptionReference: clientData.reception_reference || currentSession.receptionReference,
          receptionMapUrl: clientData.reception_map_url || currentSession.receptionMapUrl,
          isReceptionSameAsCeremony: clientData.is_reception_same_as_ceremony ?? currentSession.isReceptionSameAsCeremony ?? false,
          backgroundAudioUrl: audioUrl,
          heroBackgroundUrl: clientData.hero_background_url || currentSession.heroBackgroundUrl,
          heroBackgroundVideoUrl: videoUrl,
          heroDisplayMode: (clientData.hero_display_mode || currentSession.heroDisplayMode || 'image') as 'image' | 'video',
          heroVideoAudioEnabled: clientData.hero_video_audio_enabled ?? currentSession.heroVideoAudioEnabled ?? false,
          advancedAnimations: advAnimations,
          mapCoordinates: clientData.map_coordinates || currentSession.mapCoordinates,
          churchName: clientData.church_name || currentSession.churchName,
          ceremonyLocationName: clientData.ceremony_location_name || currentSession.ceremonyLocationName,
          receptionLocationName: clientData.reception_location_name || currentSession.receptionLocationName,
        }

        sessionStorage.setItem('clientAuth', JSON.stringify(updated))
        window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(updated) } }))
        setClientSession(updated)

        setEditForm(prev => ({
          ...prev,
          clientName: updated.clientName || prev.clientName,
          groomName: updated.groomName || prev.groomName,
          brideName: updated.brideName || prev.brideName,
          weddingDate: updated.weddingDate ? (updated.weddingDate instanceof Date ? updated.weddingDate.toISOString().split('T')[0] : (typeof updated.weddingDate === 'string' ? (updated.weddingDate as string).split('T')[0] : '')) : prev.weddingDate,
          weddingTime: updated.weddingTime || prev.weddingTime,
          weddingLocation: updated.weddingLocation || prev.weddingLocation,
          weddingType: updated.weddingType || prev.weddingType,
          religiousSymbol: updated.religiousSymbol || prev.religiousSymbol,
          bibleVerse: updated.bibleVerse || prev.bibleVerse,
          bibleVerseBook: updated.bibleVerseBook || prev.bibleVerseBook,
          ceremonyAddress: updated.ceremonyAddress || prev.ceremonyAddress,
          ceremonyReference: updated.ceremonyReference || prev.ceremonyReference,
          ceremonyMapUrl: updated.ceremonyMapUrl || prev.ceremonyMapUrl,
          receptionAddress: updated.receptionAddress || prev.receptionAddress,
          receptionReference: updated.receptionReference || prev.receptionReference,
          receptionMapUrl: updated.receptionMapUrl || prev.receptionMapUrl,
          isReceptionSameAsCeremony: updated.isReceptionSameAsCeremony ?? prev.isReceptionSameAsCeremony ?? false,
          invitationText: updated.invitationText || prev.invitationText,
          backgroundAudioUrl: updated.backgroundAudioUrl || prev.backgroundAudioUrl,
          heroBackgroundUrl: updated.heroBackgroundUrl || prev.heroBackgroundUrl,
          heroBackgroundVideoUrl: updated.heroBackgroundVideoUrl || prev.heroBackgroundVideoUrl,
          heroDisplayMode: updated.heroDisplayMode || prev.heroDisplayMode,
          heroVideoAudioEnabled: updated.heroVideoAudioEnabled || prev.heroVideoAudioEnabled,
          advancedAnimations: updated.advancedAnimations || prev.advancedAnimations,
          mapCoordinates: updated.mapCoordinates || prev.mapCoordinates,
          churchName: updated.churchName || prev.churchName,
          ceremonyLocationName: updated.ceremonyLocationName || prev.ceremonyLocationName,
          receptionLocationName: updated.receptionLocationName || prev.receptionLocationName,
          receptionTime: updated.receptionTime || prev.receptionTime,
        }))

      } catch (err) { console.error(err) }
    }

    loadClientData()
  }, [authed, clientId])

  // Load RSVPs and Messages
  useEffect(() => {
    if (!authed || !clientId) return
    const fetchData = async () => {
      const { data: rData } = await supabase.from('rsvps').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
      if (rData) setRsvps(rData as RSVP[])

      const { data: mData } = await supabase.from('messages').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
      if (mData) setMessages(mData as Message[])
    }
    fetchData()
  }, [authed, clientId])

  // Load Files Helper
  const listClientFiles = async (bucket: 'gallery' | 'audio' | 'videos'): Promise<MediaFile[]> => {
    if (!clientId) return []
    let folder = bucket === 'gallery' ? 'hero' : bucket === 'audio' ? 'audio' : 'video'
    const { data } = await supabase.storage.from(bucket).list(`${clientId}/${folder}`, { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })

    const files: MediaFile[] = (data || []).filter(f => !f.name.startsWith('.') && f.id).map(f => ({
      name: f.name,
      path: `${clientId}/${folder}/${f.name}`,
      created: f.created_at || new Date().toISOString()
    }))
    return files
  }

  // File Loading Effect
  useEffect(() => {
    if (!authed || !clientId) return
    const loadFiles = async () => {
      const [imgs, auds, vids] = await Promise.all([listClientFiles('gallery'), listClientFiles('audio'), listClientFiles('videos')])

      setImageFiles([{ name: 'Imagen por Defecto', path: '/boda.avif', created: new Date().toISOString(), isSystem: true }, ...imgs])
      setAudioFiles([{ name: 'Música por Defecto', path: '/audio.ogg', created: new Date().toISOString(), isSystem: true }, ...auds])
      setVideoFiles([{ name: 'Video por Defecto', path: '/hero.webm', created: new Date().toISOString(), isSystem: true }, ...vids])
    }
    loadFiles()
    const i = setInterval(loadFiles, 10000)
    return () => clearInterval(i)
  }, [authed, clientId])


  //--- ACTIONS ---//

  const handleClientLogin = async () => {
    if (!tokenInput.trim()) { setLoginError('Ingresa un token'); return }
    const validated = await validateClientToken(tokenInput.trim())
    if (!validated) { setLoginError('Token inválido o expirado'); return }

    const authSuccess = await authenticateClientWithToken(tokenInput.trim())
    if (!authSuccess) { setLoginError('Error al autenticar en Supabase.'); return }

    localStorage.setItem('clientAuth', JSON.stringify(validated))
    window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(validated) } }))
    setClientSession(validated)
    setAuthed(true)
  }

  const saveClientProfile = async () => {
    if (!clientSession) return
    setSaveStatus('saving')
    try {
      const currentPlanType = clientSession.planType || 'basic'

      // --- Plan Validation Logic ---
      let audioUrl: string | null = null
      if (['premium', 'deluxe'].includes(currentPlanType) && editForm.backgroundAudioUrl) {
        const trimmed = editForm.backgroundAudioUrl.trim()
        if (trimmed && (trimmed.includes('supabase.co') || trimmed.startsWith('/'))) {
          audioUrl = trimmed
        }
      }

      let heroVideoUrl: string | null = null
      if (currentPlanType === 'deluxe' && editForm.heroBackgroundVideoUrl) {
        const trimmed = editForm.heroBackgroundVideoUrl.trim()
        if (trimmed && (trimmed.includes('supabase.co') || trimmed.startsWith('/'))) {
          heroVideoUrl = trimmed
        }
      }

      const advancedAnimations = currentPlanType === 'deluxe'
        ? editForm.advancedAnimations
        : { enabled: false, particleEffects: false, parallaxScrolling: false, floatingElements: false }

      // --- Debug & Paranoia Check for 12 PM ---
      let timeInput = editForm.weddingTime;
      // Ensure we are working with a clean string
      if (!timeInput) timeInput = '12:00';

      console.log('[saveClientProfile] Raw weddingTime from form:', timeInput);

      const cleanTime = validateAndFormatTime(timeInput);
      console.log('[saveClientProfile] Validated cleanTime:', cleanTime);

      const weddingUTC = localToUTC(editForm.weddingDate, cleanTime);
      console.log('[saveClientProfile] Calculated weddingUTC:', weddingUTC);




      // --- DB Update ---
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          client_name: editForm.clientName,
          wedding_date: editForm.weddingDate ? `${editForm.weddingDate}T12:00:00` : null, // Fix time to noon to avoid zone shifts
          wedding_datetime_utc: weddingUTC, // CRITICAL: Save absolute UTC time
          groom_name: editForm.groomName || null,
          bride_name: editForm.brideName || null,
          wedding_time: validateAndFormatTime(editForm.weddingTime) || null,
          wedding_location: editForm.weddingLocation || null,
          wedding_type: editForm.weddingType || null,
          religious_symbol: editForm.religiousSymbol || null,
          bible_verse: editForm.bibleVerse || null,
          bible_verse_book: editForm.bibleVerseBook || null,
          ceremony_address: editForm.ceremonyAddress || null,
          ceremony_reference: editForm.ceremonyReference || null,
          ceremony_map_url: editForm.ceremonyMapUrl || null,
          reception_address: editForm.receptionAddress || null,
          reception_reference: editForm.receptionReference || null,
          reception_map_url: editForm.receptionMapUrl || null,
          reception_time: editForm.receptionTime || null,
          is_reception_same_as_ceremony: editForm.isReceptionSameAsCeremony,
          invitation_text: editForm.invitationText || null,
          background_audio_url: audioUrl,
          hero_background_url: (editForm.heroBackgroundUrl && (editForm.heroBackgroundUrl.includes('supabase.co') || editForm.heroBackgroundUrl.startsWith('/'))) ? editForm.heroBackgroundUrl : null,
          hero_background_video_url: heroVideoUrl,
          hero_display_mode: editForm.heroDisplayMode || 'image',
          hero_video_audio_enabled: editForm.heroVideoAudioEnabled,
          church_name: editForm.churchName || null,
          ceremony_location_name: editForm.ceremonyLocationName || null,
          reception_location_name: editForm.receptionLocationName || null,
          advanced_animations: advancedAnimations,
        })
        .eq('id', clientId)

      if (updateError) throw updateError

      // --- Local State Update ---
      const updated: ClientToken = {
        ...clientSession,
        ...editForm as any, // lazy spread, be careful
        backgroundAudioUrl: audioUrl || undefined,
        heroBackgroundUrl: (editForm.heroBackgroundUrl && (editForm.heroBackgroundUrl.includes('supabase.co') || editForm.heroBackgroundUrl.startsWith('/'))) ? editForm.heroBackgroundUrl : undefined,
        heroBackgroundVideoUrl: heroVideoUrl || undefined,
        advancedAnimations: advancedAnimations,
        weddingDate: editForm.weddingDate ? new Date(editForm.weddingDate) : clientSession.weddingDate,
      }

      sessionStorage.setItem('clientAuth', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('clientAuthUpdated', { detail: { clientAuth: JSON.stringify(updated) } }))
      setClientSession(updated)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (err) {
      console.error(err)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }
  }

  const handleUpload = async (bucket: 'gallery' | 'audio' | 'videos', file: File): Promise<string | null> => {
    if (!clientId) return null
    try {
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        fileToUpload = await compressImageForWeb(file);
      }

      let folder = bucket === 'gallery' ? 'hero' : bucket === 'audio' ? 'audio' : 'video'
      const path = `${clientId}/${folder}/${fileToUpload.name}`
      const blob = new Blob([fileToUpload], { type: fileToUpload.type })

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: fileToUpload.type })

      if (uploadError) throw uploadError

      // Refresh list
      const [imgs, auds, vids] = await Promise.all([listClientFiles('gallery'), listClientFiles('audio'), listClientFiles('videos')])

      setImageFiles([{ name: 'Imagen por Defecto', path: '/boda.webp', created: new Date().toISOString(), isSystem: true }, ...imgs])
      setAudioFiles([{ name: 'Música por Defecto', path: '/audio.ogg', created: new Date().toISOString(), isSystem: true }, ...auds])
      setVideoFiles([{ name: 'Video por Defecto', path: '/hero.webm', created: new Date().toISOString(), isSystem: true }, ...vids])

      const { data } = supabase.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    } catch (e) {
      addToast('error', 'Error al subir archivo')
      return null
    }
  }

  const handleDelete = async (bucket: 'gallery' | 'audio' | 'videos', fileName: string): Promise<boolean> => {
    if (!clientId) return false

    // Determine path.
    // listClientFiles returns path as: `${clientId}/${folder}/${f.name}`
    // fileName coming from UI components usually is just the name OR the full path depending on implementation.
    // AdminUploader usually passes the file object or name.
    // Let's assume fileName is the full path if it contains /, otherwise construct it?
    // In old Admin.tsx: 
    // if (bucket === 'gallery') path = `${clientId}/hero/${fileName}`
    // BUT listClientFiles there returned names. 
    // Here listClientFiles returns objects with 'path'.
    // AdminUploader calls onDelete(bucket, file.path) or file.name?
    // Let's check AdminUploader. It uses file.name usually if it's simpler, or we pass the whole object.

    // To be safe, let's look at ContentEditor calling it:
    // onDelete={async (b, f) => { await onDelete(b, f); }}
    // And AdminUploader calls it with: onDelete(bucket, file.name)

    // So `fileName` is just the name (e.g. "photo.jpg").

    let folder = bucket === 'gallery' ? 'hero' : bucket === 'audio' ? 'audio' : 'video'
    // But wait, listClientFiles prepends clientId/folder/ to the path in the state object.
    // If the UI passes back `file.name` from the state object, it will be the filename.

    const path = `${clientId}/${folder}/${fileName}`

    try {
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) throw error

      // Refresh
      const [imgs, auds, vids] = await Promise.all([listClientFiles('gallery'), listClientFiles('audio'), listClientFiles('videos')])

      setImageFiles([{ name: 'Imagen por Defecto', path: '/boda.jpg', created: new Date().toISOString(), isSystem: true }, ...imgs])
      setAudioFiles([{ name: 'Música por Defecto', path: '/audio.mp3', created: new Date().toISOString(), isSystem: true }, ...auds])
      setVideoFiles([{ name: 'Video por Defecto', path: '/hero.mp4', created: new Date().toISOString(), isSystem: true }, ...vids])

      // Clear from form if selected
      if (bucket === 'gallery' && editForm.heroBackgroundUrl?.includes(fileName)) {
        setEditForm(prev => ({ ...prev, heroBackgroundUrl: '' }))
      } else if (bucket === 'videos' && editForm.heroBackgroundVideoUrl?.includes(fileName)) {
        setEditForm(prev => ({ ...prev, heroBackgroundVideoUrl: '' }))
      } else if (bucket === 'audio' && editForm.backgroundAudioUrl?.includes(fileName)) {
        setEditForm(prev => ({ ...prev, backgroundAudioUrl: '' }))
      }

      return true
    } catch (err) {
      addToast('error', 'Error al eliminar archivo')
      return false
    }
  }

  const getPublicUrl = (bucket: 'gallery' | 'audio' | 'videos', path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data?.publicUrl || ''
  }
  const downloadRSVPs = (filterStatus?: boolean) => {
    if (rsvps.length === 0) return

    let filtered = [...rsvps]
    if (filterStatus === true) filtered = rsvps.filter(r => r.is_attending !== false)
    else if (filterStatus === false) filtered = rsvps.filter(r => r.is_attending === false)
    else {
      filtered.sort((a, b) => {
        const aVal = a.is_attending !== false ? 1 : 0
        const bVal = b.is_attending !== false ? 1 : 0
        return bVal - aVal
      })
    }

    const headers = ['Nombre Principal', 'Email', 'Celular', 'Acompañantes', 'Asiste', 'Nombres Reportados', 'Fecha']
    const rows = filtered.map(r => [
      r.name,
      r.email,
      r.phone || '',
      r.is_attending !== false ? (Number(r.guests) || 0) : 0,
      r.is_attending !== false ? 'SI' : 'NO',
      r.is_attending !== false ? (r.attending_names || '') : (r.not_attending_names || ''),
      r.created_at ? new Date(r.created_at).toLocaleDateString() : ''
    ])

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(line => line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    let fileName = 'lista_rsvps.csv'
    if (filterStatus === true) fileName = 'asistentes.csv'
    if (filterStatus === false) fileName = 'no_asistentes.csv'
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadMessages = () => {
    if (messages.length === 0) return

    const headers = ['Nombre', 'Mensaje', 'Fecha']
    const rows = messages.map(m => [
      m.name,
      m.message,
      m.created_at ? new Date(m.created_at).toLocaleDateString() : ''
    ])

    const csvContent = "\uFEFF" + [
      headers.join(','),
      ...rows.map(line => line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'mensajes_invitados.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }



  //--- RENDER ---//

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 grid place-items-center px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/60">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">💍</div>
              <h1 className="text-3xl font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent mb-3">Panel de Administración</h1>
            </div>
            <div className="space-y-6">
              <input type="text" placeholder="Pega tu token aquí..." className="w-full px-4 py-4 rounded-2xl border-2 border-white/60 bg-white/80" value={tokenInput} onChange={e => setTokenInput(e.target.value)} />
              {loginError && <div className="text-rose-500 text-sm text-center">{loginError}</div>}
              <button onClick={handleClientLogin} className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold px-6 py-4 rounded-2xl shadow-lg">Ingresar</button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <AdminHeader
          clientName={clientSession?.clientName || 'Cliente'}
          planType={clientSession?.planType || 'basic'}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          logout={() => { sessionStorage.removeItem('clientAuth'); setAuthed(false) }}
          onUpgradeClick={() => window.open('https://wa.me/51958315579?text=Deseo%20mejorar%20mi%20plan', '_blank')}
        />

        <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
          <ShareLink subdomain={clientSession?.subdomain} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 sm:pb-0">
            {[
              { id: 'content', label: '📝 Contenido' },
              { id: 'rsvps', label: '👥 RSVPs' },
              { id: 'messages', label: '💌 Mensajes' },
              { id: 'media', label: '🖼️ Media' },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg' : 'bg-white/80 text-neutral-700'}`}>
                {tab.label}
              </button>
            ))}
          </motion.div>

          <AdminStats totalRsvps={rsvps.length} totalGuests={totalGuests} totalNotAttending={totalNotAttending} totalMessages={messages.length} client={clientSession} />

          <AnimatePresence mode="wait">
            {activeTab === 'content' && (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ContentEditor
                  editForm={editForm}
                  setEditForm={setEditForm}
                  saveStatus={saveStatus}
                  onSave={saveClientProfile}
                  client={clientSession}
                  imageFiles={imageFiles}
                  audioFiles={audioFiles}
                  videoFiles={videoFiles}
                  onUpload={handleUpload}
                  onDelete={handleDelete}
                  getPublicUrl={getPublicUrl}
                  clientId={clientId || ''}
                  onUpgradeClick={() => window.open('https://wa.me/51958315579?text=Deseo%20mejorar%20mi%20plan', '_blank')}
                />
              </motion.div>
            )}
            {activeTab === 'rsvps' && (
              <motion.div key="rsvps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <RSVPManager rsvps={rsvps} totalGuests={totalGuests} totalNotAttending={totalNotAttending} onDownloadCSV={downloadRSVPs} client={clientSession} />
              </motion.div>
            )}
            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MessageManager messages={messages} onDownloadCSV={downloadMessages} />
              </motion.div>
            )}
            {activeTab === 'media' && (
              <motion.div key="media" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MediaManager
                  imageFiles={imageFiles}
                  videoFiles={videoFiles}
                  onDelete={handleDelete}
                  onUpload={handleUpload}
                  getPublicUrl={getPublicUrl}
                  clientId={clientId || ''}
                  client={clientSession}
                  cinemaVideoAudioEnabled={editForm.heroVideoAudioEnabled}
                  onToggleAudio={(val) => setEditForm({ ...editForm, heroVideoAudioEnabled: val })}
                  onUpgradeClick={() => window.open('https://wa.me/51958315579?text=Deseo%20mejorar%20mi%20plan', '_blank')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ToastContainer toasts={toasts}
        onClose={removeToast}
      />{dialog}
    </>
  )
}
