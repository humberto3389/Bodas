import { useNavigate } from 'react-router-dom'
import ClientLogin from '../components/ClientLogin'
import { useClientAuth } from '../contexts/ClientAuthContext'

export default function ClientLoginPage() {
  const navigate = useNavigate()
  const { login } = useClientAuth()

  return (
    <ClientLogin
      onLogin={(client) => {
        console.log('[ClientLoginPage] onLogin recibida. Ejecutando login(client)...');
        login(client);

        // Verificar persistencia y dar un pequeño respiro al navegador
        setTimeout(() => {
          const stored = sessionStorage.getItem('clientAuth');
          console.log('[ClientLoginPage] Verificando storage antes de redirigir:', stored ? 'OK' : 'NULL');

          if (stored) {
            console.log('[ClientLoginPage] Redirigiendo a /client-admin...');
            navigate('/client-admin', { replace: true });
          } else {
            console.error('[ClientLoginPage] Error CRÍTICO: sessionStorage no se guardó.');
            // Fallback de emergencia
            sessionStorage.setItem('clientAuth', JSON.stringify(client));
            navigate('/client-admin', { replace: true });
          }
        }, 100);
      }}
    />
  )
}


