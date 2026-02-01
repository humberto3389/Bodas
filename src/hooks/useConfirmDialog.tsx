import React, { useState, useCallback, ReactNode } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'

export interface ConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    options: ConfirmDialogOptions
    onConfirm: () => void | Promise<void>
    onCancel: () => void
    isLoading: boolean
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    onConfirm: () => { },
    onCancel: () => { },
    isLoading: false
  })

  const showConfirm = useCallback((
    optionsOrMessage: ConfirmDialogOptions | string
  ): Promise<boolean> => {
    const options = typeof optionsOrMessage === 'string'
      ? { title: 'Confirmar', message: optionsOrMessage }
      : optionsOrMessage

    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        options,
        isLoading: false,
        onConfirm: async () => {
          setDialog(prev => ({ ...prev, isLoading: true }))
          try {
            resolve(true)
            // Esperar un momento para que la animación se vea
            await new Promise(resolve => setTimeout(resolve, 300))
            setDialog(prev => ({ ...prev, isOpen: false, isLoading: false }))
          } catch (error) {
            setDialog(prev => ({ ...prev, isLoading: false }))
            resolve(false)
          }
        },
        onCancel: () => {
          resolve(false)
          setDialog(prev => ({ ...prev, isOpen: false }))
        }
      })
    })
  }, [])

  const closeDialog = useCallback(() => {
    setDialog(prev => ({ ...prev, isOpen: false }))
  }, [])

  const dialogComponent: ReactNode = (
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
  )

  return {
    dialog: dialogComponent,
    dialogState: {
      isOpen: dialog.isOpen,
      options: dialog.options,
      onConfirm: dialog.onConfirm,
      onCancel: dialog.onCancel,
      isLoading: dialog.isLoading
    },
    showConfirm,
    closeDialog
  }
}
