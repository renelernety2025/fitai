import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatarUrl: true },
        },
        participant2: {
          select: { id: true, name: true, avatarUrl: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    return conversations.map((c) => {
      const other =
        c.participant1Id === userId ? c.participant2 : c.participant1;
      return {
        id: c.id,
        otherUser: other,
        lastMessage: c.messages[0] || null,
        lastMessageAt: c.lastMessageAt,
      };
    });
  }

  async getMessages(
    userId: string,
    conversationId: string,
    take = 50,
    cursor?: string,
  ) {
    const conv = await this.findConversation(conversationId, userId);
    if (!conv) throw new ForbiddenException('Nemáš přístup');

    return this.prisma.directMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    content: string,
  ) {
    const conv = await this.findConversation(conversationId, userId);
    if (!conv) throw new ForbiddenException('Nemáš přístup');

    const [message] = await this.prisma.$transaction([
      this.prisma.directMessage.create({
        data: { conversationId, senderId: userId, content },
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() },
      }),
    ]);

    return message;
  }

  async startConversation(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new ForbiddenException('Nemůžeš psát sám sobě');
    }

    const canMessage = await this.canStartConversation(
      userId,
      targetUserId,
    );
    if (!canMessage) {
      throw new ForbiddenException(
        'Musíte se vzájemně sledovat nebo být buddy match',
      );
    }

    const existing = await this.findExistingConversation(
      userId,
      targetUserId,
    );
    if (existing) return existing;

    const [id1, id2] =
      userId < targetUserId
        ? [userId, targetUserId]
        : [targetUserId, userId];

    return this.prisma.conversation.create({
      data: {
        participant1Id: id1,
        participant2Id: id2,
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatarUrl: true },
        },
        participant2: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  async markRead(userId: string, messageId: string) {
    const message = await this.prisma.directMessage.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });
    if (!message) throw new NotFoundException('Zpráva nenalezena');

    const conv = message.conversation;
    const isParticipant =
      conv.participant1Id === userId ||
      conv.participant2Id === userId;
    if (!isParticipant) throw new ForbiddenException('Nemáš přístup');

    if (message.senderId === userId) return { ok: true };

    await this.prisma.directMessage.update({
      where: { id: messageId },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  private async findConversation(
    conversationId: string,
    userId: string,
  ) {
    return this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
    });
  }

  private async findExistingConversation(
    userId: string,
    targetUserId: string,
  ) {
    return this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: userId,
            participant2Id: targetUserId,
          },
          {
            participant1Id: targetUserId,
            participant2Id: userId,
          },
        ],
      },
      include: {
        participant1: {
          select: { id: true, name: true, avatarUrl: true },
        },
        participant2: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });
  }

  private async canStartConversation(
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    const [mutualFollow, buddyMatch] = await Promise.all([
      this.checkMutualFollow(userId, targetUserId),
      this.checkBuddyMatch(userId, targetUserId),
    ]);
    return mutualFollow || buddyMatch;
  }

  private async checkMutualFollow(
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    const count = await this.prisma.follow.count({
      where: {
        OR: [
          { followerId: userId, followedId: targetUserId },
          { followerId: targetUserId, followedId: userId },
        ],
      },
    });
    return count === 2;
  }

  private async checkBuddyMatch(
    userId: string,
    targetUserId: string,
  ): Promise<boolean> {
    const count = await this.prisma.buddySwipe.count({
      where: {
        direction: 'right',
        OR: [
          { swiperId: userId, targetId: targetUserId },
          { swiperId: targetUserId, targetId: userId },
        ],
      },
    });
    return count === 2;
  }
}
