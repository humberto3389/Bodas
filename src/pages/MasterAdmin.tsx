import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog.tsx';
import { useConfirmDialog } from '../hooks/useConfirmDialog.tsx';
import { useMasterAdmin } from '../hooks/useMasterAdmin';

import { SYSTEM_CONFIG, getClientUrl } from '../lib/config';
import { loadLandingPageContent, saveLandingPageContent, type LandingPageContent } from '../lib/landing-page-content';

// Función auxiliar para verificar si un usuario es master admin
// Verifica en app_metadata.role === 'master_admin' o correos autorizados
export function isMasterAdmin(user: any): boolean {
  if (!user) return false;

  // Lista blanca de correos de administradores
  const adminEmails = ['mhuallpasullca@gmail.com'];
  if (user.email && adminEmails.includes(user.email)) return true;

  return user?.app_metadata?.role === 'master_admin' || user?.user_metadata?.role === 'master_admin'
}


import { useClientFiltering } from '../hooks/useClientFiltering';
import { useClients } from '../hooks/useClients';
import {
  type Client,
  type NewClientForm
} from '../lib/clients-admin';

type DashboardView = 'overview' | 'clients' | 'analytics' | 'settings' | 'landing' | 'messages';



// Componente para el formulario de creación de cliente
const ClientCreateForm = ({
  newClient,
  setNewClient,
  createClient,
  setIsCreatingClient,
  subdomainManual,
  setSubdomainManual
}: {
  newClient: NewClientForm;
  setNewClient: (client: NewClientForm) => void;
  createClient: () => void;
  setIsCreatingClient: (creating: boolean) => void;
  subdomainManual: boolean;
  setSubdomainManual: (manual: boolean) => void;
}) => {
  const generateSubdomain = (clientName: string): string => {
    return clientName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .replace(/^-+|-+$/g, '') // Quitar guiones al inicio y final
      .substring(0, 30);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200"
    >
      <h3 className="text-xl font-serif font-bold text-slate-800 mb-6">
        Crear Nuevo Cliente
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre de la Pareja *
          </label>
          <input
            type="text"
            autoFocus
            value={newClient.clientName}
            onChange={(e) => {
              setNewClient({
                ...newClient,
                clientName: e.target.value,
                subdomain: subdomainManual ? newClient.subdomain : generateSubdomain(e.target.value)
              });
            }}
            placeholder="Ana Rodríguez y Carlos López"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Subdominio *
          </label>
          <input
            type="text"
            value={newClient.subdomain}
            onChange={(e) => {
              if (!subdomainManual) setSubdomainManual(true);
              setNewClient({ ...newClient, subdomain: e.target.value });
            }}
            placeholder="ana-carlos"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-indigo-600"
          />
          <p className="mt-2 text-xs text-slate-500">
            Dominio completo: https://{newClient.subdomain || 'tu-subdominio'}-invitacion.vercel.app
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            placeholder="ejemplo@bodas.com"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Plan *
          </label>
          <select
            value={newClient.plan}
            onChange={(e) => setNewClient({ ...newClient, plan: e.target.value as 'basic' | 'premium' | 'deluxe' })}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900"
          >
            <option value="basic">Básico - ${SYSTEM_CONFIG.PLANS.basic.price}</option>
            <option value="premium">Premium - ${SYSTEM_CONFIG.PLANS.premium.price}</option>
            <option value="deluxe">Deluxe - ${SYSTEM_CONFIG.PLANS.deluxe.price}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fecha de la Boda *
          </label>
          <input
            type="date"
            value={newClient.weddingDate}
            onChange={(e) => setNewClient({ ...newClient, weddingDate: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Número de Invitados
          </label>
          <input
            type="number"
            value={newClient.guestCount}
            onChange={(e) => setNewClient({ ...newClient, guestCount: parseInt(e.target.value) || 100 })}
            min={1}
            max={1000}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre de la Novia
          </label>
          <input
            type="text"
            value={newClient.brideName}
            onChange={(e) => setNewClient({ ...newClient, brideName: e.target.value })}
            placeholder="Ana Rodríguez"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-indigo-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre del Novio
          </label>
          <input
            type="text"
            value={newClient.groomName}
            onChange={(e) => setNewClient({ ...newClient, groomName: e.target.value })}
            placeholder="Carlos López"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-indigo-600"
          />
        </div>

        <div className="md:col-span-2 flex gap-3 pt-4">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={createClient}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Crear Cliente
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreatingClient(false)}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
          >
            Cancelar
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente para la vista grid de clientes
const ClientGridView = ({
  filteredClients,
  setSelectedClient,
  getStatusColor,
  getPlanColor,
  getDaysUntilExpiry,
  confirmUpgrade
}: {
  filteredClients: Client[];
  setSelectedClient: (client: Client) => void;
  getStatusColor: (status: Client['status']) => string;
  getPlanColor: (plan: Client['plan']) => string;
  getDaysUntilExpiry: (expiresAt: string) => number;
  confirmUpgrade: (id: string, plan: 'premium' | 'deluxe') => Promise<boolean>;
}) => (
  <motion.div
    key="grid-view"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
  >
    {filteredClients.map((client, index) => (
      <motion.div
        key={client.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
        onClick={() => setSelectedClient(client)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-2xl">
            {client.avatar}
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(client.status)} text-white`}>
              {client.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPlanColor(client.plan)} text-white`}>
              {client.plan}
            </span>
          </div>
        </div>

        <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-indigo-600 transition-colors duration-300">
          {client.clientName}
        </h3>

        <p className="text-slate-600 text-sm mb-4 flex items-center gap-2">
          📧 {client.email || 'Sin email'}
        </p>

        <div className="space-y-2 text-sm text-slate-500">
          <div className="flex justify-between">
            <span>Subdominio:</span>
            <span className="font-mono text-slate-700">{client.subdomain}</span>
          </div>
          <div className="flex justify-between">
            <span>Token:</span>
            <span className="font-mono text-slate-700 text-xs truncate max-w-[120px]">{client.token}</span>
          </div>
          <div className="flex justify-between">
            <span>Boda:</span>
            <span>{new Date(client.weddingDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Invitados:</span>
            <span>{client.guestCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Expira en:</span>
            <span className={getDaysUntilExpiry(client.expiresAt) < 7 ? 'text-red-500 font-semibold' : 'text-slate-700'}>
              {getDaysUntilExpiry(client.expiresAt)} días
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-500">
            Creado: {new Date(client.createdAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            {client.planStatus === 'pending_upgrade' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`¿Confirmar upgrade a ${client.pendingPlan?.toUpperCase()} para ${client.clientName}?`)) {
                    confirmUpgrade(client.id, client.pendingPlan || 'premium');
                  }
                }}
                className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors border border-amber-200"
              >
                Confirmar {client.pendingPlan?.toUpperCase()}
              </button>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              className="text-slate-400 hover:text-indigo-600 transition-colors duration-300"
            >
              →
            </motion.button>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

// Componente para la vista lista de clientes
const ClientListView = ({
  filteredClients,
  setSelectedClient,
  getStatusColor,
  getPlanColor,
  getDaysUntilExpiry,
  confirmUpgrade
}: {
  filteredClients: Client[];
  setSelectedClient: (client: Client) => void;
  getStatusColor: (status: Client['status']) => string;
  getPlanColor: (plan: Client['plan']) => string;
  getDaysUntilExpiry: (expiresAt: string) => number;
  confirmUpgrade: (id: string, plan: 'premium' | 'deluxe') => Promise<boolean>;
}) => (
  <motion.div
    key="list-view"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="space-y-4"
  >
    {filteredClients.map((client, index) => (
      <motion.div
        key={client.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-all duration-300 group cursor-pointer"
        onClick={() => setSelectedClient(client)}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center text-xl">
            {client.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-800 truncate text-lg">
                {client.clientName}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(client.status)} text-white`}>
                {client.status}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPlanColor(client.plan)} text-white`}>
                {client.plan}
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-neutral-600 flex-wrap">
              <span className="flex items-center gap-1">
                🌐 {client.subdomain}
              </span>
              <span className="flex items-center gap-1">
                🔑 {client.token.substring(0, 20)}...
              </span>
              {client.email && (
                <span className="flex items-center gap-1">
                  📧 {client.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                📅 {new Date(client.weddingDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-2">
            <div className="text-sm text-neutral-500">
              Expira en {getDaysUntilExpiry(client.expiresAt)} días
            </div>

            <div className="flex items-center gap-2">
              {client.planStatus === 'pending_upgrade' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Confirmar upgrade a ${client.pendingPlan?.toUpperCase()} para ${client.clientName}?`)) {
                      confirmUpgrade(client.id, client.pendingPlan || 'premium');
                    }
                  }}
                  className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors border border-amber-200"
                >
                  Confirmar {client.pendingPlan?.toUpperCase()}
                </button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                className="text-neutral-400 hover:text-rose-600 transition-colors duration-300"
              >
                →
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

// Componente para editar el Landing Page
const LandingPageEditor = () => {
  const [content, setContent] = useState<LandingPageContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const data = await loadLandingPageContent();
      setContent(data);
    } catch (error) {
      setNotification({ type: 'error', message: 'Error al cargar el contenido' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;

    setIsSaving(true);
    try {
      const success = await saveLandingPageContent(content);
      if (success) {
        setNotification({ type: 'success', message: 'Contenido guardado exitosamente' });
        // Recargar para obtener el ID actualizado
        await loadContent();
      } else {
        setNotification({ type: 'error', message: 'Error al guardar el contenido' });
      }
    } catch (error: any) {
      console.error('[DEBUG] Error al guardar Landing Page:', error);
      setNotification({ type: 'error', message: `Error: ${error.message || 'No se pudo guardar el contenido'}` });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = <K extends keyof LandingPageContent>(field: K, value: LandingPageContent[K]) => {
    if (!content) return;
    setContent({ ...content, [field]: value });
  };

  const updateFeature = (index: number, field: 'icon' | 'title' | 'description', value: string) => {
    if (!content) return;
    const newFeatures = [...content.featuresList];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setContent({ ...content, featuresList: newFeatures });
  };

  const addFeature = () => {
    if (!content) return;
    setContent({
      ...content,
      featuresList: [...content.featuresList, { icon: '✨', title: 'Nueva Característica', description: 'Descripción de la característica' }]
    });
  };

  const removeFeature = (index: number) => {
    if (!content) return;
    const newFeatures = content.featuresList.filter((_, i) => i !== index);
    setContent({ ...content, featuresList: newFeatures });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Cargando contenido...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Error al cargar el contenido</p>
      </div>
    );
  }

  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Header con botones de vista */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Editor de Landing Page</h2>
          <p className="text-slate-600">Administra el contenido de tu página principal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-rose-50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('edit')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${viewMode === 'edit'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                }`}
            >
              ✏️ Editar
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${viewMode === 'preview'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                }`}
            >
              👁️ Vista Previa
            </button>
          </div>
        </div>
      </div>

      {/* Notificación */}
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
        >
          {notification.message}
        </motion.div>
      )}

      {viewMode === 'edit' ? (
        <div className="space-y-6">
          {/* Sección Hero */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Sección Hero</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={content.heroBadgeText}
                  onChange={(e) => updateContent('heroBadgeText', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Línea 1</label>
                <input
                  type="text"
                  value={content.heroTitleLine1}
                  onChange={(e) => updateContent('heroTitleLine1', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Destacado</label>
                <input
                  type="text"
                  value={content.heroTitleHighlight}
                  onChange={(e) => updateContent('heroTitleHighlight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Línea 2</label>
                <input
                  type="text"
                  value={content.heroTitleLine2}
                  onChange={(e) => updateContent('heroTitleLine2', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Línea 3</label>
                <input
                  type="text"
                  value={content.heroTitleLine3}
                  onChange={(e) => updateContent('heroTitleLine3', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Texto Botón 1</label>
                <input
                  type="text"
                  value={content.heroButton1Text}
                  onChange={(e) => updateContent('heroButton1Text', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Texto Botón 2</label>
                <input
                  type="text"
                  value={content.heroButton2Text}
                  onChange={(e) => updateContent('heroButton2Text', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
              <textarea
                value={content.heroDescription}
                onChange={(e) => updateContent('heroDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sección Características */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Sección Características</h3>
              <button
                onClick={addFeature}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                + Agregar Característica
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Badge</label>
                <input
                  type="text"
                  value={content.featuresBadge}
                  onChange={(e) => updateContent('featuresBadge', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Línea 1</label>
                <input
                  type="text"
                  value={content.featuresTitleLine1}
                  onChange={(e) => updateContent('featuresTitleLine1', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Destacado</label>
                <input
                  type="text"
                  value={content.featuresTitleHighlight}
                  onChange={(e) => updateContent('featuresTitleHighlight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
              <textarea
                value={content.featuresDescription}
                onChange={(e) => updateContent('featuresDescription', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-4">
              {content.featuresList.map((feature, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-700">Característica {index + 1}</span>
                    <button
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Icono</label>
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => updateFeature(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección Planes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Sección Planes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Badge</label>
                <input
                  type="text"
                  value={content.plansBadge}
                  onChange={(e) => updateContent('plansBadge', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Badge Popular</label>
                <input
                  type="text"
                  value={content.plansPopularBadge}
                  onChange={(e) => updateContent('plansPopularBadge', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Línea 1</label>
                <input
                  type="text"
                  value={content.plansTitleLine1}
                  onChange={(e) => updateContent('plansTitleLine1', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Destacado</label>
                <input
                  type="text"
                  value={content.plansTitleHighlight}
                  onChange={(e) => updateContent('plansTitleHighlight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
              <textarea
                value={content.plansDescription}
                onChange={(e) => updateContent('plansDescription', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>

            {/* Edición de Planes */}
            <div className="mt-6 space-y-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Configuración de Planes</h4>

              {(['basic', 'premium', 'deluxe'] as const).map((planKey) => {
                const plan = content.plansData[planKey];
                const planLabels = {
                  basic: 'Plan Básico',
                  premium: 'Plan Premium',
                  deluxe: 'Plan Deluxe'
                };

                return (
                  <div key={planKey} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h5 className="text-md font-bold text-slate-800 mb-4">{planLabels[planKey]}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const newPlansData = { ...content.plansData };
                            newPlansData[planKey] = { ...plan, name: e.target.value };
                            updateContent('plansData', newPlansData);
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Precio (S/)</label>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => {
                            const newPlansData = { ...content.plansData };
                            newPlansData[planKey] = { ...plan, price: parseInt(e.target.value) || 0 };
                            updateContent('plansData', newPlansData);
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Duración (días)</label>
                        <input
                          type="number"
                          value={plan.duration}
                          onChange={(e) => {
                            const newPlansData = { ...content.plansData };
                            newPlansData[planKey] = { ...plan, duration: parseInt(e.target.value) || 0 };
                            updateContent('plansData', newPlansData);
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-medium text-slate-600">Max Invitados</label>
                          <label className="flex items-center gap-1 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={plan.maxGuests >= 999999}
                              onChange={(e) => {
                                const newPlansData = { ...content.plansData };
                                if (e.target.checked) {
                                  newPlansData[planKey] = { ...plan, maxGuests: 999999 };
                                } else {
                                  newPlansData[planKey] = { ...plan, maxGuests: 200 };
                                }
                                updateContent('plansData', newPlansData);
                              }}
                              className="w-3 h-3 text-rose-500 rounded border-slate-300 focus:ring-rose-500"
                            />
                            <span className="text-[10px] text-slate-500 font-medium">Ilimitado</span>
                          </label>
                        </div>
                        <input
                          type="number"
                          value={plan.maxGuests >= 999999 ? '' : plan.maxGuests}
                          disabled={plan.maxGuests >= 999999}
                          placeholder={plan.maxGuests >= 999999 ? "Ilimitado" : "0"}
                          onChange={(e) => {
                            const newPlansData = { ...content.plansData };
                            newPlansData[planKey] = { ...plan, maxGuests: parseInt(e.target.value) || 0 };
                            updateContent('plansData', newPlansData);
                          }}
                          className={`w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-50 disabled:text-slate-500`}
                        />
                      </div>
                    </div>

                    {/* Características del Plan */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-medium text-slate-600">Características</label>
                        <button
                          onClick={() => {
                            const newPlansData = { ...content.plansData };
                            newPlansData[planKey] = {
                              ...plan,
                              features: [...plan.features, 'Nueva característica']
                            };
                            updateContent('plansData', newPlansData);
                          }}
                          className="text-xs px-2 py-1 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const newPlansData = { ...content.plansData };
                                const newFeatures = [...plan.features];
                                newFeatures[featureIndex] = e.target.value;
                                newPlansData[planKey] = { ...plan, features: newFeatures };
                                updateContent('plansData', newPlansData);
                              }}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => {
                                const newPlansData = { ...content.plansData };
                                newPlansData[planKey] = {
                                  ...plan,
                                  features: plan.features.filter((_, i) => i !== featureIndex)
                                };
                                updateContent('plansData', newPlansData);
                              }}
                              className="px-3 py-2 text-red-500 hover:text-red-700 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sección Contacto */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Sección Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Badge</label>
                <input
                  type="text"
                  value={content.contactBadge}
                  onChange={(e) => updateContent('contactBadge', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Línea 1</label>
                <input
                  type="text"
                  value={content.contactTitleLine1}
                  onChange={(e) => updateContent('contactTitleLine1', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Título Destacado</label>
                <input
                  type="text"
                  value={content.contactTitleHighlight}
                  onChange={(e) => updateContent('contactTitleHighlight', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
              <textarea
                value={content.contactDescription}
                onChange={(e) => updateContent('contactDescription', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Footer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de Marca</label>
                <input
                  type="text"
                  value={content.footerBrandName}
                  onChange={(e) => updateContent('footerBrandName', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Copyright</label>
                <input
                  type="text"
                  value={content.footerCopyright}
                  onChange={(e) => updateContent('footerCopyright', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Texto de Copyright Destacado</label>
                <input
                  type="text"
                  value={content.footerCopyrightText}
                  onChange={(e) => updateContent('footerCopyrightText', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Hecho con 💕 para tu día especial"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Correo de Contacto</label>
                <input
                  type="email"
                  value={content.footerEmail}
                  onChange={(e) => updateContent('footerEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="contacto@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Teléfono de Contacto</label>
                <input
                  type="tel"
                  value={content.footerPhone}
                  onChange={(e) => updateContent('footerPhone', e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="+58 412 123 4567"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Descripción</label>
              <textarea
                value={content.footerDescription}
                onChange={(e) => updateContent('footerDescription', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="h-[800px] overflow-y-auto">
            <LandingPageContentPreview content={content} />
          </div>
        </div>
      )}

      {/* Botón de Guardado Flotante */}
      {viewMode === 'edit' && (
        <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="pointer-events-auto"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              disabled={isSaving}
              className="bg-rose-500/90 hover:bg-rose-600 text-white font-bold px-8 py-4 rounded-full shadow-[0_10px_40px_-10px_rgba(244,63,94,0.5)] backdrop-blur-md transition-all duration-300 disabled:opacity-50 flex items-center gap-3 border border-white/20"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">💾</span>
                  <span>Guardar Cambios</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

const LandingPageContentPreview = ({ content }: { content: LandingPageContent }) => {
  return (
    <div className="min-h-full bg-gradient-to-b from-rose-50 via-white to-white">
      <section className="px-6 py-10 border-b border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-sm font-medium mb-4">
            {content.heroBadgeText}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            <span>{content.heroTitleLine1} </span>
            <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">{content.heroTitleHighlight}</span>
            <span> {content.heroTitleLine2}</span>
            <div>{content.heroTitleLine3}</div>
          </h1>
          <p className="mt-4 text-slate-600 max-w-3xl mx-auto">{content.heroDescription}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold shadow">
              {content.heroButton1Text}
            </button>
            <button className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm">
              {content.heroButton2Text}
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-3">
              {content.featuresBadge}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              <span>{content.featuresTitleLine1} </span>
              <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">{content.featuresTitleHighlight}</span>
            </h2>
            <p className="mt-3 text-slate-600 max-w-3xl mx-auto">{content.featuresDescription}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.featuresList.map((f, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-semibold text-slate-900">{f.title}</div>
                <div className="text-slate-600 text-sm mt-1">{f.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-10 border-t border-slate-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-sm font-medium mb-3">
              {content.plansBadge}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              <span>{content.plansTitleLine1} </span>
              <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">{content.plansTitleHighlight}</span>
            </h2>
            <p className="mt-3 text-slate-600 max-w-3xl mx-auto">{content.plansDescription}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['basic', 'premium', 'deluxe'] as const).map((tier) => {
              const p = content.plansData[tier];
              const popular = tier === 'premium';
              return (
                <div key={tier} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    {popular && (
                      <span className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-800">{content.plansPopularBadge}</span>
                    )}
                  </div>
                  <div className="mt-2 text-slate-700 text-sm">{p.duration} días • {p.maxGuests >= 999999 ? 'Invitados ILIMITADOS' : `${p.maxGuests} invitados`}</div>
                  <div className="mt-2 text-2xl font-extrabold bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">${p.price}</div>
                  <ul className="mt-3 space-y-1 text-slate-600 text-sm">
                    {p.features.map((feat, i) => (
                      <li key={i}>• {feat}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-10 border-t border-slate-200">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium mb-3">
            {content.contactBadge}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            <span>{content.contactTitleLine1} </span>
            <span className="bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">{content.contactTitleHighlight}</span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-3xl mx-auto">{content.contactDescription}</p>
        </div>
      </section>

      <footer className="px-6 py-10 border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-xl font-bold text-slate-900">{content.footerBrandName}</div>
              <div className="text-slate-600 text-sm mt-1">{content.footerDescription}</div>
            </div>
            <div className="text-slate-700 text-sm">
              <div className="font-medium">Contacto</div>
              <div>{content.footerEmail}</div>
              <div>{content.footerPhone}</div>
            </div>
          </div>
          <div className="mt-6 text-slate-500 text-xs">{content.footerCopyrightText}</div>
        </div>
      </footer>
    </div>
  );
};

export default function MasterAdmin() {
  const navigate = useNavigate();
  const { dialogState: dialog, showConfirm } = useConfirmDialog();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Usar el nuevo hook para toda la lógica de negocio y autenticación
  const {
    authed,
    isCheckingAuth,
    clients,
    setClients,
    stats,
    calculateStats,
    notification,
    showNotification,
    loadClients,
    messages,
    loadingMessages,
    loadMessages,
    updateMessageStatus,
    approveUpgradeRequest,
    confirmUpgradePayment,
    logout,
    confirmUpgrade
  } = useMasterAdmin();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState<DashboardView>('overview');

  // Cargar mensajes automáticamente cuando se monta el componente o cuando se cambia a la vista de mensajes
  useEffect(() => {
    if (authed) {
      loadMessages();
    }
  }, [authed, loadMessages]);

  // Recargar mensajes cuando se cambia a la vista de mensajes
  useEffect(() => {
    if (dashboardView === 'messages' && authed) {
      loadMessages();
    }
  }, [dashboardView, authed, loadMessages]);

  // Nuevo hook para filtrado y búsqueda
  const {
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPlan,
    setFilterPlan,
    activeView,
    setActiveView,
    filteredClients
  } = useClientFiltering(clients);

  // Nuevo hook para operaciones CRUD y estados de modales
  const {
    selectedClient,
    setSelectedClient,
    isCreatingClient,
    setIsCreatingClient,
    showTokenModal,
    setShowTokenModal,
    createdClientData,
    editingClient,
    showEditModal,
    setShowEditModal,
    newClient,
    setNewClient,
    subdomainManual,
    setSubdomainManual,
    provisionStatus,
    createClient,
    updateClientStatus,
    deleteClient,
    openEditClient,
    setEditingClient,
    updateEditingClient,
    handleEditClientChange,
    renewClientAccess,
    changeClientPlan,
    provisionClient,
    copyToClipboard
  } = useClients(
    clients,
    setClients,
    loadClients,
    calculateStats,
    showNotification,
    showConfirm
  );

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'from-rose-500 to-amber-500';
      case 'pending': return 'from-rose-400 to-amber-400';
      case 'expired': return 'from-rose-600 to-amber-500';
      case 'suspended': return 'from-rose-300 to-amber-300';
      default: return 'from-rose-500 to-amber-500';
    }
  };

  const getPlanColor = (plan: Client['plan']) => {
    switch (plan) {
      case 'basic': return 'from-rose-500 to-amber-500';
      case 'premium': return 'from-rose-500 to-amber-500';
      case 'deluxe': return 'from-rose-500 to-amber-500';
      default: return 'from-rose-500 to-amber-500';
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };



  // Mostrar loading mientras se verifica autenticación
  // NO mostrar contenido hasta que se confirme la autenticación
  if (isCheckingAuth || !authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mb-4"></div>
          <p className="text-neutral-600 font-medium mb-4">
            {isCheckingAuth ? 'Verificando autenticación...' : 'Redirigiendo al login...'}
          </p>
          <p className="text-neutral-400 text-sm mb-6">
            Si esta pantalla no desaparece en unos segundos, puede haber un problema de conexión con la base de datos.
          </p>
          <button
            onClick={() => {
              sessionStorage.clear();
              navigate('/admin/login', { replace: true });
              window.location.reload();
            }}
            className="px-6 py-3 bg-white border border-rose-200 text-rose-600 rounded-xl text-sm font-semibold shadow-sm hover:bg-rose-50 transition-colors"
          >
            Ir al Login Manualmente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className={`fixed top-4 right-4 z-50 rounded-2xl p-4 shadow-xl backdrop-blur-sm border ${notification.type === 'success'
              ? 'bg-amber-500/10 border-amber-200 text-amber-700'
              : 'bg-rose-500/10 border-rose-200 text-rose-700'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                }`}>
                {notification.type === 'success' ? '✓' : '⚠'}
              </div>
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <nav className="bg-white/90 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-rose-500 to-amber-500 rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                💍
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">Panel Master</h1>
                <p className="text-xs sm:text-sm text-neutral-600">Administrador Principal</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-brush bg-gradient-to-r from-rose-600 to-amber-600 bg-clip-text text-transparent">Master</h1>
              </div>
            </div>

            {/* Navigation Tabs - Desktop */}
            <div className="hidden lg:flex bg-rose-50 rounded-xl p-1">
              {([
                { id: 'overview', label: 'Resumen', icon: '📊' },
                { id: 'clients', label: 'Clientes', icon: '👥' },
                { id: 'messages', label: 'Mensajes', icon: '✉️' },
                { id: 'landing', label: 'Landing Page', icon: '🏠' },
                { id: 'analytics', label: 'Analíticas', icon: '📈' },
                { id: 'settings', label: 'Configuración', icon: '⚙️' }
              ] as Array<{ id: DashboardView; label: string; icon: string }>).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setDashboardView(tab.id); setMobileMenuOpen(false); }}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 text-xs font-medium ${dashboardView === tab.id
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                    }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              {dashboardView === 'clients' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreatingClient(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 text-xs sm:text-sm whitespace-nowrap"
                >
                  <span className="text-lg">+</span>
                  <span className="hidden sm:inline">Nuevo Cliente</span>
                  <span className="sm:hidden">Nuevo</span>
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 flex-shrink-0"
                title="Cerrar sesión"
              >
                🚺
              </motion.button>

              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition flex-shrink-0"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-3 pt-3 border-t border-neutral-200"
              >
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: 'overview', label: 'Resumen', icon: '📊' },
                    { id: 'clients', label: 'Clientes', icon: '👥' },
                    { id: 'messages', label: 'Mensajes', icon: '✉️' },
                    { id: 'landing', label: 'Landing Page', icon: '🏠' },
                    { id: 'analytics', label: 'Analíticas', icon: '📈' },
                    { id: 'settings', label: 'Configuración', icon: '⚙️' }
                  ] as Array<{ id: DashboardView; label: string; icon: string }>).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => { setDashboardView(tab.id); setMobileMenuOpen(false); }}
                      className={`px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-1 text-xs font-medium whitespace-nowrap ${dashboardView === tab.id
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-sm'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                    >
                      <span>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="w-full px-4 sm:px-6 py-6 sm:py-8">
        {/* Dashboard Content Based on Active View */}
        <AnimatePresence mode="wait">
          {dashboardView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {/* Pending Upgrades Alert */}
              {stats.pendingUpgradesCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-xl">
                      ⚠️
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900">Solicitudes de Upgrade Pendientes</h3>
                      <p className="text-amber-700 text-sm">Hay {stats.pendingUpgradesCount} cliente(s) esperando confirmación de pago.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setDashboardView('clients');
                      setFilterStatus('all');
                    }}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    Ver Clientes
                  </button>
                </div>
              )}

              {/* Enhanced Statistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[
                  {
                    label: 'Clientes Totales',
                    value: stats.totalClients,
                    change: `${stats.growthRate >= 0 ? '+' : ''}${stats.growthRate}%`,
                    icon: '👥',
                    gradient: 'from-blue-500 to-cyan-500',
                    description: 'Total registrados',
                    trend: stats.growthRate
                  },
                  {
                    label: 'Activos',
                    value: stats.activeClients,
                    change: `${((stats.activeClients / stats.totalClients) * 100 || 0).toFixed(1)}%`,
                    icon: '✅',
                    gradient: 'from-green-500 to-emerald-500',
                    description: 'Sitios funcionando',
                    trend: 8.5
                  },
                  {
                    label: 'Ingresos del Mes',
                    value: `$${stats.revenueThisMonth.toLocaleString()}`,
                    change: '+23%',
                    icon: '💰',
                    gradient: 'from-amber-500 to-yellow-500',
                    description: 'Nuevos pagos',
                    trend: 23
                  },
                  {
                    label: 'Plan Popular',
                    value: stats.popularPlan.toUpperCase(),
                    change: `${stats.newClientsThisMonth} nuevos`,
                    icon: '⭐',
                    gradient: 'from-purple-500 to-fuchsia-500',
                    description: 'Más contratado',
                    trend: 15
                  },
                  {
                    label: 'Mensajes Nuevos',
                    value: messages.filter(m => m.status === 'new').length,
                    change: `${messages.length} totales`,
                    icon: '✉️',
                    gradient: 'from-rose-500 to-pink-500',
                    description: 'Pendientes de leer',
                    trend: messages.filter(m => m.status === 'new').length > 0 ? 1 : 0
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">{stat.label}</p>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 truncate">{stat.value}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className={`text-xs font-medium ${stat.trend >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {stat.change}
                          </span>
                          <span className="text-xs text-slate-500 hidden sm:inline">{stat.description}</span>
                        </div>
                      </div>
                      <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r ${stat.gradient} rounded-lg sm:rounded-2xl flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg flex-shrink-0`}>
                        {stat.icon}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                  {[
                    { label: 'Crear Cliente', icon: '👥', action: () => setIsCreatingClient(true), color: 'from-blue-500 to-cyan-500' },
                    { label: 'Ver Clientes', icon: '📋', action: () => setDashboardView('clients'), color: 'from-green-500 to-emerald-500' },
                    { label: 'Analíticas', icon: '📈', action: () => setDashboardView('analytics'), color: 'from-purple-500 to-fuchsia-500' },
                    { label: 'Configuración', icon: '⚙️', action: () => setDashboardView('settings'), color: 'from-amber-500 to-yellow-500' }
                  ].map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={action.action}
                      className={`p-2 sm:p-4 bg-gradient-to-r ${action.color} rounded-lg sm:rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm`}
                    >
                      <span className="text-base sm:text-xl">{action.icon}</span>
                      <span className="hidden sm:inline">{action.label}</span>
                      <span className="sm:hidden">{action.label.split(' ')[0]}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-4">Actividad Reciente</h3>
                <div className="space-y-2 sm:space-y-4">
                  {clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors duration-200">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg flex-shrink-0">
                        {client.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm sm:text-base truncate">{client.clientName}</p>
                        <p className="text-xs sm:text-sm text-slate-600 truncate">Plan {client.plan} - {getDaysUntilExpiry(client.expiresAt)} días</p>
                      </div>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(client.status)} text-white whitespace-nowrap`}>
                        {client.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {dashboardView === 'clients' && (
            <motion.div
              key="clients"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Clients Header with Filters */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-serif font-bold text-slate-800 mb-1">
                        Gestión de Clientes
                      </h2>
                      <p className="text-slate-600">
                        {filteredClients.length} cliente{filteredClients.length !== 1 ? 's' : ''} encontrado{filteredClients.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                      {/* View Toggle */}
                      <div className="flex bg-slate-100 rounded-xl p-1">
                        <button
                          onClick={() => setActiveView('grid')}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeView === 'grid'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                          🏠 Grid
                        </button>
                        <button
                          onClick={() => setActiveView('list')}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 ${activeView === 'list'
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                            }`}
                        >
                          📋 Lista
                        </button>
                      </div>

                      {/* Search */}
                      <div className="relative flex-1 lg:flex-initial">
                        <input
                          type="text"
                          placeholder="Buscar cliente..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full lg:w-64 px-4 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                        />
                        <span className="absolute right-3 top-2.5 text-slate-400">🔍</span>
                      </div>

                      {/* Filters */}
                      <div className="flex gap-2">
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-sm"
                        >
                          <option value="all">Todos</option>
                          <option value="active">Activo</option>
                          <option value="pending">Pendiente</option>
                          <option value="expired">Expirado</option>
                        </select>
                        <select
                          value={filterPlan}
                          onChange={(e) => setFilterPlan(e.target.value)}
                          className="px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-sm"
                        >
                          <option value="all">Todos</option>
                          <option value="basic">Básico</option>
                          <option value="premium">Premium</option>
                          <option value="deluxe">Deluxe</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clients Content */}
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {isCreatingClient ? (
                      <ClientCreateForm
                        newClient={newClient}
                        setNewClient={setNewClient}
                        createClient={createClient}
                        setIsCreatingClient={setIsCreatingClient}
                        subdomainManual={subdomainManual}
                        setSubdomainManual={setSubdomainManual}
                      />
                    ) : activeView === 'grid' ? (
                      <ClientGridView
                        filteredClients={filteredClients}
                        setSelectedClient={setSelectedClient}
                        getStatusColor={getStatusColor}
                        getPlanColor={getPlanColor}
                        getDaysUntilExpiry={getDaysUntilExpiry}
                        confirmUpgrade={confirmUpgrade}
                      />
                    ) : (
                      <ClientListView
                        filteredClients={filteredClients}
                        setSelectedClient={setSelectedClient}
                        getStatusColor={getStatusColor}
                        getPlanColor={getPlanColor}
                        getDaysUntilExpiry={getDaysUntilExpiry}
                        confirmUpgrade={confirmUpgrade}
                      />
                    )}
                  </AnimatePresence>

                  {filteredClients.length === 0 && !isCreatingClient && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4">
                        🔍
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        No se encontraron clientes
                      </h3>
                      <p className="text-slate-600 mb-6">
                        {searchTerm || filterStatus !== 'all' || filterPlan !== 'all'
                          ? 'Prueba ajustando los filtros de búsqueda'
                          : 'Comienza creando tu primer cliente'
                        }
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsCreatingClient(true)}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        + Crear Primer Cliente
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {dashboardView === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Analíticas</h2>
              <p className="text-slate-600">Vista de analíticas en desarrollo...</p>
            </motion.div>
          )}

          {dashboardView === 'landing' && <LandingPageEditor />}

          {dashboardView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Configuración</h2>
              <p className="text-slate-600">Vista de configuración en desarrollo...</p>
            </motion.div>
          )}

          {dashboardView === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-slate-800 mb-1">
                      Mensajes & Solicitudes
                    </h2>
                    <p className="text-slate-600">
                      Gestiona contactos y solicitudes de upgrade de clientes.
                    </p>
                  </div>
                  <button
                    onClick={loadMessages}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Recargar mensajes"
                  >
                    🔄
                  </button>
                </div>

                <div className="p-6">
                  {loadingMessages ? (
                    <div className="text-center py-12">Cargando mensajes...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No hay mensajes aún.</div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          layout
                          className={`p-5 rounded-xl border transition-all ${msg.status === 'new'
                            ? 'bg-rose-50/50 border-rose-200 shadow-md'
                            : 'bg-white border-slate-200'
                            }`}
                        >
                          {/* Header del mensaje */}
                          <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${msg.type === 'upgrade' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {msg.type === 'upgrade' ? '📈 Solicitud Upgrade' : '✉️ Contacto Directo'}
                              </span>
                              {msg.status === 'new' && (
                                <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
                                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                  Nuevo
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              {new Date(msg.created_at).toLocaleString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* Contenido del mensaje */}
                          <div className="space-y-3">
                            {/* Información del remitente */}
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {(msg.client_name || 'A')[0].toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-base">{msg.client_name || 'Anónimo'}</p>
                                <p className="text-sm text-slate-600">{msg.email}</p>
                              </div>
                            </div>

                            {/* Asunto */}
                            <div className="bg-slate-50 rounded-lg p-3">
                              <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Asunto</p>
                              <p className="font-semibold text-slate-800">{msg.subject}</p>
                            </div>

                            {/* Mensaje completo */}
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                              <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Mensaje</p>
                              <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                                {msg.message}
                              </div>
                            </div>

                            {/* Plan solicitado (si aplica) */}
                            {msg.requested_plan && (
                              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
                                <p className="text-xs text-indigo-600 uppercase font-semibold mb-1">Plan Solicitado</p>
                                <p className="text-lg font-bold text-indigo-700">
                                  {msg.requested_plan.toUpperCase()}
                                </p>
                              </div>
                            )}

                            {/* Acciones */}
                            <div className="flex gap-2 pt-2">
                              {msg.status === 'new' && (
                                <button
                                  onClick={() => updateMessageStatus(msg.id, 'read')}
                                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium text-sm"
                                >
                                  ✓ Marcar como leído
                                </button>
                              )}
                              {msg.type === 'upgrade' && msg.status !== 'approved' && msg.status !== 'rejected' && (
                                <>
                                  <button
                                    onClick={() => approveUpgradeRequest(msg)}
                                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-bold text-sm shadow-sm"
                                  >
                                    ✓ Aprobar Upgrade
                                  </button>
                                  <button
                                    onClick={() => updateMessageStatus(msg.id, 'rejected')}
                                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                                  >
                                    ✕ Rechazar
                                  </button>
                                </>
                              )}
                              {msg.status === 'approved' && msg.client_id && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={async () => {
                                      if (confirm('¿Confirmar que recibiste el comprobante de pago? Esto hará el upgrade permanente.')) {
                                        await confirmUpgradePayment(msg.client_id!);
                                        loadMessages(); // Recargar mensajes
                                      }
                                    }}
                                    className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-bold text-sm shadow-sm"
                                  >
                                    💳 Confirmar Pago
                                  </button>
                                  <div className="flex-1 text-center font-bold text-green-700 bg-green-100 py-2 rounded-lg border-2 border-green-300 flex items-center justify-center">
                                    ✓ Aprobado
                                  </div>
                                </div>
                              )}
                              {msg.status === 'rejected' && (
                                <div className="flex-1 text-center font-bold text-red-700 bg-red-100 py-2 rounded-lg border-2 border-red-300">
                                  ✕ Rechazado
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Token y Subdominio */}
      <AnimatePresence>
        {showTokenModal && createdClientData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowTokenModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-800">
                      Cliente Creado Exitosamente
                    </h3>
                    <p className="text-slate-600 mt-1">{createdClientData.clientName}</p>
                  </div>
                  <button
                    onClick={() => setShowTokenModal(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-green-800 mb-3">
                    ✅ El cliente puede iniciar sesión con estos datos:
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Token de Acceso
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={createdClientData.token}
                          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(createdClientData.token)}
                          className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Copiar
                        </motion.button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Subdominio
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={getClientUrl(createdClientData.subdomain)}
                          className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-mono text-sm"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(getClientUrl(createdClientData.subdomain))}
                          className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          Copiar
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    📋 Instrucciones de acceso para el cliente:
                  </p>
                  <div className="space-y-3">
                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900 mb-2">🔗 URL de acceso:</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-blue-50 px-2 py-1 rounded text-xs font-mono flex-1">
                          {getClientUrl(createdClientData.subdomain)}
                        </code>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(getClientUrl(createdClientData.subdomain))}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                        >
                          Copiar
                        </motion.button>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900 mb-2">👤 Usuario:</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-blue-50 px-2 py-1 rounded text-xs font-mono flex-1">
                          {createdClientData.subdomain}
                        </code>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(createdClientData.subdomain)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                        >
                          Copiar
                        </motion.button>
                      </div>
                    </div>

                    <div className="bg-white border border-blue-100 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-900 mb-2">🔑 Contraseña (Token):</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-blue-50 px-2 py-1 rounded text-xs font-mono flex-1 break-all">
                          {createdClientData.token}
                        </code>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(createdClientData.token)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                        >
                          Copiar
                        </motion.button>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm font-semibold text-amber-900 mb-2">⚠️ Importante:</p>
                      <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                        <li>Comparte estas credenciales únicamente con el cliente</li>
                        <li>El token es sensible - guárdalo de forma segura</li>
                        <li>El acceso estará disponible hasta la fecha de la boda + duración del plan</li>
                        <li>El cliente puede cambiar contraseña desde su panel de administración</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTokenModal(false)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Details Modal */}
      <AnimatePresence>
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedClient(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-serif font-bold text-slate-800">
                    Detalles del Cliente
                  </h3>
                  <button
                    onClick={() => setSelectedClient(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Client Header */}
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4">
                    {selectedClient.avatar}
                  </div>
                  <h4 className="font-bold text-slate-800 text-xl mb-2">{selectedClient.clientName}</h4>
                  <p className="text-slate-600">{selectedClient.email || 'Sin email'}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Plan</p>
                    <p className="font-semibold text-slate-800 capitalize">{selectedClient.plan}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Estado</p>
                    <p className="font-semibold text-slate-800 capitalize">{selectedClient.status}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Invitados</p>
                    <p className="font-semibold text-slate-800">{selectedClient.guestCount}</p>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-4 text-center">
                    <p className="text-sm text-slate-600 mb-1">Días Restantes</p>
                    <p className="font-semibold text-slate-800">{getDaysUntilExpiry(selectedClient.expiresAt)}</p>
                  </div>
                </div>

                {/* Token y Subdominio */}
                <div className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border border-indigo-200 rounded-xl p-4 space-y-3">
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Token de Acceso</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-slate-800 text-sm flex-1 break-all">{selectedClient.token}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(selectedClient.token)}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Copiar
                      </motion.button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Subdominio</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-slate-800 text-sm flex-1">{getClientUrl(selectedClient.subdomain)}</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(getClientUrl(selectedClient.subdomain))}
                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Copiar
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Estado de Provisión */}
                <div className="bg-slate-50/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedClient.provisioned ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {selectedClient.provisioned ? 'Provisionado' : 'No provisionado'}
                    </span>
                    {provisionStatus[selectedClient.id]?.status === 'in_progress' && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">⏳ Provisionando...</span>
                    )}
                    {provisionStatus[selectedClient.id]?.status === 'success' && !selectedClient.provisioned && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Actualiza para ver estado</span>
                    )}
                  </div>
                  {selectedClient.provisionError && (
                    <p className="text-sm text-red-600 mt-2">Error: {selectedClient.provisionError}</p>
                  )}
                </div>

                {/* Wedding Details */}
                <div className="bg-slate-50/50 rounded-xl p-4">
                  <h5 className="font-semibold text-slate-800 mb-3">Detalles de la Boda</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Fecha de la Boda</p>
                      <p className="font-medium text-slate-800">{new Date(selectedClient.weddingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Fecha de Creación</p>
                      <p className="font-medium text-slate-800">{new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Fecha de Expiración</p>
                      <p className="font-medium text-slate-800">{new Date(selectedClient.expiresAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Último Acceso</p>
                      <p className="font-medium text-slate-800">
                        {selectedClient.lastLogin
                          ? new Date(selectedClient.lastLogin).toLocaleDateString()
                          : 'Nunca'
                        }
                      </p>
                    </div>
                    {selectedClient.brideName && (
                      <div>
                        <p className="text-slate-600">Novia</p>
                        <p className="font-medium text-slate-800">{selectedClient.brideName}</p>
                      </div>
                    )}
                    {selectedClient.groomName && (
                      <div>
                        <p className="text-slate-600">Novio</p>
                        <p className="font-medium text-slate-800">{selectedClient.groomName}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { openEditClient(selectedClient); }}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors duration-300 font-medium"
                  >
                    ✏️ Editar Cliente
                  </motion.button>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateClientStatus(selectedClient.id, 'active')}
                      className="bg-blue-500 text-white py-3 rounded-xl hover:bg-blue-600 transition-colors duration-300 font-medium"
                    >
                      ✅ Activar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateClientStatus(selectedClient.id, 'suspended')}
                      className="bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 transition-colors duration-300 font-medium"
                    >
                      ⚠ Suspender
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => provisionClient(selectedClient)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                  >
                    🔐 Provisionar acceso
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => renewClientAccess(selectedClient.id, 30)}
                    className="w-full border border-amber-300 text-amber-700 py-3 rounded-xl hover:bg-amber-50 transition-all duration-300 font-medium"
                  >
                    ⏳ Renovar acceso +30 días
                  </motion.button>

                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeClientPlan(selectedClient.id, 'basic')}
                      className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                    >
                      Plan Básico
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeClientPlan(selectedClient.id, 'premium')}
                      className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                    >
                      Plan Premium
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => changeClientPlan(selectedClient.id, 'deluxe')}
                      className="w-full border border-slate-300 text-slate-700 py-3 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium"
                    >
                      Plan Deluxe
                    </motion.button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => deleteClient(selectedClient.id)}
                    className="w-full border border-red-300 text-red-600 py-3 rounded-xl hover:bg-red-50 transition-all duration-300 font-medium"
                  >
                    🗑 Eliminar Cliente
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showEditModal && editingClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 sticky top-0 bg-white">
                <h4 className="text-xl font-bold text-slate-800">Editar Cliente</h4>
                <p className="text-slate-600 text-sm">Actualiza los datos del cliente seleccionado</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={editingClient.clientName}
                      onChange={(e) => handleEditClientChange('clientName', e.target.value)}
                      placeholder="Ana Rodríguez y Carlos López"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-slate-900 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingClient.email}
                      onChange={(e) => handleEditClientChange('email', e.target.value)}
                      placeholder="ejemplo@bodas.com"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-slate-900 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
                    <select
                      value={editingClient.plan}
                      onChange={(e) => handleEditClientChange('plan', e.target.value as 'basic' | 'premium' | 'deluxe')}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900"
                    >
                      <option value="basic">Básico</option>
                      <option value="premium">Premium</option>
                      <option value="deluxe">Deluxe</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Boda</label>
                    <input
                      type="date"
                      value={editingClient.weddingDate}
                      onChange={(e) => handleEditClientChange('weddingDate', e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-slate-900 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Invitados</label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={editingClient.guestCount}
                      onChange={(e) => handleEditClientChange('guestCount', parseInt(e.target.value) || editingClient.guestCount)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-slate-900 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Novia</label>
                    <input
                      type="text"
                      value={editingClient.brideName || ''}
                      onChange={(e) => handleEditClientChange('brideName', e.target.value)}
                      placeholder="Ana Rodríguez"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-slate-900 cursor-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Novio</label>
                    <input
                      type="text"
                      value={editingClient.groomName || ''}
                      onChange={(e) => handleEditClientChange('groomName', e.target.value)}
                      placeholder="Carlos López"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-slate-900 caret-slate-900 cursor-text"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50 sticky bottom-0">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowEditModal(false); setEditingClient(null); }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-white transition-all duration-300"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={updateEditingClient}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Guardar Cambios
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog
        isOpen={dialog.isOpen}
        title={dialog.options.title}
        message={dialog.options.message}
        confirmText={dialog.options.confirmText}
        cancelText={dialog.options.cancelText}
        type={dialog.options.type}
        onConfirm={dialog.onConfirm}
        onCancel={dialog.onCancel}
        isLoading={dialog.isLoading}
      />
    </div>
  );
}
