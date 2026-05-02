import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, Pressable, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  V2Screen,
  V2Display,
  V2SectionLabel,
  V2Stat,
  V2Loading,
  v2,
} from '../components/v2/V2';
import {
  getProgressPhotos,
  getProgressPhotoStats,
  getProgressPhotoUploadUrl,
  analyzeProgressPhoto,
  deleteProgressPhoto,
} from '../lib/api';

type Side = 'FRONT' | 'SIDE' | 'BACK';

const SIDES: { value: Side; label: string }[] = [
  { value: 'FRONT', label: 'Front' },
  { value: 'SIDE', label: 'Side' },
  { value: 'BACK', label: 'Back' },
];

export function ProgressPhotosScreen({ navigation }: any) {
  const [photos, setPhotos] = useState<any[] | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<Side | 'ALL'>('ALL');
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const filterRef = useRef(filter);
  filterRef.current = filter;

  const reload = useCallback(() => {
    const currentFilter = filterRef.current;
    getProgressPhotos(currentFilter === 'ALL' ? undefined : currentFilter).then(setPhotos).catch(() => setPhotos([]));
    getProgressPhotoStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    setPhotos(null);
    reload();
  }, [filter, reload]);

  async function pickAndUpload(side: Side) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow access to your photo library to upload progress photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;

    setBusy(true);
    try {
      const asset = result.assets[0];
      const { uploadUrl } = await getProgressPhotoUploadUrl({
        contentType: 'image/jpeg',
        side,
      });
      // Read file as blob
      const fileRes = await fetch(asset.uri);
      const blob = await fileRes.blob();
      const upload = await fetch(uploadUrl, {
        method: 'PUT',
        body: blob,
        headers: { 'Content-Type': 'image/jpeg' },
      });
      if (!upload.ok) throw new Error(`S3 ${upload.status}`);
      reload();
    } catch (e: any) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function onAnalyze(id: string) {
    setAnalyzing(id);
    try {
      await analyzeProgressPhoto(id);
      reload();
    } catch (e: any) {
      Alert.alert('Analysis failed', e.message || 'Please try again');
    } finally {
      setAnalyzing(null);
    }
  }

  function onDelete(id: string) {
    Alert.alert('Delete photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProgressPhoto(id);
            reload();
          } catch {
            Alert.alert('Error', 'Failed to delete photo');
          }
        },
      },
    ]);
  }

  return (
    <V2Screen>
      <View style={{ paddingTop: 16 }}>
        <V2SectionLabel>Body Progress</V2SectionLabel>
        <V2Display size="lg">Your journey.</V2Display>
        <Text style={{ color: v2.muted, fontSize: 14, marginTop: 12, lineHeight: 20 }}>
          Private progress photo gallery + AI body composition analysis.
        </Text>
      </View>

      {stats && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: v2.border,
            paddingVertical: 24,
            marginVertical: 32,
          }}
        >
          <V2Stat value={stats.total} label="Photos" />
          <V2Stat value={stats.daysTracked} label="Days" />
          <V2Stat value={stats.byAngle?.front ?? 0} label="Front" />
        </View>
      )}

      {/* Upload buttons */}
      <V2SectionLabel>New photo</V2SectionLabel>
      <View style={{ gap: 12, marginBottom: 32 }}>
        {SIDES.map((s) => (
          <Pressable
            key={s.value}
            onPress={() => pickAndUpload(s.value)}
            disabled={busy}
            style={{
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: v2.border,
              borderRadius: 16,
              paddingVertical: 24,
              alignItems: 'center',
              opacity: busy ? 0.5 : 1,
            }}
          >
            <Text style={{ color: v2.text, fontSize: 16, fontWeight: '600' }}>+ {s.label}</Text>
          </Pressable>
        ))}
        {busy && <Text style={{ color: v2.muted, fontSize: 12 }}>Uploading...</Text>}
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginBottom: 16 }}
      >
        {(['ALL', 'FRONT', 'SIDE', 'BACK'] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f as any)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: filter === f ? '#FFF' : v2.border,
              backgroundColor: filter === f ? '#FFF' : 'transparent',
            }}
          >
            <Text
              style={{
                color: filter === f ? '#000' : v2.muted,
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {f === 'ALL' ? 'All' : SIDES.find((s) => s.value === f)?.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Gallery */}
      <V2SectionLabel>Gallery ({photos?.length ?? 0})</V2SectionLabel>
      {photos === null ? (
        <V2Loading />
      ) : photos.length === 0 ? (
        <View
          style={{
            borderWidth: 1,
            borderColor: v2.border,
            borderRadius: 16,
            padding: 32,
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <Text style={{ color: v2.muted }}>No photos yet.</Text>
        </View>
      ) : (
        <View style={{ gap: 16, marginTop: 12, marginBottom: 32 }}>
          {photos.map((p: any) => (
            <View
              key={p.id}
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: v2.border,
                backgroundColor: 'rgba(0,0,0,0.4)',
              }}
            >
              <Image
                source={{ uri: p.url }}
                style={{ width: '100%', aspectRatio: 3 / 4 }}
                resizeMode="cover"
              />
              <View style={{ padding: 12, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: v2.text, fontSize: 13, fontWeight: '600' }}>
                    {SIDES.find((s) => s.value === p.side)?.label} ·{' '}
                    {new Date(p.takenAt).toLocaleDateString('en-US')}
                  </Text>
                  <Pressable onPress={() => onDelete(p.id)}>
                    <Text style={{ color: '#ff6464', fontSize: 12 }}>Delete</Text>
                  </Pressable>
                </View>
                {p.analysis ? (
                  <View>
                    {p.analysis.estimatedBodyFatPct != null ? (
                      <>
                        <Text style={{ color: '#A8FF00', fontSize: 13, fontWeight: '600' }}>
                          ~{p.analysis.estimatedBodyFatPct.toFixed(1)}% body fat
                        </Text>
                        {p.analysis.estimatedMuscleMass && (
                          <Text style={{ color: v2.muted, fontSize: 11 }}>
                            Muscle mass: {p.analysis.estimatedMuscleMass}
                          </Text>
                        )}
                      </>
                    ) : (
                      <Text style={{ color: '#FF9F0A', fontSize: 12 }}>
                        ⚠ AI could not analyze — {p.analysis.postureNotes || 'unsuitable image'}
                      </Text>
                    )}
                    {p.analysis.estimatedBodyFatPct != null && p.analysis.postureNotes && (
                      <Text style={{ color: v2.muted, fontSize: 11, marginTop: 4 }}>
                        {p.analysis.postureNotes}
                      </Text>
                    )}
                  </View>
                ) : (
                  <Pressable
                    onPress={() => onAnalyze(p.id)}
                    disabled={analyzing === p.id}
                    style={{
                      backgroundColor: '#FFF',
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 999,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>
                      {analyzing === p.id ? 'Analyzing...' : '✦ AI analysis'}
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </V2Screen>
  );
}
