/**
 * FitAI mobile v2 design system.
 * Mirror of web V2Layout / V2AuthLayout primitives in React Native.
 * Style: Apple Music + Activity Rings (Jonny Ive era B+C).
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, RadialGradient, Defs, Stop, Rect } from 'react-native-svg';

// ── Theme tokens ────────────────────────────────────────────────
export const v2 = {
  bg: '#000000',
  text: '#FFFFFF',
  muted: 'rgba(255,255,255,0.55)',
  faint: 'rgba(255,255,255,0.40)',
  ghost: 'rgba(255,255,255,0.20)',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.20)',
  surface: 'rgba(255,255,255,0.03)',
  // Activity ring colors
  red: '#FF375F',
  green: '#A8FF00',
  blue: '#00E5FF',
  orange: '#FF9500',
  yellow: '#FF9F0A',
  purple: '#BF5AF2',
};

// ── V2Screen — base wrapper with safe area + scroll ─────────────
export function V2Screen({
  children,
  scroll = true,
  padding = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padding?: boolean;
}) {
  const Container: any = scroll ? ScrollView : View;
  return (
    <View style={s.root}>
      <V2AmbientBg />
      <SafeAreaView style={s.safe} edges={['top']}>
        <Container
          style={s.container}
          contentContainerStyle={padding ? s.padded : undefined}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </Container>
      </SafeAreaView>
    </View>
  );
}

function V2AmbientBg() {
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="ambient" cx="50%" cy="20%" r="60%">
          <Stop offset="0%" stopColor="#FF375F" stopOpacity="0.08" />
          <Stop offset="60%" stopColor="#000000" stopOpacity="1" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#ambient)" />
    </Svg>
  );
}

// ── Typography ──────────────────────────────────────────────────
export function V2SectionLabel({ children }: { children: React.ReactNode }) {
  return <Text style={s.sectionLabel}>{String(children).toUpperCase()}</Text>;
}

export function V2Display({
  children,
  size = 'lg',
  style,
}: {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: StyleProp<TextStyle>;
}) {
  const fontSize = size === 'xl' ? 56 : size === 'lg' ? 44 : size === 'md' ? 32 : 24;
  return <Text style={[s.display, { fontSize }, style]}>{children}</Text>;
}

export function V2Body({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.body, style]}>{children}</Text>;
}

export function V2Stat({
  value,
  label,
  big,
}: {
  value: string | number;
  label: string;
  big?: boolean;
}) {
  return (
    <View>
      <Text style={[s.statValue, big && { fontSize: 64 }]}>
        {typeof value === 'number' ? value.toLocaleString('cs-CZ') : value}
      </Text>
      <Text style={s.sectionLabel}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ── Button ──────────────────────────────────────────────────────
export function V2Button({
  children,
  onPress,
  variant = 'primary',
  full,
  disabled,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  full?: boolean;
  disabled?: boolean;
}) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        s.button,
        full && s.buttonFull,
        isPrimary ? s.buttonPrimary : s.buttonSecondary,
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.3 },
      ]}
    >
      <Text style={isPrimary ? s.buttonTextPrimary : s.buttonTextSecondary}>{children}</Text>
    </Pressable>
  );
}

// ── Pill chip (filter / option) ─────────────────────────────────
export function V2Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        selected && s.chipSelected,
        pressed && { opacity: 0.6 },
      ]}
    >
      <Text style={selected ? s.chipTextSelected : s.chipText}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

// ── Input ───────────────────────────────────────────────────────
export function V2Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={s.sectionLabel}>{label.toUpperCase()}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={v2.ghost}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={s.input}
      />
    </View>
  );
}

// ── Activity Ring (single) ──────────────────────────────────────
export function V2Ring({
  value,
  total,
  size = 200,
  color = v2.red,
  label,
  unit,
}: {
  value: number;
  total: number;
  size?: number;
  color?: string;
  label?: string;
  unit?: string;
}) {
  const stroke = size * 0.09;
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const c = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  const offset = c * (1 - pct);

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={color}
            strokeOpacity={0.13}
            strokeWidth={stroke}
            fill="none"
          />
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </Svg>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[s.statValue, { fontSize: size * 0.18 }]}>
            {value.toLocaleString('cs-CZ')}
          </Text>
          {unit && (
            <Text style={s.sectionLabel}>
              of {total.toLocaleString('cs-CZ')} {unit}
            </Text>
          )}
        </View>
      </View>
      {label && <Text style={[s.sectionLabel, { marginTop: 12 }]}>{label.toUpperCase()}</Text>}
    </View>
  );
}

// ── Triple Activity Ring (Apple Watch hero) ─────────────────────
export function V2TripleRing({
  move,
  exercise,
  stand,
  size = 280,
}: {
  move: number;
  exercise: number;
  stand: number;
  size?: number;
}) {
  const stroke = size * 0.075;
  const gap = stroke * 0.55;
  const cx = size / 2;
  const cy = size / 2;

  const ring = (i: number, value: number, color: string) => {
    const radius = size / 2 - stroke / 2 - i * (stroke + gap);
    const c = 2 * Math.PI * radius;
    const off = c * (1 - Math.max(0, Math.min(1, value)));
    return (
      <React.Fragment key={i}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeOpacity={0.13}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </React.Fragment>
    );
  };

  return (
    <Svg width={size} height={size}>
      {ring(0, move, v2.red)}
      {ring(1, exercise, v2.green)}
      {ring(2, stand, v2.blue)}
    </Svg>
  );
}

// ── Loading state ───────────────────────────────────────────────
export function V2Loading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={v2.faint} />
    </View>
  );
}

// ── List row (border-bottom) ────────────────────────────────────
export function V2Row({
  onPress,
  children,
  style,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.row, style, pressed && { opacity: 0.7 }]}>
      {children}
    </Pressable>
  );
}

// ── StyleSheet ──────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: v2.bg },
  safe: { flex: 1 },
  container: { flex: 1 },
  padded: { paddingHorizontal: 24, paddingBottom: 64 },
  sectionLabel: {
    color: v2.faint,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.5,
    marginBottom: 8,
    marginTop: 4,
  },
  display: {
    color: v2.text,
    fontWeight: '700',
    letterSpacing: -1.5,
    lineHeight: undefined,
  },
  body: {
    color: v2.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  statValue: {
    color: v2.text,
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -2,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  buttonFull: { alignSelf: 'stretch', alignItems: 'center' },
  buttonPrimary: { backgroundColor: v2.text },
  buttonSecondary: { borderWidth: 1, borderColor: v2.borderStrong },
  buttonTextPrimary: { color: '#000', fontSize: 15, fontWeight: '700' },
  buttonTextSecondary: { color: v2.text, fontSize: 15, fontWeight: '700' },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: v2.border,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: v2.text, borderColor: v2.text },
  chipText: { color: v2.muted, fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  chipTextSelected: { color: '#000', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  input: {
    color: v2.text,
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: v2.border,
  },
  row: {
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: v2.border,
  },
});
