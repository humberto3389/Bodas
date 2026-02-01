import { useState, useRef } from 'react';
import { usePadrinos, type Padrino, type PadrinoFormData } from '../../hooks/usePadrinos';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface PadrinosManagerProps {
    clientId: string;
    onUpload: (bucket: 'gallery' | 'audio' | 'videos', file: File, customFolder?: string) => Promise<string | null>;
}

const ROLE_SUGGESTIONS = [
    'Padrino',
    'Madrina',
    'Padrino de Anillos',
    'Madrina de Anillos',
    'Padrino de Arras',
    'Madrina de Arras',
    'Padrino de Velación',
    'Madrina de Velación',
    'Padrino de Lazo',
    'Madrina de Lazo',
    'Padrino de Honor',
    'Madrina de Honor'
];

export function PadrinosManager({ clientId, onUpload }: PadrinosManagerProps) {
    const {
        padrinos,
        loading,
        error,
        addPadrino,
        updatePadrino,
        deletePadrino,
        toggleActive,
        reorderPadrinos
    } = usePadrinos(clientId);

    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPadrino, setEditingPadrino] = useState<Padrino | null>(null);
    const [formData, setFormData] = useState<PadrinoFormData>({
        name: '',
        role: '',
        description: '',
        photo_url: '',
        is_active: true
    });
    const [saving, setSaving] = useState(false);

    const openModal = (padrino?: Padrino) => {
        if (padrino) {
            setEditingPadrino(padrino);
            setFormData({
                name: padrino.name,
                role: padrino.role,
                description: padrino.description || '',
                photo_url: padrino.photo_url || '',
                is_active: padrino.is_active
            });
        } else {
            setEditingPadrino(null);
            setFormData({
                name: '',
                role: '',
                description: '',
                photo_url: '',
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPadrino(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.role) return;

        setSaving(true);
        try {
            if (editingPadrino) {
                await updatePadrino(editingPadrino.id, formData);
            } else {
                await addPadrino(formData);
            }
            closeModal();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este padrino?')) {
            await deletePadrino(id);
        }
    };

    const movePadrino = async (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= padrinos.length) return;

        const newOrder = [...padrinos];
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        await reorderPadrinos(newOrder.map(p => p.id));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-800">Padrinos y Madrinas</h3>
                    <p className="text-sm text-neutral-500">Gestiona las personas especiales de tu ceremonia</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors flex items-center gap-2"
                >
                    <span className="text-lg">+</span>
                    Agregar Padrino
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* Padrinos List */}
            {padrinos.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                    <div className="text-4xl mb-4">👤</div>
                    <p className="text-neutral-500">No hay padrinos agregados</p>
                    <p className="text-sm text-neutral-400 mt-1">Haz clic en "Agregar Padrino" para comenzar</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {padrinos.map((padrino, index) => (
                        <div
                            key={padrino.id}
                            className={`p-4 bg-white rounded-xl border-2 transition-all ${padrino.is_active
                                ? 'border-neutral-100 hover:border-rose-200'
                                : 'border-neutral-100 opacity-50'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Order Controls */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => movePadrino(index, 'up')}
                                        disabled={index === 0}
                                        className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => movePadrino(index, 'down')}
                                        disabled={index === padrinos.length - 1}
                                        className="p-1 text-neutral-400 hover:text-neutral-600 disabled:opacity-30"
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Photo/Avatar */}
                                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                    {padrino.photo_url ? (
                                        <img src={padrino.photo_url} alt={padrino.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-rose-500 font-bold">
                                            {padrino.name.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-neutral-800 truncate">{padrino.name}</h4>
                                        <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">
                                            {padrino.role}
                                        </span>
                                        {!padrino.is_active && (
                                            <span className="px-2 py-0.5 bg-neutral-200 text-neutral-500 text-xs font-medium rounded-full">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>
                                    {padrino.description && (
                                        <p className="text-sm text-neutral-500 truncate mt-1">{padrino.description}</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(padrino.id)}
                                        className={`p-2 rounded-lg transition-colors ${padrino.is_active
                                            ? 'text-green-600 hover:bg-green-50'
                                            : 'text-neutral-400 hover:bg-neutral-100'
                                            }`}
                                        title={padrino.is_active ? 'Desactivar' : 'Activar'}
                                    >
                                        {padrino.is_active ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                    <button
                                        onClick={() => openModal(padrino)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(padrino.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-neutral-800 mb-6">
                            {editingPadrino ? 'Editar Padrino' : 'Agregar Padrino'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <label className="block">
                                <span className="text-sm font-semibold text-neutral-700">Nombre completo *</span>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ej: Juan Pérez García"
                                    className="mt-1 block w-full rounded-xl border-neutral-200 focus:border-rose-400 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                                />
                            </label>

                            {/* Role */}
                            <label className="block">
                                <span className="text-sm font-semibold text-neutral-700">Rol *</span>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    list="role-suggestions"
                                    required
                                    placeholder="Ej: Padrino de Anillos"
                                    className="mt-1 block w-full rounded-xl border-neutral-200 focus:border-rose-400 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                                />
                                <datalist id="role-suggestions">
                                    {ROLE_SUGGESTIONS.map(role => (
                                        <option key={role} value={role} />
                                    ))}
                                </datalist>
                            </label>

                            {/* Description */}
                            <label className="block">
                                <span className="text-sm font-semibold text-neutral-700">Descripción (opcional)</span>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ej: Tío del novio, amigo de la familia..."
                                    rows={2}
                                    className="mt-1 block w-full rounded-xl border-neutral-200 focus:border-rose-400 focus:ring focus:ring-rose-200 focus:ring-opacity-50"
                                />
                            </label>

                            {/* Photo Upload */}
                            <div className="block">
                                <span className="text-sm font-semibold text-neutral-700 block mb-2">Foto (opcional)</span>

                                <div className="flex items-center gap-4">
                                    {/* Preview */}
                                    <div className="w-20 h-20 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0 relative group">
                                        {formData.photo_url ? (
                                            <>
                                                <img
                                                    src={formData.photo_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, photo_url: '' })}
                                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs"
                                                >
                                                    Eliminar
                                                </button>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                                👤
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                setUploadingPhoto(true);
                                                try {
                                                    // Add timestamp prefix to avoid name collisions
                                                    const renamedFile = new File(
                                                        [file],
                                                        `padrino-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`,
                                                        { type: file.type }
                                                    );

                                                    const url = await onUpload('gallery', renamedFile, 'padrinos');
                                                    if (url) {
                                                        setFormData(prev => ({ ...prev, photo_url: url }));
                                                    }
                                                } catch (err) {
                                                    console.error('Error uploading photo:', err);
                                                    alert('Error al subir la foto');
                                                } finally {
                                                    setUploadingPhoto(false);
                                                    // Reset input so same file can be selected again if needed
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }
                                            }}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingPhoto}
                                            className="px-4 py-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 font-medium text-sm hover:bg-rose-100 transition-colors flex items-center gap-2"
                                        >
                                            {uploadingPhoto ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    Subiendo...
                                                </>
                                            ) : (
                                                <>
                                                    📷 {formData.photo_url ? 'Cambiar Foto' : 'Subir Foto'}
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-neutral-400 mt-1">
                                            Recomendado: formato cuadrado, máx 2MB
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 rounded border-neutral-300 text-rose-500 focus:ring-rose-500"
                                />
                                <span className="text-sm text-neutral-700">Mostrar en la invitación</span>
                            </label>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !formData.name || !formData.role}
                                    className="flex-1 px-4 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving && <LoadingSpinner size="sm" />}
                                    {editingPadrino ? 'Guardar Cambios' : 'Agregar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
