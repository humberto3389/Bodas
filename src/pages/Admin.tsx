import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ToastContainer } from '../components/Toast'

import { useToast } from '../hooks/useToast'
import { useConfirmDialog } from '../hooks/useConfirmDialog'

import { useClientAdmin } from '../hooks/useClientAdmin'

// Import Lazy Loaded Admin Sections
import { AdminHeader } from './admin-sections/AdminHeader'
import { AdminStats } from './admin-sections/AdminStats'
import { ShareLink } from './admin-sections/ShareLink'
import { ContentEditor } from './admin-sections/ContentEditor'
import { RSVPManager } from './admin-sections/RSVPManager'
import { MessageManager } from './admin-sections/MessageManager'
import { MediaManager } from './admin-sections/MediaManager'
import { SYSTEM_CONFIG } from '../lib/config'

export default function Admin() {
  const { toasts, removeToast } = useToast()
  const { dialog } = useConfirmDialog()

  const {
    authed,
    clientSession,
    clientId,
    editForm,
    setEditForm,
    saveStatus,
    saveClientProfile,
    login,
    logout,
    rsvps,
    messages,
    imageFiles,
    audioFiles,
    videoFiles,
    handleUpload,
    handleDelete,
    deleteRSVP
  } = useClientAdmin()

  const [tokenInput, setTokenInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'content' | 'rsvps' | 'messages' | 'media'>('content')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Función para contar nombres válidos
  const countValidNames = (text: string): number => {
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .length;
  };

  // Función para obtener el total real de personas
  const getTotalGuests = (rsvp: any): number => {
    if (rsvp.is_attending === false) return 1; // Solo la persona que no asistirá
    
    const declaredGuests = Number(rsvp.guests) || 0;
    const actualNamesCount = countValidNames(rsvp.attending_names || '');
    
    // Usar el mayor entre lo declarado y lo que realmente escribió
    const guestsCount = Math.max(declaredGuests, actualNamesCount);
    
    return guestsCount + 1; // +1 por la persona principal
  };

  const totalGuests = rsvps.reduce((a, r) => {
    if (r.is_attending === false) return a;
    return a + getTotalGuests(r);
  }, 0)

  const totalNotAttending = rsvps.reduce((a, r) => {
    if (r.is_attending !== false) return a;
    return a + 1;
  }, 0)

  const handleClientLogin = async () => {
    if (!tokenInput.trim()) { setLoginError('Ingresa un token'); return }
    const success = await login(tokenInput.trim())
    if (!success) { setLoginError('Token inválido o error al autenticar.'); return }
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

    const headers = ['Nombre Principal', 'Email', 'Celular', 'Acompañantes', 'Total por Invitado', 'Asiste', 'Nombres Reportados', 'Fecha']
    const rows = filtered.map(r => {
      const totalCount = getTotalGuests(r);
      const declaredGuests = r.is_attending !== false ? (Number(r.guests) || 0) : 0;
      return [
        r.name,
        r.email,
        r.phone || '',
        declaredGuests,
        totalCount,
        r.is_attending !== false ? 'SI' : 'NO',
        r.is_attending !== false ? (r.attending_names || '') : (r.not_attending_names || ''),
        r.created_at ? new Date(r.created_at).toLocaleDateString() : ''
      ]
    })

    const csvContent = "sep=;\n\uFEFF" + [
      headers.join(';'),
      ...rows.map(line => line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
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

    const csvContent = "sep=;\n\uFEFF" + [
      headers.join(';'),
      ...rows.map(line => line.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
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

  const getPublicUrl = (bucket: string, path: string) => {
    // Basic helper to avoid breaking child components
    return `${SYSTEM_CONFIG.DATABASE.SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
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
          logout={logout}
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
                <RSVPManager rsvps={rsvps} totalGuests={totalGuests} totalNotAttending={totalNotAttending} onDownloadCSV={downloadRSVPs} onDeleteRSVP={deleteRSVP} getTotalGuests={getTotalGuests} client={clientSession} />
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
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {dialog}
    </>
  )
}
