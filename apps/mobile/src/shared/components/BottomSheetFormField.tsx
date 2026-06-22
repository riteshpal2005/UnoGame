import { View, Text, TextInputProps } from "react-native";
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

interface BottomSheetFormFieldProps extends TextInputProps {
  label: string;
  className?: string; 
  inputClassName?: string; 
}

export function BottomSheetFormField({
  label,
  className = "bg-surface rounded-2xl p-4 mb-4 border border-bordercolor",
  inputClassName = "text-primary text-lg font-semibold",
  ...textInputProps
}: BottomSheetFormFieldProps) {
  return (
    <View className={className}>
      <Text className="text-secondary text-sm mb-2">{label}</Text>
      <BottomSheetTextInput
        placeholderTextColor="#52525b"
        className={inputClassName}
        {...textInputProps}
        style={[{ paddingVertical: 0, includeFontPadding: false }, textInputProps.style]}
      />
    </View>
  );
}
