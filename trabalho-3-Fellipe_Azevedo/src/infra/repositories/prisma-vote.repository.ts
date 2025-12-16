import { PrismaClient } from "@prisma/client";
import { Vote } from "../../domain/entities/vote";
import { IVoteRepository } from "../../domain/repositories/vote-repository";

export class PrismaVoteRepository implements IVoteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async countByUser(userId: string): Promise<number> {
    return await this.prisma.vote.count({
      where: { user_id: userId },
    });
  }

  async findUserVotesWithDetails(
    userId: string,
    page: number,
    limit: number
  ): Promise<
    Array<{
      pollId: string;
      title: string;
      description: string | null;
      votedAt: Date;
      optionChosen: {
        id: string;
        text: string;
      };
    }>
  > {
    const votes = await this.prisma.vote.findMany({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { voted_at: "desc" },
      include: {
        poll: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        option: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    return votes.map((vote) => ({
      pollId: vote.poll.id,
      title: vote.poll.title,
      description: vote.poll.description,
      votedAt: vote.voted_at,
      optionChosen: {
        id: vote.option.id,
        text: vote.option.text,
      },
    }));
  }

  async create(vote: Vote): Promise<Vote> {
    const createdVote = await this.prisma.vote.create({
      data: {
        user_id: vote.userId,
        poll_id: vote.pollId,
        option_id: vote.optionId,
      },
    });

    return new Vote(
      createdVote.id,
      createdVote.user_id,
      createdVote.poll_id,
      createdVote.option_id,
      createdVote.voted_at
    );
  }

  async findByUserAndPoll(
    userId: string,
    pollId: string
  ): Promise<Vote | null> {
    const vote = await this.prisma.vote.findUnique({
      where: {
        user_id_poll_id: {
          user_id: userId,
          poll_id: pollId,
        },
      },
    });

    if (!vote) return null;

    return new Vote(
      vote.id,
      vote.user_id,
      vote.poll_id,
      vote.option_id,
      vote.voted_at
    );
  }

  async countByPoll(pollId: string): Promise<number> {
    return await this.prisma.vote.count({
      where: { poll_id: pollId },
    });
  }

  async countByOption(optionId: string): Promise<number> {
    return await this.prisma.vote.count({
      where: { option_id: optionId },
    });
  }

  async findVotesByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: { user_id: userId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { voted_at: "desc" },
    });

    return votes.map(
      (vote) =>
        new Vote(
          vote.id,
          vote.user_id,
          vote.poll_id,
          vote.option_id,
          vote.voted_at
        )
    );
  }

  async findVotesByPoll(
    pollId: string,
    page: number,
    limit: number
  ): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: { poll_id: pollId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { voted_at: "desc" },
    });

    return votes.map(
      (vote) =>
        new Vote(
          vote.id,
          vote.user_id,
          vote.poll_id,
          vote.option_id,
          vote.voted_at
        )
    );
  }

  async hasUserVoted(userId: string, pollId: string): Promise<boolean> {
    const vote = await this.prisma.vote.findUnique({
      where: {
        user_id_poll_id: {
          user_id: userId,
          poll_id: pollId,
        },
      },
    });

    return vote !== null;
  }
}
