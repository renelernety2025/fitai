import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async listPublished(category?: string) {
    return this.prisma.course.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { studentCount: 'desc' },
      take: 50,
    });
  }

  async getDetail(courseId: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        lessons: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    let enrollment = null;
    if (userId) {
      enrollment = await this.prisma.courseEnrollment.findUnique({
        where: { courseId_userId: { courseId, userId } },
      });
    }

    return { ...course, enrollment };
  }

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (!course.isFree && course.price > 0) {
      throw new ForbiddenException('Paid courses not yet supported');
    }

    const enrollment = await this.prisma.courseEnrollment.upsert({
      where: { courseId_userId: { courseId, userId } },
      create: { courseId, userId },
      update: {},
    });

    await this.prisma.course.update({
      where: { id: courseId },
      data: { studentCount: { increment: 1 } },
    });

    return enrollment;
  }

  async completeLesson(
    userId: string,
    courseId: string,
    lessonId: string,
  ) {
    const enrollment = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId, userId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('Not enrolled in this course');
    }

    const lesson = await this.prisma.courseLesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson || lesson.courseId !== courseId) {
      throw new NotFoundException('Lesson not found');
    }

    const completed = enrollment.completedLessons.includes(lessonId)
      ? enrollment.completedLessons
      : [...enrollment.completedLessons, lessonId];

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    return this.prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        completedLessons: completed,
        completedAt:
          course && completed.length >= course.totalLessons
            ? new Date()
            : undefined,
      },
    });
  }

  async create(userId: string, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        creatorId: userId,
        title: dto.title,
        description: dto.description,
        coverUrl: dto.coverUrl,
        category: dto.category,
        difficulty: dto.difficulty ?? 'intermediate',
        isFree: dto.isFree ?? false,
        price: dto.price ?? 0,
      },
    });
  }

  async myEnrollments(userId: string) {
    return this.prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            creator: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }
}
