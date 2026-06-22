import React from 'react';
import { CustomAlert } from './CustomAlert';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
}

export function DeleteConfirmationModal({ 
  visible, 
  onConfirm, 
  onCancel,
  title = "Delete Transaction",
  message = "Are you sure you want to delete this transaction? This action cannot be undone."
}: DeleteConfirmationModalProps) {
  return (
    <CustomAlert
      visible={visible}
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText="Delete"
      cancelText="Cancel"
      confirmStyle="danger"
    />
  );
}
