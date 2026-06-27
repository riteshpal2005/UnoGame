import React from "react";
import { CustomAlert } from "./CustomAlert";

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
  title = "Leave Game",
  message = "Are you sure you want to leave the game? Your active match progress will be lost.",
}: DeleteConfirmationModalProps) {
  return (
    <CustomAlert
      visible={visible}
      title={title}
      message={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
      confirmText="Leave"
      cancelText="Cancel"
      confirmStyle="danger"
    />
  );
}
