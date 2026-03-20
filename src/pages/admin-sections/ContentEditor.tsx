import { motion } from 'framer-motion';
import AdminUploader from '../../components/AdminUploader';
import { TimePicker } from '../../components/TimePicker';
import { PadrinosManager } from './PadrinosManager';
import { AdminHelpTooltip } from '../../components/AdminHelpTooltip';
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
                    <p className="text-slate-300 text-xs sm:text-sm mb-4">Personaliza cada detalle de tu invitación digital</p>
                    <div className="bg-white/10 border border-white/20 p-4 rounded-xl backdrop-blur-md">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">💡</span>
                            <div>
                                <h3 className="text-white font-semibold text-sm mb-1">Guía Rápida: Textos, Fechas y Música</h3>
                                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                                    Esta es la pestaña principal. Aquí configurarás los nombres en la portada, la fecha, los lugares y horarios de la boda. Además, en la parte inferior podrás subir tu foto de portada, tu canción de fondo (audios) y tu video principal.
                                </p>
                            </div>
                        </div>
                    </div>
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
                            <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                Nombre del evento
                                <AdminHelpTooltip content="Este es el nombre título principal de tu panel y el nombre de referencia de tu invitación." />
                            </label>
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
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                    Novio
                                    <AdminHelpTooltip content="Nombre del novio tal como aparecerá en la invitación." />
                                </label>
                                <input
                                    type="text"
                                    name="groomName"
                                    value={editForm.groomName}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                    Novia
                                    <AdminHelpTooltip content="Nombre de la novia tal como aparecerá en la invitación." />
                                </label>
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
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                    Fecha
                                    <AdminHelpTooltip content="La fecha principal de la boda. Se usará para el contador de cuenta regresiva." />
                                </label>
                                <input
                                    type="date"
                                    name="weddingDate"
                                    value={editForm.weddingDate}
                                    onChange={handleChange}
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                />
                            </div>
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
                        <div className="flex items-center gap-2">
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
                            <AdminHelpTooltip content="Si la ceremonia es en el mismo lugar que la recepción, marca esto para ahorrar tiempo." />
                        </div>
                    </div>

                    {!editForm.isCeremonySameAsReception ? (
                        <div className="space-y-3 sm:space-y-5">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                    Lugar
                                    <AdminHelpTooltip content="Nombre del templo, iglesia o local donde será la ceremonia." />
                                </label>
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
                                <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700">Referencia</label>
                                    <AdminHelpTooltip content="Ej: Frente al parque central, portón blanco, etc. Ayuda a tus invitados a no perderse." />
                                </div>
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
                        <div className="flex items-center gap-2">
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
                            <AdminHelpTooltip content="Si la recepción es en el mismo lugar que la ceremonia, marca esto para ahorrar tiempo." />
                        </div>
                    </div>

                    {!editForm.isReceptionSameAsCeremony ? (
                        <div className="space-y-3 sm:space-y-5">
                            <div>
                                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                    Lugar
                                    <AdminHelpTooltip content="Nombre del salón, hotel o local donde será la recepción/fiesta." />
                                </label>
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
                                    <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2">
                                        Versículo o poema
                                        <AdminHelpTooltip content="Un texto corto que aparecerá de forma elegante al inicio de la invitación." />
                                    </label>
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
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Alerta de Emergencia</p>
                                                <AdminHelpTooltip content="Muestra un aviso importante (ej. cambio de local o clima) apenas el invitado abra la invitación." />
                                            </div>
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
                                    <label className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 mb-1.5 sm:mb-2 text-rose-600">
                                        Motivo del cambio (Opcional)
                                        <AdminHelpTooltip content="Este texto aparecerá dentro del cuadro de aviso urgente. Úsalo para explicar brevemente qué cambió." />
                                    </label>
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

                {/* Multimedia - Sección Rediseñada */}
                <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.05)] lg:col-span-2 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -z-0 opacity-50"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-10 bg-gradient-to-b from-indigo-500 to-indigo-700 rounded-full"></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-none">Fondo de Portada</h2>
                                <p className="text-xs text-slate-500 mt-1">Elige lo primero que verán tus invitados</p>
                            </div>
                        </div>

                        {/* Selector de modo */}
                        <div className="grid grid-cols-2 gap-4 mb-8 bg-slate-100 p-1.5 rounded-2xl max-w-md">
                            <button
                                type="button"
                                onClick={() => setEditForm({ ...editForm, heroDisplayMode: 'image' })}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${editForm.heroDisplayMode === 'image'
                                    ? 'bg-white text-indigo-600 shadow-lg ring-1 ring-slate-200 scale-[1.02]'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="text-lg">🖼️</span>
                                Foto Estática
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    if (isDeluxe) {
                                        setEditForm({ ...editForm, heroDisplayMode: 'video' });
                                    } else {
                                        onUpgradeClick?.();
                                    }
                                }}
                                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative ${editForm.heroDisplayMode === 'video'
                                    ? 'bg-white text-rose-600 shadow-lg ring-1 ring-slate-200 scale-[1.02]'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <span className="text-lg">🎬</span>
                                Video Animado
                                {!isDeluxe && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span></span>}
                            </button>
                        </div>

                        {/* Área de carga dinámica */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Visualizador / Uploader */}
                            <div className="space-y-4">
                                {editForm.heroDisplayMode === 'image' ? (
                                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                📷 Sube tu foto de portada
                                                <AdminHelpTooltip content="Esta foto aparecerá de fondo en toda la pantalla de bienvenida." />
                                            </h3>
                                        </div>
                                        <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-4 hover:border-indigo-400 transition-colors">
                                            <AdminUploader
                                                title=""
                                                bucket="gallery"
                                                customFolder="hero"
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
                                ) : (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                                📹 Sube tu Video de portada
                                                <AdminHelpTooltip content="Video cinemático que se reproduce automáticamente (Plan Deluxe)." />
                                            </h3>
                                            <span className="text-[10px] font-black bg-rose-100 text-rose-600 px-2 py-1 rounded-full uppercase">VIP Deluxe</span>
                                        </div>
                                        <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-4 hover:border-rose-400 transition-colors">
                                            <AdminUploader
                                                title=""
                                                bucket="videos"
                                                customFolder="hero"
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

                                        {/* Opción de Audio solo para Video */}
                                        <div className="mt-6 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between group cursor-pointer" onClick={() => setEditForm({...editForm, heroVideoAudioEnabled: !editForm.heroVideoAudioEnabled})}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-rose-500 shadow-sm transition-transform group-hover:scale-110">
                                                    {editForm.heroVideoAudioEnabled ? '🔊' : '🔇'}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">Audio del Video</p>
                                                    <p className="text-[10px] text-slate-500">¿Deseas que el video se escuche?</p>
                                                </div>
                                            </div>
                                            <button className={`w-10 h-5 rounded-full transition-colors relative ${editForm.heroVideoAudioEnabled ? 'bg-rose-500' : 'bg-slate-300'}`}>
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${editForm.heroVideoAudioEnabled ? 'left-6' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Música de Fondo - Separada por simplicidad */}
                            <div className="lg:border-l lg:pl-8 border-slate-100 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                        🎵 Música de Fondo
                                        <AdminHelpTooltip content="Sube el MP3 que sonará durante toda la navegación." />
                                    </h3>
                                    {!isPremium && <span className="text-[10px] font-black bg-amber-100 text-amber-600 px-2 py-1 rounded-full uppercase tracking-tighter">Premium</span>}
                                </div>
                                <div className={`bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-4 transition-all ${!isPremium ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-amber-400'}`}>
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
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <p className="text-[10px] text-blue-600 flex items-start gap-2">
                                        <span>ℹ️</span>
                                        La música de fondo se detiene automáticamente si un video con audio se está reproduciendo.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animaciones Avanzadas / Efectos Especiales */}
                <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.05)] lg:col-span-2 relative overflow-hidden">
                    {!isDeluxe && (
                        <div
                            onClick={onUpgradeClick}
                            className="absolute inset-0 z-20 bg-slate-50/40 backdrop-blur-[2px] cursor-pointer flex items-center justify-center group"
                        >
                            <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-slate-100 transform group-hover:scale-110 transition-transform flex items-center gap-3">
                                <span className="text-xl">🔒</span>
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Sección Bloqueada</p>
                                    <p className="text-[9px] text-rose-500 font-bold uppercase mt-1">Exclusivo Plan Deluxe</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-10 bg-gradient-to-b from-rose-500 to-rose-700 rounded-full"></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-none">Efectos Especiales</h2>
                                <p className="text-xs text-slate-500 mt-1">Dale un toque mágico a tu invitación</p>
                            </div>
                        </div>

                        <label className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
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
                                <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-rose-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-inner"></div>
                            </div>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { id: 'particleEffects', label: 'Brillo Mágico', sub: 'Partículas', icon: '✨', activeClass: 'border-rose-100 bg-white shadow-lg ring-1 ring-rose-50', iconClass: 'bg-rose-50 text-rose-500' },
                            { id: 'parallaxScrolling', label: 'Parallax', sub: 'Efecto Profundidad', icon: '💎', activeClass: 'border-amber-100 bg-white shadow-lg ring-1 ring-amber-50', iconClass: 'bg-amber-50 text-amber-500' },
                            { id: 'floatingElements', label: 'Flotantes', sub: 'Movimiento Suave', icon: '🎈', activeClass: 'border-indigo-100 bg-white shadow-lg ring-1 ring-indigo-50', iconClass: 'bg-indigo-50 text-indigo-500' }
                        ].map((effect) => (
                            <button
                                key={effect.id}
                                type="button"
                                disabled={!isDeluxe}
                                onClick={() => setEditForm({
                                    ...editForm,
                                    advancedAnimations: { ...(editForm.advancedAnimations || {}), [effect.id]: !editForm.advancedAnimations?.[effect.id] }
                                })}
                                className={`relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 text-left ${editForm.advancedAnimations?.[effect.id]
                                    ? effect.activeClass
                                    : 'bg-slate-50/50 border-transparent hover:border-slate-200'
                                    } ${!isDeluxe ? 'cursor-not-allowed opacity-40 grayscale' : ''}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-500 shadow-sm ${editForm.advancedAnimations?.[effect.id] ? effect.iconClass : 'bg-slate-200/50'
                                    }`}>
                                    {effect.icon}
                                </div>

                                <div className="flex-1">
                                    <p className={`text-xs font-black uppercase tracking-widest ${editForm.advancedAnimations?.[effect.id] ? 'text-slate-900' : 'text-slate-400'
                                        }`}>
                                        {effect.label}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                        {effect.sub}
                                    </p>
                                </div>

                                {editForm.advancedAnimations?.[effect.id] && (
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Padrinos */}
                {clientId && (
                    <div className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.05)] lg:col-span-2">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-2 h-10 bg-gradient-to-b from-fuchsia-500 to-fuchsia-700 rounded-full"></div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 leading-none">Padrinos y Madrinas</h2>
                                <p className="text-xs text-slate-500 mt-1">Personas especiales de tu ceremonia</p>
                            </div>
                        </div>
                        <PadrinosManager clientId={clientId} onUpload={onUpload} />
                    </div>
                )}
            </div>

            {/* Botón Flotante de Guardado */}
            <div className="fixed bottom-6 right-6 z-50">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onSave}
                    disabled={saveStatus === 'saving'}
                    className={`group px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] text-white transition-all shadow-2xl flex items-center gap-3 min-w-[200px] justify-center ${
                        saveStatus === 'saving' ? 'bg-slate-700 cursor-not-allowed' :
                        saveStatus === 'success' ? 'bg-emerald-500' :
                        saveStatus === 'error' ? 'bg-rose-500' :
                        'bg-slate-900 hover:bg-black shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
                    }`}
                >
                    {saveStatus === 'saving' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="text-lg group-hover:rotate-12 transition-transform">
                            {saveStatus === 'success' ? '✅' : '💾'}
                        </span>
                    )}
                    <span>{saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'success' ? '¡Guardado!' : 'Guardar Cambios'}</span>
                </motion.button>
            </div>
        </motion.div>
    );
}