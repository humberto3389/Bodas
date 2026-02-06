import { useNavigate } from 'react-router-dom'
import ClientLogin from '../components/ClientLogin'
import { useClientAuth } from '../contexts/ClientAuthContext'

export default function ClientLoginPage() {
  const navigate = useNavigate()
  const { login } = useClientAuth()

  return (
    <ClientLogin
      onLogin={(client) => {
        login(client);

        // Verificar persistencia y dar un pequeño respiro al navegador
        setTimeout(() => {
          const stored = sessionStorage.getItem('clientAuth');

          if (stored) {
            navigate('/client-admin', { replace: true });
          } else {
            // Fallback de emergencia
            sessionStorage.setItem('clientAuth', JSON.stringify(client));
            navigate('/client-admin', { replace: true });
          }
        }, 100);
      }}
    />
  )
}


