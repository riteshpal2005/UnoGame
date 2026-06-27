import React, { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: "default" | "danger";
}

export function CustomAlert({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "OK",
  cancelText = "Cancel",
  confirmStyle = "default",
}: CustomAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent={true}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onCancel}
      >
        <Pressable
          style={{ width: "85%" }}
          onPress={(e) => e.stopPropagation()}
        >
          <View
            style={{
              backgroundColor: "#0F172A",
              borderRadius: 24,
              padding: 24,
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              borderWidth: 1,
              borderColor: "#334155",
            }}
          >
            <Text className="text-text-primary text-2xl font-bold mb-3">
              {title}
            </Text>
            <Text className="text-text-secondary text-base mb-8">{message}</Text>

            <View className="flex-row justify-end">
              {onCancel && (
                <Pressable
                  onPress={onCancel}
                  className="px-6 py-3 rounded-xl border border-border bg-surface mr-2"
                >
                  <Text className="text-text-primary font-bold text-base">
                    {cancelText}
                  </Text>
                </Pressable>
              )}
              <Pressable
                onPress={onConfirm}
                className={`px-6 py-3 rounded-xl ${
                  confirmStyle === "danger"
                    ? "bg-primary"
                    : "bg-secondary"
                }`}
              >
                <Text className="text-text-primary font-bold text-base">
                  {confirmText}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function useAlert() {
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmStyle?: "default" | "danger";
  }>({
    visible: false,
    title: "",
    message: "",
  });

  const showAlert = (
    title: string,
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    confirmStyle?: "default" | "danger"
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      confirmStyle,
    });
  };

  const hideAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  return { showAlert, hideAlert, alertConfig };
}
