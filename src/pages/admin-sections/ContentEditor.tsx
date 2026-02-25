import { motion } from 'framer-motion';
import AdminUploader from '../../components/AdminUploader';
import { TimePicker } from '../../components/TimePicker';
import { PadrinosManager } from './PadrinosManager';
import type { MediaFile } from '../../hooks/useUploader';
import { getEffectivePlan } from '../../lib/plan-limits';

interface ContentEditorProps {
    editForm: any;
    setEditForm: (form: any) => void;
    saveStatus: 'idle' | 'saving' | 'success' | 'error';
    onSave: () => void;
    client?: any;
    imageFiles: MediaFile[];
    audioFiles: MediaFile[];
    videoFiles: MediaFile[];
    onUpload: (bucket: 'gallery' | 'audio' | 'videos', file: File, customFolder?: string) => Promise<string | null>;
    onDelete: (bucket: 'gallery' | 'audio' | 'videos', fileName: string) => Promise<boolean>;
    getPublicUrl: (bucket: 'gallery' | 'audio' | 'videos', path: string) => string;
    clientId: string;
    onUpgradeClick?: () => void;
}

export function ContentEditor({
    editForm,
    setEditForm,
    saveStatus,
    onSave,
    client,
    imageFiles,
    audioFiles,
    videoFiles,
    onUpload,
    onDelete,
    getPublicUrl,
    clientId,
    onUpgradeClick
}: ContentEditorProps) {
    const effectivePlan = getEffectivePlan(client);
    const isPremium = ['premium', 'deluxe'].includes(effectivePlan);
    const isDeluxe = effectivePlan === 'deluxe';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const val = type === 'checkbox' ? (e.target as any).checked : value;

        // Prevent circular references between ceremony and reception same-location toggles
        const update: any = { ...editForm, [name]: val };
        if (name === 'isCeremonySameAsReception' && val === true) {
            update.isReceptionSameAsCeremony = false;
        } else if (name === 'isReceptionSameAsCeremony' && val === true) {
            update.isCeremonySameAsReception = false;
        }

        setEditForm(update);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4 sm:space-y-6 md:space-y-8 pb-24"
        >
            {/* Header Section */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-3 sm:p-6 lg:p-8 shadow-2xl">
                <div className="max-w-3xl">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white mb-2 sm:mb-3">Configuración de la invitación</h1>
                    <p className="text-slate-300 text-xs sm:text-sm">Personaliza cada detalle de tu invitación digital</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">

                {/* Novios Section */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Novios</h2>
                    </div>

                    <div className="space-y-3 sm:space-y-5">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Nombre del evento</label>
                            <input
                                type="text"
                                name="clientName"
                                value={editForm.clientName}
                                onChange={handleChange}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                placeholder="Ej: Boda de Ana y Carlos"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Novio</label>
                                <input
                                    type="text"
                                    name="groomName"
                                    value={editForm.groomName}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Novia</label>
                                <input
                                    type="text"
                                    name="brideName"
                                    value={editForm.brideName}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fecha y Hora Section */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Fecha y hora</h2>
                    </div>

                    <div className="space-y-3 sm:space-y-5">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Fecha</label>
                                <input
                                    type="date"
                                    name="weddingDate"
                                    value={editForm.weddingDate}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                />
                            </div>
                            {/* Removed redundant generic TimePicker */}
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Tipo de ceremonia</label>
                            <input
                                type="text"
                                name="weddingType"
                                value={editForm.weddingType}
                                onChange={handleChange}
                                placeholder="Ej: Ceremonia religiosa"
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Ubicación Ceremonia */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-violet-500 to-violet-600 rounded-full"></div>
                            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Ceremonia</h2>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isCeremonySameAsReception"
                                checked={editForm.isCeremonySameAsReception}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-300 text-violet-500 focus:ring-2 focus:ring-violet-500/20"
                            />
                            <span className="text-xs sm:text-sm text-slate-600">Misma ubicación</span>
                        </label>
                    </div>

                    {!editForm.isCeremonySameAsReception ? (
                        <div className="space-y-3 sm:space-y-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Lugar</label>
                                <input
                                    type="text"
                                    name="churchName"
                                    value={editForm.churchName}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <TimePicker
                                    label="Hora de la ceremonia"
                                    value={editForm.weddingTime}
                                    onChange={(val) => setEditForm({ ...editForm, weddingTime: val })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Dirección</label>
                                <input
                                    type="text"
                                    name="ceremonyAddress"
                                    value={editForm.ceremonyAddress}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Referencia</label>
                                <input
                                    type="text"
                                    name="ceremonyReference"
                                    value={editForm.ceremonyReference}
                                    onChange={handleChange}
                                    placeholder="Ej: Frente al parque central"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Enlace de Google Maps</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        name="ceremonyMapUrl"
                                        value={editForm.ceremonyMapUrl}
                                        onChange={handleChange}
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
                                    />
                                    {editForm.ceremonyMapUrl && (
                                        <a
                                            href={editForm.ceremonyMapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 sm:px-4 py-2 sm:py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors flex items-center justify-center gap-2 min-h-[40px] sm:min-h-auto text-xs sm:text-sm whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="hidden sm:inline">Ver en mapa</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <div className="w-16 h-16 mx-auto bg-violet-50 rounded-full flex items-center justify-center text-violet-500 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-slate-600">Usando la misma ubicación que la recepción</p>
                        </div>
                    )}
                </div>

                {/* Ubicación Recepción */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1">
                            <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
                            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Recepción</h2>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isReceptionSameAsCeremony"
                                checked={editForm.isReceptionSameAsCeremony}
                                onChange={handleChange}
                                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-2 focus:ring-amber-500/20"
                            />
                            <span className="text-xs sm:text-sm text-slate-600">Misma ubicación</span>
                        </label>
                    </div>

                    {!editForm.isReceptionSameAsCeremony ? (
                        <div className="space-y-3 sm:space-y-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Lugar</label>
                                <input
                                    type="text"
                                    name="receptionLocationName"
                                    value={editForm.receptionLocationName}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <TimePicker
                                    label="Hora de la recepción"
                                    value={editForm.receptionTime}
                                    onChange={(val) => setEditForm({ ...editForm, receptionTime: val })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Dirección</label>
                                <input
                                    type="text"
                                    name="receptionAddress"
                                    value={editForm.receptionAddress}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Referencia</label>
                                <input
                                    type="text"
                                    name="receptionReference"
                                    value={editForm.receptionReference}
                                    onChange={handleChange}
                                    placeholder="Ej: Al lado del centro comercial"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Enlace de Google Maps</label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="text"
                                        name="receptionMapUrl"
                                        value={editForm.receptionMapUrl}
                                        onChange={handleChange}
                                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                                    />
                                    {editForm.receptionMapUrl && (
                                        <a
                                            href={editForm.receptionMapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2 sm:px-4 py-2 sm:py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 min-h-[40px] sm:min-h-auto text-xs sm:text-sm whitespace-nowrap"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="hidden sm:inline">Ver en mapa</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <div className="w-16 h-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-slate-600">Usando la misma ubicación que la ceremonia</p>
                        </div>
                    )}
                </div>

                {/* Textos Personalizados */}
                <div className="bg-white rounded-2xl p-3 sm:p-4 md:p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:col-span-2">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-2 h-6 sm:h-8 bg-gradient-to-b from-rose-500 to-rose-600 rounded-full"></div>
                        <h2 className="text-base sm:text-lg font-semibold text-slate-900">Textos personalizados</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                        {/* Text Col */}
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                            <div className="space-y-3 sm:space-y-5">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Versículo o poema</label>
                                    <textarea
                                        name="bibleVerse"
                                        value={editForm.bibleVerse}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none font-elegant text-sm sm:text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Referencia</label>
                                    <input
                                        type="text"
                                        name="bibleVerseBook"
                                        value={editForm.bibleVerseBook}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Mensaje de invitación</label>
                                    <textarea
                                        name="invitationText"
                                        value={editForm.invitationText}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none text-sm"
                                        placeholder="Ej: Nos complace invitarte a..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-rose-50/50 border border-rose-100 rounded-2xl cursor-pointer hover:bg-rose-100/50 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                            ⚠️
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Alerta de Emergencia</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Activar aviso para los invitados</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="isUrgent"
                                            checked={editForm.isUrgent}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-rose-600 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-inner"></div>
                                    </div>
                                </label>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2 text-rose-600">Motivo del cambio (Opcional)</label>
                                    <textarea
                                        name="changeExplanation"
                                        value={editForm.changeExplanation}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-rose-100 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none leading-relaxed text-sm"
                                        placeholder="Ej: Cambio de horario por clima, nueva ubicación del brindis..."
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Este texto aparecerá dentro del aviso urgente si la alerta está activada.</p>
                                </div>
                            </div>
                        </div>

                        {/* Decoration Image Col */}
                        <div className="lg:col-span-1 space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">Imagen de decoración</label>
                                <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest mb-2 sm:mb-3 font-semibold">Anillos, flores o ilustración</p>
                                <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-3 sm:p-4">
                                    <AdminUploader
                                        title=""
                                        bucket="gallery"
                                        files={imageFiles}
                                        onUploadSuccess={async () => { }}
                                        onUpload={onUpload}
                                        onDelete={async (b, f) => { await onDelete(b, f); }}
                                        getPublicUrl={getPublicUrl}
                                        setFileAsBackground={(url) => setEditForm({ ...editForm, verseImageUrl: url })}
                                        currentBackground={editForm.verseImageUrl}
                                        client={client}
                                        maxFiles={1}
                                        onUpgradeClick={onUpgradeClick}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Multimedia */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-gradient-to-b from-slate-700 to-slate-900 rounded-full"></div>
                        <h2 className="text-lg font-semibold text-slate-900">Multimedia</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Imagen de portada */}
                        <div className="md:col-span-2 space-y-4">
                            <label className="block text-sm font-medium text-slate-700">Imagen principal</label>
                            <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-4">
                                <AdminUploader
                                    title=""
                                    bucket="gallery"
                                    files={imageFiles}
                                    onUploadSuccess={async () => { }}
                                    onUpload={onUpload}
                                    onDelete={async (b, f) => { await onDelete(b, f); }}
                                    getPublicUrl={getPublicUrl}
                                    setFileAsBackground={(url) => setEditForm({ ...editForm, heroBackgroundUrl: url })}
                                    currentBackground={editForm.heroBackgroundUrl}
                                    client={client}
                                    maxFiles={1}
                                    onUpgradeClick={onUpgradeClick}
                                />
                            </div>
                        </div>

                        {/* Audio */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700">Música de fondo</label>
                                {!isPremium && (
                                    <button
                                        onClick={onUpgradeClick}
                                        className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition-colors"
                                    >
                                        ⭐ Premium
                                    </button>
                                )}
                            </div>
                            <div className={`bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-4 transition-opacity ${!isPremium ? 'opacity-50 pointer-events-none' : ''}`}>
                                <AdminUploader
                                    title=""
                                    bucket="audio"
                                    files={audioFiles}
                                    onUploadSuccess={async () => { }}
                                    onUpload={onUpload}
                                    onDelete={async (b, f) => { await onDelete(b, f); }}
                                    getPublicUrl={getPublicUrl}
                                    setFileAsBackground={(url) => setEditForm({ ...editForm, backgroundAudioUrl: url })}
                                    currentBackground={editForm.backgroundAudioUrl}
                                    client={client}
                                    maxFiles={1}
                                    onUpgradeClick={onUpgradeClick}
                                />
                            </div>
                        </div>

                        {/* Video */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-slate-700">Video de portada</label>
                                {!isDeluxe && (
                                    <button
                                        onClick={onUpgradeClick}
                                        className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-1 rounded hover:bg-slate-200 transition-colors"
                                    >
                                        💎 Deluxe
                                    </button>
                                )}
                            </div>
                            <div className={`bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-4 transition-opacity ${!isDeluxe ? 'opacity-50 pointer-events-none' : ''}`}>
                                <AdminUploader
                                    title=""
                                    bucket="videos"
                                    files={videoFiles}
                                    onUploadSuccess={async () => { }}
                                    onUpload={onUpload}
                                    onDelete={async (b, f) => { await onDelete(b, f); }}
                                    getPublicUrl={getPublicUrl}
                                    setFileAsBackground={(url) => setEditForm({ ...editForm, heroBackgroundVideoUrl: url })}
                                    currentBackground={editForm.heroBackgroundVideoUrl}
                                    client={client}
                                    maxFiles={1}
                                    clientId={clientId}
                                    onUpgradeClick={onUpgradeClick}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Opciones avanzadas */}
                    <div className="mt-8 pt-8 border-t border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-slate-900">Configuración avanzada</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <label className="flex items-center justify-between p-4 bg-white rounded-2xl border border-rose-100/50 shadow-sm cursor-pointer hover:shadow-md hover:border-rose-200 transition-all duration-300 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Audio en video</p>
                                            <p className="text-[10px] text-slate-500 font-medium">Habilitar sonido original del video</p>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            name="heroVideoAudioEnabled"
                                            checked={editForm.heroVideoAudioEnabled}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-rose-500 transition-all duration-300 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-inner"></div>
                                    </div>
                                </label>

                                <div className="p-5 bg-white rounded-2xl border border-amber-100/50 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Modo de visualización</p>
                                    </div>
                                    <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                                        {['image', 'video'].map((mode) => (
                                            <button
                                                key={mode}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, heroDisplayMode: mode })}
                                                className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${editForm.heroDisplayMode === mode
                                                    ? 'bg-white text-rose-600 shadow-md ring-1 ring-rose-100'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                {mode === 'image' ? 'Imagen' : 'Video Solo'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                                {!isDeluxe && (
                                    <div
                                        onClick={onUpgradeClick}
                                        className="absolute inset-0 z-10 bg-slate-50/40 backdrop-blur-[2px] cursor-pointer flex items-center justify-center group"
                                    >
                                        <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-slate-100 transform group-hover:scale-110 transition-transform">
                                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                <span>🔒 Bloqueado</span>
                                                <span className="text-rose-500">Exclusivo Deluxe</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">Efectos Especiales</h3>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Animación Deluxe</p>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-3 px-4 py-2 bg-slate-50/80 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activar Todo</span>
                                        <div className="relative inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={editForm.advancedAnimations?.enabled}
                                                onChange={(e) => setEditForm({
                                                    ...editForm,
                                                    advancedAnimations: { ...(editForm.advancedAnimations || {}), enabled: e.target.checked }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                                        </div>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { id: 'particleEffects', label: 'Brillo Mágico', sub: 'Partículas', icon: '✨', activeClass: 'border-rose-100 bg-white shadow-md', iconClass: 'bg-rose-50 text-rose-500' },
                                        { id: 'parallaxScrolling', label: 'Parallax', sub: 'Efecto Profundidad', icon: '💎', activeClass: 'border-amber-100 bg-white shadow-md', iconClass: 'bg-amber-50 text-amber-500' },
                                        { id: 'floatingElements', label: 'Flotantes', sub: 'Movimiento Suave', icon: '🎈', activeClass: 'border-indigo-100 bg-white shadow-md', iconClass: 'bg-indigo-50 text-indigo-500' }
                                    ].map((effect) => (
                                        <button
                                            key={effect.id}
                                            type="button"
                                            disabled={!isDeluxe}
                                            onClick={() => setEditForm({
                                                ...editForm,
                                                advancedAnimations: { ...(editForm.advancedAnimations || {}), [effect.id]: !editForm.advancedAnimations?.[effect.id] }
                                            })}
                                            className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 text-left ${editForm.advancedAnimations?.[effect.id]
                                                ? effect.activeClass
                                                : 'bg-slate-50/50 border-transparent hover:border-slate-200'
                                                } ${!isDeluxe ? 'cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all duration-500 shadow-sm ${editForm.advancedAnimations?.[effect.id] ? effect.iconClass : 'bg-slate-200/50 grayscale opacity-40'
                                                }`}>
                                                {effect.icon}
                                            </div>

                                            <div className="flex-1">
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${editForm.advancedAnimations?.[effect.id] ? 'text-slate-900' : 'text-slate-400'
                                                    }`}>
                                                    {effect.label}
                                                </p>
                                                <p className="text-[8px] font-medium text-slate-500 uppercase tracking-wider">
                                                    {effect.sub}
                                                </p>
                                            </div>

                                            {editForm.advancedAnimations?.[effect.id] && (
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Padrinos (Disponible para todos los planes) */}
                {clientId && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-2 h-8 bg-gradient-to-b from-fuchsia-500 to-fuchsia-600 rounded-full"></div>
                            <h2 className="text-lg font-semibold text-slate-900">Padrinos y madrinas</h2>
                        </div>

                        <PadrinosManager clientId={clientId} onUpload={onUpload} />
                    </div>
                )}
            </div>

            {/* Fixed Save Button */}
            <div className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-50">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSave}
                        disabled={saveStatus === 'saving'}
                        className={`px-4 sm:px-8 py-2.5 sm:py-4 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-white transition-all flex items-center justify-center gap-2 sm:gap-3 min-h-[40px] sm:min-h-auto ${saveStatus === 'saving' ? 'bg-slate-600' :
                            saveStatus === 'success' ? 'bg-emerald-500' :
                                saveStatus === 'error' ? 'bg-rose-500' :
                                    'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]'
                            }`}
                    >
                        {saveStatus === 'saving' ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Guardando...</span>
                            </>
                        ) : saveStatus === 'success' ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Guardado</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Guardar cambios</span>
                            </>
                        )}
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
}