import { motion } from 'framer-motion';
import AdminUploader from '../../components/AdminUploader';
import type { MediaFile } from '../../hooks/useUploader';
import { PLAN_LIMITS, getMaxDurationText, getEffectivePlan } from '../../lib/plan-limits';
import { AdminHelpTooltip } from '../../components/AdminHelpTooltip';

interface MediaManagerProps {
    imageFiles: MediaFile[];
    videoFiles: MediaFile[];
    onDelete: (bucket: 'gallery' | 'audio' | 'videos', fileName: string) => Promise<boolean>;
    onUpload: (bucket: 'gallery' | 'audio' | 'videos', file: File) => Promise<string | null>;
    getPublicUrl: (bucket: 'gallery' | 'audio' | 'videos', path: string) => string;
    client?: any;
    clientId: string;
    cinemaVideoAudioEnabled: boolean;
    onToggleAudio: (enabled: boolean) => void;
    onUpgradeClick?: () => void;
}

export function MediaManager({
    imageFiles,
    videoFiles,
    onDelete,
    onUpload,
    getPublicUrl,
    client,
    clientId,
    cinemaVideoAudioEnabled,
    onToggleAudio,
    onUpgradeClick
}: MediaManagerProps) {
    const effectivePlan = getEffectivePlan(client);
    const videoLimits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.basic;
    const imageLimits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.basic;
    const maxDurationText = getMaxDurationText(effectivePlan);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 sm:space-y-6 md:space-y-8"
        >
            {/* Header explicativo */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-3 sm:p-6 lg:p-8 shadow-2xl">
                <div className="max-w-3xl">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 sm:mb-3">Multimedia</h1>
                    <p className="text-slate-300 text-xs sm:text-sm mb-4">Añade fotos y videos para personalizar tu invitación</p>
                    <div className="bg-white/10 border border-white/20 p-4 rounded-xl backdrop-blur-md">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-1">Guía Rápida: Galería y Videos</h3>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                                    En esta sección puedes subir múltiples fotos para crear una hermosa galería que verán tus invitados. También puedes agregar videos de su historia si tu plan lo permite.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de Imágenes */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-3 sm:p-6 md:p-8 shadow-xl border border-white/40">
                <div className="flex items-center gap-1.5 mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                        Galería de Imágenes
                    </h2>
                    <AdminHelpTooltip content="Sube hasta 20 fotos para tu galería. Se verán hermosas en un carrusel interactivo en tu invitación." />
                </div>
                <AdminUploader
                    title="Fotos para tu invitación"
                    bucket="gallery"
                    files={imageFiles}
                    onUploadSuccess={async () => { }}
                    onUpload={onUpload}
                    onDelete={async (b, f) => { await onDelete(b, f); }}
                    getPublicUrl={getPublicUrl}
                    client={client}
                    clientId={clientId}
                    maxFiles={imageLimits.photos === Infinity ? 999 : imageLimits.photos}
                    onUpgradeClick={onUpgradeClick}
                />
            </div>

            {/* Sección de Video */}
            <div className={`bg-white/90 backdrop-blur-sm rounded-3xl p-3 sm:p-6 md:p-8 shadow-xl border border-white/40`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div>
                        <div className="flex items-center gap-1.5 font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">
                            <h2 className="text-lg sm:text-xl md:text-2xl">
                                Videos de la Invitación
                            </h2>
                            <AdminHelpTooltip content="Un video especial que cuenta su historia. Se recomienda formato vertical (tipo Reels/TikTok)." />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            Límite de tu plan: {videoLimits.videos === Infinity ? 'Ilimitado' : videoLimits.videos} videos ({maxDurationText} máx)
                        </p>
                    </div>

                    {effectivePlan === 'deluxe' && (
                        <div className="flex items-center gap-2 sm:gap-3 bg-white/50 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/60 whitespace-nowrap">
                            <span className="text-xs sm:text-sm text-slate-600 font-medium">Audio en Video</span>
                            <button
                                onClick={() => onToggleAudio(!cinemaVideoAudioEnabled)}
                                className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full transition-colors ${cinemaVideoAudioEnabled ? 'bg-green-500' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${cinemaVideoAudioEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}
                </div>

                <AdminUploader
                    title="Videos para tu galería"
                    bucket="videos"
                    files={videoFiles}
                    onUploadSuccess={async () => { }}
                    onUpload={onUpload}
                    onDelete={async (b, f) => { await onDelete(b, f); }}
                    getPublicUrl={getPublicUrl}
                    client={client}
                    clientId={clientId}
                    maxFiles={videoLimits.videos === Infinity ? 999 : videoLimits.videos}
                    onUpgradeClick={onUpgradeClick}
                />
            </div>
        </motion.div>
    );
}
