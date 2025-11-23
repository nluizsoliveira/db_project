'use client';

import { useState, useCallback } from 'react';

interface AlertDialogState {
  open: boolean;
  title: string;
  message: string;
  type: 'alert' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function useAlertDialog() {
  const [state, setState] = useState<AlertDialogState>({
    open: false,
    title: '',
    message: '',
    type: 'alert',
  });

  const showAlert = useCallback((message: string, title: string = 'Aviso') => {
    setState({
      open: true,
      title,
      message,
      type: 'alert',
    });
  }, []);

  const showConfirm = useCallback(
    (
      message: string,
      title: string = 'Confirmar',
      onConfirm?: () => void,
      onCancel?: () => void
    ) => {
      setState({
        open: true,
        title,
        message,
        type: 'confirm',
        onConfirm,
        onCancel,
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    const onConfirmCallback = state.onConfirm;
    setState((prev) => ({ ...prev, open: false }));
    // Execute callback after dialog is closed to allow chaining confirms
    if (onConfirmCallback) {
      setTimeout(() => {
        onConfirmCallback();
      }, 100);
    }
  }, [state.onConfirm]);

  const handleCancel = useCallback(() => {
    if (state.onCancel) {
      state.onCancel();
    }
    setState((prev) => ({ ...prev, open: false }));
  }, [state.onCancel]);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    ...state,
    showAlert,
    showConfirm,
    handleConfirm,
    handleCancel,
    handleClose,
  };
}
