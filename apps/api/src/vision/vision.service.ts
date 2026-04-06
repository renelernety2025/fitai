import { Injectable, Logger } from '@nestjs/common';

// Standard plate colors → weight (kg) mapping
const PLATE_COLORS: Record<string, number> = {
  red: 25, blue: 20, yellow: 15, green: 10, white: 5, black: 2.5,
};

// Known equipment types
const EQUIPMENT_TYPES = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'bench',
  'rack', 'pullup_bar', 'resistance_band', 'mat',
] as const;

export interface DetectionResult {
  equipment: { type: string; confidence: number }[];
  estimatedWeight: number | null;
  plateColors: string[];
  exerciseGuess: string | null;
}

@Injectable()
export class VisionService {
  private readonly logger = new Logger(VisionService.name);
  private modelLoaded = false;

  constructor() {
    // In production, load ONNX model here
    // For now, use rule-based detection from pose data
    this.logger.log('VisionService initialized (rule-based mode)');
  }

  /**
   * Analyze a frame snapshot for equipment detection.
   * In production: receives image buffer → runs YOLO/Florence inference.
   * For MVP: uses pose landmarks + exercise context for smart guessing.
   */
  async analyzeFrame(data: {
    exerciseName: string;
    jointAngles: { joint: string; angle: number }[];
    imageBase64?: string;
  }): Promise<DetectionResult> {
    // If we have an actual image and model, run inference
    if (data.imageBase64 && this.modelLoaded) {
      return this.runModelInference(data.imageBase64);
    }

    // Rule-based fallback: guess equipment from exercise name
    return this.guessFromExercise(data.exerciseName);
  }

  /**
   * Estimate weight from plate detection in image.
   * Uses color-based plate recognition.
   */
  async estimateWeight(imageBase64: string): Promise<{
    estimatedWeight: number | null;
    plates: { color: string; weight: number; count: number }[];
    confidence: number;
  }> {
    if (!this.modelLoaded) {
      this.logger.warn('Model not loaded — returning null weight estimate');
      return { estimatedWeight: null, plates: [], confidence: 0 };
    }

    // In production: run plate detection model
    // Parse detected plate colors → sum weights
    return { estimatedWeight: null, plates: [], confidence: 0 };
  }

  /**
   * Auto-detect which exercise is being performed from pose data.
   * Uses joint angle patterns to classify.
   */
  detectExercise(jointAngles: { joint: string; angle: number }[]): {
    exercise: string | null;
    confidence: number;
  } {
    const angleMap = new Map(jointAngles.map((a) => [a.joint, a.angle]));
    const lKnee = angleMap.get('left_knee') ?? 180;
    const rKnee = angleMap.get('right_knee') ?? 180;
    const lElbow = angleMap.get('left_elbow') ?? 180;
    const rElbow = angleMap.get('right_elbow') ?? 180;
    const lHip = angleMap.get('left_hip') ?? 180;
    const lShoulder = angleMap.get('left_shoulder') ?? 180;

    // Squat pattern: both knees bent, hips bent
    if (lKnee < 120 && rKnee < 120 && lHip < 120) {
      return { exercise: 'squat', confidence: 0.8 };
    }

    // Deadlift pattern: hips very bent, knees slightly bent
    if (lHip < 90 && lKnee > 130) {
      return { exercise: 'deadlift', confidence: 0.75 };
    }

    // Bench press pattern: elbows bent, lying position (shoulders low)
    if (lElbow < 100 && rElbow < 100 && lShoulder > 80) {
      return { exercise: 'bench_press', confidence: 0.7 };
    }

    // Overhead press: elbows extended above
    if (lShoulder > 140 && lElbow > 150) {
      return { exercise: 'overhead_press', confidence: 0.7 };
    }

    // Bicep curl: one or both elbows very bent, standing
    if ((lElbow < 60 || rElbow < 60) && lKnee > 160) {
      return { exercise: 'bicep_curl', confidence: 0.75 };
    }

    // Row: hips bent, elbows bent
    if (lHip < 100 && lElbow < 90) {
      return { exercise: 'barbell_row', confidence: 0.65 };
    }

    // Plank: straight body
    if (lHip > 160 && lKnee > 160 && lShoulder > 70 && lShoulder < 120) {
      return { exercise: 'plank', confidence: 0.7 };
    }

    // Lunge: one knee bent, one straight
    if ((lKnee < 100 && rKnee > 140) || (rKnee < 100 && lKnee > 140)) {
      return { exercise: 'lunge', confidence: 0.7 };
    }

    return { exercise: null, confidence: 0 };
  }

  /**
   * Calculate weight from detected plate colors.
   * Standard Olympic plates: Red=25, Blue=20, Yellow=15, Green=10, White=5, Black=2.5
   */
  calculateWeightFromPlates(plateColors: string[]): number {
    const barWeight = 20; // Standard Olympic bar
    const plateWeight = plateColors.reduce((sum, color) => {
      return sum + (PLATE_COLORS[color.toLowerCase()] ?? 0);
    }, 0);
    // Each plate appears on both sides
    return barWeight + plateWeight * 2;
  }

  private guessFromExercise(exerciseName: string): DetectionResult {
    const name = exerciseName.toLowerCase();
    const equipment: { type: string; confidence: number }[] = [];

    if (name.includes('bench') || name.includes('press') || name.includes('tlak')) {
      equipment.push({ type: 'barbell', confidence: 0.8 }, { type: 'bench', confidence: 0.9 });
    } else if (name.includes('squat') || name.includes('dřep')) {
      equipment.push({ type: 'barbell', confidence: 0.85 }, { type: 'rack', confidence: 0.8 });
    } else if (name.includes('deadlift') || name.includes('mrtvý')) {
      equipment.push({ type: 'barbell', confidence: 0.9 });
    } else if (name.includes('curl') || name.includes('zdvih')) {
      equipment.push({ type: 'dumbbell', confidence: 0.7 });
    } else if (name.includes('row') || name.includes('přítah')) {
      equipment.push({ type: 'barbell', confidence: 0.75 });
    } else if (name.includes('plank')) {
      equipment.push({ type: 'mat', confidence: 0.6 });
    }

    return {
      equipment,
      estimatedWeight: null,
      plateColors: [],
      exerciseGuess: equipment.length > 0 ? exerciseName : null,
    };
  }

  private async runModelInference(imageBase64: string): Promise<DetectionResult> {
    // Placeholder for ONNX Runtime / YOLO inference
    // In production:
    // 1. Decode base64 → image buffer
    // 2. Run through YOLO model for object detection
    // 3. Filter for gym equipment classes
    // 4. Detect plate colors for weight estimation
    this.logger.warn('Model inference not implemented — using fallback');
    return { equipment: [], estimatedWeight: null, plateColors: [], exerciseGuess: null };
  }
}
