import type { ChoreographyJson, PoseCheckpoint } from '@fitai/shared';

const MOCK_CHOREOGRAPHY: ChoreographyJson = {
  video_id: 'mock',
  poses: [
    {
      timestamp_start: 5,
      timestamp_end: 15,
      name: 'Warrior I',
      rules: [
        { joint: 'left_knee', angle_min: 80, angle_max: 100 },
        { joint: 'right_hip', angle_min: 160, angle_max: 180 },
      ],
      feedback_wrong: 'Pokrč přední koleno více',
      feedback_correct: 'Výborně, drž pozici',
    },
    {
      timestamp_start: 20,
      timestamp_end: 35,
      name: 'Mountain Pose',
      rules: [
        { joint: 'left_knee', angle_min: 160, angle_max: 180 },
        { joint: 'right_knee', angle_min: 160, angle_max: 180 },
        { joint: 'left_shoulder', angle_min: 150, angle_max: 180 },
      ],
      feedback_wrong: 'Narovnej nohy a zvedni ramena',
      feedback_correct: 'Perfektní postoj!',
    },
  ],
};

export async function loadChoreography(
  choreographyUrl: string | null,
): Promise<ChoreographyJson> {
  if (!choreographyUrl) return MOCK_CHOREOGRAPHY;

  try {
    const res = await fetch(choreographyUrl);
    if (!res.ok) throw new Error('Failed to load choreography');
    return await res.json();
  } catch {
    return MOCK_CHOREOGRAPHY;
  }
}

export function getCurrentCheckpoint(
  choreography: ChoreographyJson | null,
  currentTimeSeconds: number,
): PoseCheckpoint | null {
  if (!choreography) return null;

  return (
    choreography.poses.find(
      (p) =>
        currentTimeSeconds >= p.timestamp_start &&
        currentTimeSeconds <= p.timestamp_end,
    ) ?? null
  );
}
