import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { LoadingSpinner } from './LoadingSpinner'
import { motion, AnimatePresence } from 'framer-motion'
import { compressImageForWeb } from '../utils/compressImage'

interface AdminUploaderProps {
  title: string
  bucket: 'gallery' | 'audio' | 'videos'
  files: Array<{ name: string; path: string; created: string; isSystem?: boolean }>
  onUploadSuccess: (bucket: 'gallery' | 'audio' | 'videos') => Promise<void>
  onDelete: (bucket: 'gallery' | 'audio' | 'videos', fileName: string) => Promise<void>
  getPublicUrl: (bucket: 'gallery' | 'audio' | 'videos', path: string) => string
  setFileAsBackground?: (url: string) => void
  onUpload?: (bucket: 'gallery' | 'audio' | 'videos', file: File) => Promise<string | null>
  currentBackground?: string
  onProgress?: (progress: { isUploading: boolean; progress: number; fileName: string }) => void
  client?: any
  allowedMimeTypes?: string[]
  maxFiles?: number
  planRequired?: 'premium' | 'deluxe'
  clientId?: string
  onUpgradeClick?: () => void
}

export default function AdminUploader({
  title,
  bucket,
  files,
  onUploadSuccess,
  onDelete,
  getPublicUrl,
  setFileAsBackground,
  onUpload,
  currentBackground,
  onProgress,
  client,
  allowedMimeTypes = [],
  maxFiles = 10,
  planRequired,
  clientId,
  onUpgradeClick,
}: AdminUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const planType = client?.planType || 'basic'
  const isPlanSufficient = !planRequired ||
    (planRequired === 'premium' && (planType === 'premium' || planType === 'deluxe')) ||
    (planRequired === 'deluxe' && planType === 'deluxe')

  async function onPick() {
    inputRef.current?.click()
  }

  async function onFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    if (!selectedFiles.length) return

    // Validar límite de cantidad de archivos usando lógica centralizada
    const resourceType = bucket === 'gallery' ? 'photos' : bucket === 'videos' ? 'videos' : null;

    if (resourceType && client && clientId) {
      const { checkLimit } = await import('../lib/plan-limits');
      const { countFilesInStorage } = await import('../lib/storage-utils');

      // Contar archivos desde storage (fuente de verdad)
      const currentCount = await countFilesInStorage(clientId, bucket);
      const totalAfterUpload = currentCount + selectedFiles.length;

      const { allowed, message: limitMsg } = checkLimit(client, resourceType, totalAfterUpload);

      if (!allowed) {
        setMessage(`Límite alcanzado: ${limitMsg}`);
        return;
      }
    }

    const invalidFiles = selectedFiles.filter(f =>
      allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(f.type)
    )

    if (invalidFiles.length > 0) {
      setMessage(`Error: Tipos de archivo no permitidos`)
      return
    }

    // Validación de tamaño (Max 50MB)
    const MAX_SIZE_MB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const oversizedFiles = selectedFiles.filter(f => f.size > MAX_SIZE_BYTES);

    if (oversizedFiles.length > 0) {
      setMessage(`Error: El archivo "${oversizedFiles[0].name}" excede el límite de ${MAX_SIZE_MB}MB.`);
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      for (const file of selectedFiles) {
        if (onProgress) {
          onProgress({ isUploading: true, progress: 0, fileName: file.name })
        }

        let fileToUpload = file;
        if (file.type.startsWith('image/')) {
          fileToUpload = await compressImageForWeb(file);
        }

        if (onUpload) {
          const url = await onUpload(bucket, fileToUpload);
          if (!url) throw new Error('Error al subir archivo');
        } else {
          const fileName = fileToUpload.name

          const { error } = await supabase.storage
            .from(bucket)
            .upload(`${fileName}`, fileToUpload, {
              cacheControl: '3600',
              upsert: true
            })

          if (error) throw error
        }

        if (onProgress) {
          onProgress({ isUploading: false, progress: 100, fileName: fileToUpload.name })
        }
      }

      await onUploadSuccess(bucket)
      setMessage('Archivo(s) subido(s) correctamente.')
    } catch (err: any) {
      setMessage(`Error subiendo archivo(s): ${err?.message || err}`)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
      if (onProgress) {
        onProgress({ isUploading: false, progress: 0, fileName: '' })
      }
    }
  }

  if (!isPlanSufficient) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg border border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
            <p className="text-neutral-600 text-sm">Esta función requiere el plan {planRequired === 'deluxe' ? 'Deluxe' : 'Premium'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg border border-neutral-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-neutral-800">{title}</h3>
          <p className="text-sm text-neutral-500">{files.length} archivo(s)</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            multiple={maxFiles > 1}
            accept={allowedMimeTypes.length > 0 ? allowedMimeTypes.join(',') : undefined}
            className="hidden"
            onChange={onFilesSelected}
            disabled={uploading}
          />
          <button
            onClick={onPick}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                Subiendo...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Subir
              </>
            )}
          </button>
        </div>
      </div>

      {message && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`mb-8 overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur-xl transition-all duration-500 ${message.includes('Error') || message.includes('Límite')
              ? 'bg-white/80 border-rose-100 shadow-rose-500/10'
              : 'bg-white/80 border-emerald-100 shadow-emerald-500/10'
              }`}
          >
            <div className={`h-1.5 w-full ${message.includes('Error') || message.includes('Límite') ? 'bg-gradient-to-r from-rose-400 to-rose-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
              }`} />

            <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${message.includes('Error') || message.includes('Límite') ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                  }`}>
                  {message.includes('Error') || message.includes('Límite') ? '✨' : '⭐'}
                </div>
                <div>
                  <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${message.includes('Error') || message.includes('Límite') ? 'text-rose-900' : 'text-emerald-900'
                    }`}>
                    {message.includes('Límite') ? 'Potencial Ilimitado' : 'Aviso del Sistema'}
                  </h4>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-md">
                    {message}
                  </p>
                </div>
              </div>

              {(message.includes('Límite') && onUpgradeClick) && (
                <button
                  onClick={onUpgradeClick}
                  className="group relative px-8 py-3.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-rose-600 transition-all duration-500 shadow-lg hover:shadow-rose-500/40 flex items-center gap-3 overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    Mejorar Experiencia
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {files.length === 0 ? (
        <div className="text-center py-12 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 00-2 2z" />
            </svg>
          </div>
          <p className="text-sm text-neutral-500 font-medium tracking-wide">No hay archivos subidos todavía</p>
        </div>
      ) : (
        <div className={`grid gap-6 ${bucket === 'gallery'
          ? 'grid-cols-3'
          : bucket === 'videos'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1'
          }`}>
          {(isExpanded ? files : files.slice(0, 3)).map((file, index) => {
            const fileUrl = file.isSystem ? file.path : getPublicUrl(bucket, file.path);
            const isSelected = !!(currentBackground && (currentBackground === fileUrl || currentBackground.includes(file.name)));

            return (
              <div
                key={`${file.path}-${index}`}
                className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 ${isSelected
                  ? 'border-rose-400 bg-rose-50/30 ring-4 ring-rose-50'
                  : 'border-neutral-100 bg-white hover:border-rose-200 hover:shadow-xl hover:-translate-y-1'
                  }`}
              >
                {/* Visual Preview */}
                <div className={`relative ${bucket === 'gallery' ? 'aspect-square' : bucket === 'videos' ? 'aspect-video' : 'p-4'}`}>
                  {bucket === 'gallery' ? (
                    <img
                      src={fileUrl}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : bucket === 'videos' ? (
                    <div className="w-full h-full bg-slate-900 overflow-hidden relative">
                      <video src={fileUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-all duration-300">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500 flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[11px] text-slate-800 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">Audio MP3</p>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {file.isSystem && (
                      <span className="px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-[9px] font-black text-white uppercase rounded-lg border border-white/20 tracking-widest">Sistema</span>
                    )}
                    {isSelected && (
                      <span className="px-2.5 py-1 bg-rose-500 text-[9px] font-black text-white uppercase rounded-lg shadow-lg tracking-widest ring-2 ring-white/20">En Uso</span>
                    )}
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    {!file.isSystem && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(bucket, file.name); }}
                        className="p-2.5 bg-white shadow-lg text-slate-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-rose-500 hover:text-white scale-90 group-hover:scale-100 transform"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                {setFileAsBackground && (
                  <div className="p-3 bg-neutral-50 border-t border-neutral-100">
                    <button
                      onClick={() => setFileAsBackground(fileUrl)}
                      className={`w-full py-2.5 text-[10px] font-black uppercase tracking-[0.05em] rounded-xl transition-all duration-300 ${isSelected
                        ? 'bg-rose-100 text-rose-600 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-rose-500 hover:shadow-xl hover:shadow-rose-500/30'
                        }`}
                      disabled={isSelected}
                    >
                      {isSelected ? 'Seleccionado' : 'Seleccionar'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {files.length > 3 && (
        <div className="mt-8 flex justify-center gap-4">
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-100 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 shadow-sm"
            >
              Ver más
              <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setIsExpanded(false)}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-rose-100 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 shadow-sm"
            >
              Ver menos
              <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
