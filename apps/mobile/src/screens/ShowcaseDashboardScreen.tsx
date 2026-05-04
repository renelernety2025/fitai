import React from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Rect, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { v2 } from '../components/v2/V2';
import { monthDays, weekChart, type DayActivity, type DayCellData } from './showcase-mock-data';

const PEACH = '#FFA38C';
const PEACH_DEEP = '#E15A6F';
const PEACH_BG = 'rgba(255, 163, 140, 0.10)';
const BLUE_SOFT = 'rgba(108, 112, 230, 0.18)';

export function ShowcaseDashboardScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: v2.bg }}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32, paddingHorizontal: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        <HeroCard />
        <MonthActivityCard />
        <ProgressTrio />
        <WeekChartCard />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <RunningCard />
          <HydrationCard />
        </View>
      </ScrollView>
    </View>
  );
}

function Header() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 8 }}>
      <View>
        <Text style={{ color: v2.faint, fontSize: 11, letterSpacing: 2, fontWeight: '600' }}>FITAI · SHOWCASE</Text>
        <Text style={{ color: v2.text, fontSize: 22, fontWeight: '700', marginTop: 4 }}>Today</Text>
      </View>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: PEACH, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 22 }}>🏋️</Text>
      </View>
    </View>
  );
}

function HeroCard() {
  return (
    <LinearGradient
      colors={['#FFB3A0', '#E15A6F', '#7A2C46']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24, padding: 24, minHeight: 240, overflow: 'hidden' }}
    >
      <HeroDecoration />
      <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: '700', lineHeight: 34, letterSpacing: -0.5 }}>
        Your Body,{'\n'}Your Power.
      </Text>
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 12, lineHeight: 18 }}>
        Track your fitness journey{'\n'}with clarity and purpose.
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24, gap: 12 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16 }}>✨</Text>
        </View>
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>AI-Powered</Text>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Predict & Perform</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 16, right: 24, flexDirection: 'row', gap: 6 }}>
        <View style={{ width: 18, height: 3, borderRadius: 2, backgroundColor: '#FFFFFF' }} />
        <View style={{ width: 6, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        <View style={{ width: 6, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
      </View>
    </LinearGradient>
  );
}

function HeroDecoration() {
  return (
    <Svg style={{ position: 'absolute', right: -20, top: -10 }} width={200} height={200} viewBox="0 0 200 200">
      <Defs>
        <SvgGradient id="halo" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.18" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Circle cx="120" cy="80" r="80" fill="url(#halo)" />
      <Circle cx="170" cy="40" r="3" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="155" cy="65" r="2" fill="#FFFFFF" opacity="0.4" />
    </Svg>
  );
}

function MonthActivityCard() {
  const dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return (
    <View style={cardStyle()}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: v2.text, fontSize: 18, fontWeight: '700' }}>Month activity</Text>
        <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: v2.muted, fontSize: 14 }}>↗</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        {dayLabels.map((d) => (
          <Text key={d} style={{ color: v2.faint, fontSize: 11, fontWeight: '600', width: 36, textAlign: 'center' }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {monthDays.map((cell, i) => (
          <DayCell key={i} cell={cell} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: v2.border, gap: 12 }}>
        <Stat label="Active time" value="4 h 32 m" />
        <Stat label="Recovery avg." value="17 hours" />
        <Stat label="Best day" value="Monday" />
      </View>
    </View>
  );
}

function DayCell({ cell }: { cell: DayCellData }) {
  const isHighlighted = cell.highlighted;
  return (
    <View style={{ width: '14.2857%', alignItems: 'center', paddingVertical: 6 }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: isHighlighted ? PEACH : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: isHighlighted ? '#1a0e10' : cell.muted ? v2.faint : v2.text,
            fontSize: 14,
            fontWeight: isHighlighted ? '700' : '500',
          }}
        >
          {cell.day}
        </Text>
      </View>
      {cell.activity ? <ActivityDots dots={cell.activity} /> : <View style={{ height: 6 }} />}
    </View>
  );
}

function ActivityDots({ dots }: { dots: DayActivity }) {
  const items: string[] = [];
  for (let i = 0; i < dots.workouts; i++) items.push('w');
  for (let i = 0; i < dots.recovery; i++) items.push('r');
  return (
    <View style={{ flexDirection: 'row', gap: 3, height: 6, marginTop: 2 }}>
      {items.map((kind, i) => (
        <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: kind === 'w' ? PEACH_DEEP : '#6C70E6' }} />
      ))}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: v2.faint, fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</Text>
      <Text style={{ color: v2.text, fontSize: 14, fontWeight: '700', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function ProgressTrio() {
  return (
    <View style={{ gap: 10 }}>
      <ProgressRow icon="💧" tint={BLUE_SOFT} label="Water" current="2.2 / 3.28 L" percent={67} barColor="#6C70E6" />
      <ProgressRow icon="🏃" tint={PEACH_BG} label="Steps" current="6,000 / 12,000" percent={50} barColor={PEACH_DEEP} />
      <ProgressRow icon="⚡" tint="rgba(255, 200, 100, 0.10)" label="Calories" current="1,420 / 1,680 Cal" percent={85} barColor="#FFC470" />
    </View>
  );
}

function ProgressRow({ icon, tint, label, current, percent, barColor }: {
  icon: string; tint: string; label: string; current: string; percent: number; barColor: string;
}) {
  return (
    <View style={{ ...cardStyle(), padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${percent}%`, backgroundColor: tint }} />
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 16 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: v2.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: v2.faint, fontSize: 12, marginTop: 2 }}>{current}</Text>
      </View>
      <Text style={{ color: barColor, fontSize: 14, fontWeight: '800' }}>{percent}%</Text>
    </View>
  );
}

function WeekChartCard() {
  const max = Math.max(...weekChart.flatMap((d) => [d.current, d.previous]));
  const barWidth = 14;
  const barGap = 4;
  return (
    <View style={cardStyle()}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: v2.text, fontSize: 18, fontWeight: '700' }}>This week</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: PEACH_DEEP }} />
          <Text style={{ color: v2.faint, fontSize: 11 }}>Last week</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 130 }}>
        {weekChart.map((d) => (
          <View key={d.label} style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: barGap, height: 110 }}>
              <Bar value={d.previous} max={max} width={barWidth} color="rgba(255,255,255,0.08)" />
              <Bar value={d.current} max={max} width={barWidth} color={d.active ? PEACH_DEEP : PEACH} highlighted={d.active} />
            </View>
            <Text style={{ color: d.active ? v2.text : v2.faint, fontSize: 11, fontWeight: d.active ? '700' : '500', marginTop: 8 }}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Bar({ value, max, width, color, highlighted }: { value: number; max: number; width: number; color: string; highlighted?: boolean }) {
  const height = Math.max(value > 0 ? 8 : 0, (value / max) * 110);
  return (
    <View
      style={{
        width,
        height,
        backgroundColor: color,
        borderRadius: width / 2,
        ...(highlighted ? { shadowColor: PEACH_DEEP, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } } : {}),
      }}
    />
  );
}

function RunningCard() {
  return (
    <View style={{ ...cardStyle(), flex: 1, alignItems: 'flex-start', padding: 18 }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255, 200, 100, 0.16)', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>⚡</Text>
      </View>
      <Text style={{ color: v2.text, fontSize: 28, fontWeight: '800', marginTop: 28, letterSpacing: -1 }}>00:27</Text>
      <Text style={{ color: v2.faint, fontSize: 12, marginTop: 4 }}>Running</Text>
    </View>
  );
}

function HydrationCard() {
  return (
    <View style={{ ...cardStyle(), flex: 1, padding: 18, overflow: 'hidden' }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(108, 112, 230, 0.18)', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>💧</Text>
      </View>
      <Text style={{ color: v2.text, fontSize: 28, fontWeight: '800', marginTop: 28, letterSpacing: -1 }}>1.08 L</Text>
      <Text style={{ color: v2.faint, fontSize: 12, marginTop: 4 }}>Hydration</Text>
      <HydrationWave />
    </View>
  );
}

function HydrationWave() {
  return (
    <Svg style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} width="100%" height={48} viewBox="0 0 200 48" preserveAspectRatio="none">
      <Defs>
        <SvgGradient id="wave" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#6C70E6" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#6C70E6" stopOpacity="0.15" />
        </SvgGradient>
      </Defs>
      <Path d="M0,24 Q50,8 100,20 T200,16 L200,48 L0,48 Z" fill="url(#wave)" />
      <Path d="M0,32 Q50,18 100,28 T200,26 L200,48 L0,48 Z" fill="#6C70E6" fillOpacity="0.25" />
    </Svg>
  );
}

function cardStyle() {
  return {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: v2.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  } as const;
}
