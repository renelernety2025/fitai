import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type Mode = 'home' | 'travel' | 'quick';

interface HomeWorkout {
  mode: Mode;
  title: string;
  durationMin: number;
  rounds: number;
  rest: string;
  exercises: Array<{
    id: string;
    name: string;
    nameCs: string;
    muscleGroups: string[];
    reps: number | string;
    duration?: number; // seconds
    instructions?: any;
  }>;
}

@Injectable()
export class HomeTrainingService {
  constructor(private prisma: PrismaService) {}

  /** Quick 15-minute HIIT-style workout — bodyweight, no equipment */
  async getQuick(): Promise<HomeWorkout> {
    const ex = await this.prisma.exercise.findMany({
      where: { equipment: { isEmpty: true } },
    });
    const pick = (name: string) => ex.find((e) => e.name === name);

    const sequence = [
      { src: pick('Jumping Jacks'), reps: '40s', duration: 40 },
      { src: pick('Bodyweight Squat'), reps: 15 },
      { src: pick('Push-up'), reps: 12 },
      { src: pick('Mountain Climbers'), reps: '30s', duration: 30 },
      { src: pick('Glute Bridge'), reps: 15 },
      { src: pick('Plank'), reps: '30s', duration: 30 },
    ].filter((s) => s.src);

    return {
      mode: 'quick',
      title: 'Rychlý 15min workout',
      durationMin: 15,
      rounds: 3,
      rest: '20s mezi cviky, 60s mezi koly',
      exercises: sequence.map((s) => ({
        id: s.src!.id,
        name: s.src!.name,
        nameCs: s.src!.nameCs,
        muscleGroups: s.src!.muscleGroups,
        reps: s.reps,
        duration: s.duration,
        instructions: s.src!.instructions,
      })),
    };
  }

  /** Home workout — 30-40min full body, no equipment needed */
  async getHome(): Promise<HomeWorkout> {
    const ex = await this.prisma.exercise.findMany({
      where: { equipment: { isEmpty: true } },
    });
    const pick = (name: string) => ex.find((e) => e.name === name);

    const sequence = [
      { src: pick('Jumping Jacks'), reps: '60s', duration: 60 },
      { src: pick('Bodyweight Squat'), reps: 20 },
      { src: pick('Push-up'), reps: 15 },
      { src: pick('Lunges'), reps: 12 },
      { src: pick('Glute Bridge'), reps: 20 },
      { src: pick('Mountain Climbers'), reps: '45s', duration: 45 },
      { src: pick('Plank'), reps: '45s', duration: 45 },
      { src: pick('Burpees'), reps: 10 },
    ].filter((s) => s.src);

    return {
      mode: 'home',
      title: 'Domácí workout — celé tělo',
      durationMin: 35,
      rounds: 4,
      rest: '30s mezi cviky, 90s mezi koly',
      exercises: sequence.map((s) => ({
        id: s.src!.id,
        name: s.src!.name,
        nameCs: s.src!.nameCs,
        muscleGroups: s.src!.muscleGroups,
        reps: s.reps,
        duration: s.duration,
        instructions: s.src!.instructions,
      })),
    };
  }

  /** Travel workout — minimal space, 20min, no equipment */
  async getTravel(): Promise<HomeWorkout> {
    const ex = await this.prisma.exercise.findMany({
      where: { equipment: { isEmpty: true } },
    });
    const pick = (name: string) => ex.find((e) => e.name === name);

    const sequence = [
      { src: pick('Jumping Jacks'), reps: '45s', duration: 45 },
      { src: pick('Push-up'), reps: 12 },
      { src: pick('Bodyweight Squat'), reps: 15 },
      { src: pick('Lunges'), reps: 10 },
      { src: pick('Plank'), reps: '40s', duration: 40 },
    ].filter((s) => s.src);

    return {
      mode: 'travel',
      title: 'Workout na cestách (hotel/byt)',
      durationMin: 20,
      rounds: 3,
      rest: '20s mezi cviky, 60s mezi koly',
      exercises: sequence.map((s) => ({
        id: s.src!.id,
        name: s.src!.name,
        nameCs: s.src!.nameCs,
        muscleGroups: s.src!.muscleGroups,
        reps: s.reps,
        duration: s.duration,
        instructions: s.src!.instructions,
      })),
    };
  }
}
