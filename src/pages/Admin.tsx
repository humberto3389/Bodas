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
import { AdminTour } from '../components/AdminTour'
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
    galleryFiles,
    heroFiles,
    audioFiles,
    videoFiles,
    heroVideoFiles,
    handleUpload,
    handleDelete,
    deleteRSVP,
    submitTestimonial
  } = useClientAdmin()

  const [tokenInput, setTokenInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState<'content' | 'rsvps' | 'messages' | 'media' | 'testimonial'>('content')
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

  const [testimonialText, setTestimonialText] = useState('')
  const [testimonialName, setTestimonialName] = useState(clientSession?.clientName || '')
  const [testimonialRating, setTestimonialRating] = useState(5)
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false)
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false)

  const handleSubmitReview = async () => {
    if (!testimonialText.trim() || !testimonialName.trim()) return;
    setIsSubmittingTestimonial(true);
    const result = await submitTestimonial(testimonialText, testimonialName, testimonialRating);
    setIsSubmittingTestimonial(false);
    if (result.success) {
      setTestimonialSubmitted(true);
    }
  };

  const goToNextTab = () => {
    const tabs: ('content' | 'media' | 'rsvps' | 'messages' | 'testimonial')[] = ['content', 'media', 'rsvps', 'messages', 'testimonial'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevTab = () => {
    const tabs: ('content' | 'media' | 'rsvps' | 'messages' | 'testimonial')[] = ['content', 'media', 'rsvps', 'messages', 'testimonial'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {clientId && (
        <AdminTour 
          clientId={clientId} 
          clientName={clientSession?.clientName || 'Cliente'} 
          setActiveTab={setActiveTab} 
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
        <AdminHeader
          clientName={clientSession?.clientName || 'Cliente'}
          planType={clientSession?.planType || 'basic'}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          logout={logout}
          onUpgradeClick={() => window.open('https://wa.me/51958315579?text=Deseo%20mejorar%20mi%20plan', '_blank')}
          onTutorialClick={() => {
            // Reset tutorial if needed or just let AdminTour handle it
            window.location.reload();
          }}
        />

        <div className="w-full px-3 sm:px-6 py-4 sm:py-8 max-w-7xl mx-auto">
          {/* Main Navigation Tabs */}
          <div className="mb-6 sm:mb-10 w-full relative z-10">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">🛠️</span>
                Pasos de Configuración
              </h2>
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Progreso:</span>
                <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(Object.keys({content:0, media:1, rsvps:2, messages:3, testimonial:4}).indexOf(activeTab) + 1) * 20}%` }}
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-nowrap gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-3 sm:mx-0 px-3 sm:px-0 hide-scrollbar scroll-smooth">
              {[
                { id: 'content', icon: '📝', label: '1. Contenido', desc: 'Textos y fechas' },
                { id: 'media', icon: '🖼️', label: '2. Multimedia', desc: 'Fotos y videos' },
                { id: 'rsvps', icon: '👥', label: '3. RSVPs', desc: 'Tus invitados' },
                { id: 'messages', icon: '💌', label: '4. Mensajes', desc: 'Libro de firmas' },
                { id: 'testimonial', icon: '⭐', label: '5. Calificanos', desc: 'Tu opinión' },
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl transition-all min-w-[125px] sm:min-w-[150px] border-2 group shadow-sm flex-shrink-0 overflow-hidden
                    ${activeTab === tab.id 
                    ? 'border-rose-400 bg-white shadow-lg shadow-rose-100/50 ring-4 ring-rose-50/50' 
                    : 'border-slate-100 bg-white/70 text-slate-500 hover:bg-white hover:border-rose-200 hover:shadow-md'
                  }`}
                >
                  <span className={`text-2xl sm:text-3xl mb-2 transition-transform duration-500 ${activeTab === tab.id ? 'scale-110 rotate-3' : 'group-hover:scale-110 pb-1'}`}>
                    {tab.icon}
                  </span>
                  <span className={`text-xs sm:text-sm font-black mb-1 uppercase tracking-tight ${activeTab === tab.id ? 'text-rose-600' : 'text-slate-700'}`}>
                    {tab.label}
                  </span>
                  <span className={`text-[9px] sm:text-xs font-semibold text-center leading-tight px-1 ${activeTab === tab.id ? 'text-rose-400' : 'text-slate-400'}`}>
                    {tab.desc}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="adminTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-amber-500"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Top Overviews */}
          <div className="mb-8 space-y-6">
            <ShareLink subdomain={clientSession?.subdomain} />
            {activeTab !== 'testimonial' && (
              <AdminStats totalRsvps={rsvps.length} totalGuests={totalGuests} totalNotAttending={totalNotAttending} totalMessages={messages.length} client={clientSession} />
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'content' && (
              <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ContentEditor
                  editForm={editForm}
                  setEditForm={setEditForm}
                  saveStatus={saveStatus}
                  onSave={saveClientProfile}
                  client={clientSession}
                  imageFiles={heroFiles}
                  audioFiles={audioFiles}
                  videoFiles={heroVideoFiles}
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
                  imageFiles={galleryFiles}
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
            {activeTab === 'testimonial' && (
              <motion.div key="testimonial" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-white/60 max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 text-2xl mx-auto mb-4">⭐</div>
                    <h2 className="text-2xl font-bold text-slate-800">¡Tu opinión nos importa!</h2>
                    <p className="text-slate-600 mt-2">Comparte tu experiencia con Suspiro Nupcial y ayuda a otras parejas.</p>
                  </div>

                  {testimonialSubmitted ? (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center">
                      <div className="text-4xl mb-4">🎉</div>
                      <h3 className="text-xl font-bold text-emerald-900 mb-2">¡Gracias por tu reseña!</h3>
                      <p className="text-emerald-700">Tu testimonio ha sido enviado. Será revisado por el administrador antes de publicarse en la página principal.</p>
                      <button onClick={() => { setTestimonialSubmitted(false); setTestimonialText(''); }} className="mt-6 text-emerald-600 font-semibold hover:underline">Enviar otra reseña</button>
                    </motion.div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Tu Nombre (Puedes editarlo)</label>
                          <input
                            type="text"
                            value={testimonialName}
                            onChange={(e) => setTestimonialName(e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-rose-400 focus:outline-none transition-colors"
                            placeholder="Ana y Carlos"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">Calificación</label>
                          <div className="flex items-center gap-1 mt-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setTestimonialRating(star)}
                                onMouseEnter={(e) => {
                                  const buttons = e.currentTarget.parentElement?.children;
                                  if (buttons) {
                                    for (let i = 0; i < buttons.length; i++) {
                                      buttons[i].classList.toggle('text-rose-400', i < star);
                                      buttons[i].classList.toggle('text-slate-200', i >= star);
                                    }
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  const buttons = e.currentTarget.parentElement?.children;
                                  if (buttons) {
                                    for (let i = 0; i < buttons.length; i++) {
                                      buttons[i].classList.toggle('text-rose-400', i < testimonialRating);
                                      buttons[i].classList.toggle('text-slate-200', i >= testimonialRating);
                                    }
                                  }
                                }}
                                className={`text-3xl transition-colors focus:outline-none ${star <= testimonialRating ? 'text-rose-400' : 'text-slate-200'}`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje</label>
                        <textarea
                          placeholder="Cuéntanos qué te pareció el servicio, tus invitados, el panel de control..."
                          rows={5}
                          className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 focus:border-rose-400 focus:outline-none transition-colors resize-none"
                          value={testimonialText}
                          onChange={(e) => setTestimonialText(e.target.value)}
                        />
                      </div>
                      
                      <div className="bg-amber-50 rounded-xl p-4 flex gap-3 items-start border border-amber-100">
                        <div className="text-amber-500 mt-0.5">ℹ️</div>
                        <p className="text-xs text-amber-800">
                          Tu reseña será revisada por el administrador antes de ser publicada. 
                          Usaremos tu nombre de cliente y tu foto principal (si has subido una) para el testimonio.
                        </p>
                      </div>

                      <button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingTestimonial || !testimonialText.trim()}
                        className={`w-full font-bold px-6 py-4 rounded-2xl shadow-lg transition-all ${isSubmittingTestimonial || !testimonialText.trim() ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:scale-[1.02]'}`}
                      >
                        {isSubmittingTestimonial ? 'Enviando...' : '🚀 Enviar Reseña'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation Buttons */}
          <div className="mt-12 mb-20 flex items-center justify-between gap-4 border-t border-slate-200 pt-8">
            <button
              onClick={goToPrevTab}
              disabled={activeTab === 'content'}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'content' 
                ? 'opacity-0 pointer-events-none' 
                : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Paso Anterior
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    Object.keys({content:0, media:1, rsvps:2, messages:3, testimonial:4}).indexOf(activeTab) === i 
                    ? 'w-8 bg-rose-500' 
                    : 'bg-slate-200'
                  }`} 
                />
              ))}
            </div>

            <button
              onClick={goToNextTab}
              disabled={activeTab === 'testimonial'}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl ${
                activeTab === 'testimonial' 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:scale-[1.02]'
              }`}
            >
              {activeTab === 'content' ? 'Comenzar Configuración' : 'Siguiente Paso'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
      {dialog}
    </>
  )
}
