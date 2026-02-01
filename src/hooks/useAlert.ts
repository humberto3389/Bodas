import { useCallback } from 'react'
import { useToast } from './useToast'

export function useAlert() {
  const { success, error, info, warning } = useToast()

  const showAlert = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    switch (type) {
      case 'success':
        success(message)
        break
      case 'error':
        error(message)
        break
      case 'warning':
        warning(message)
        break
      case 'info':
      default:
        info(message)
        break
    }
  }, [success, error, info, warning])

  return { showAlert, success, error, info, warning }
}

