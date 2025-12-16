import { IVoteRepository } from "../../domain/repositories/vote-repository";
import { IPollRepository } from "../../domain/repositories/poll-repository";

export type UserVotedPollsInput = {
  userId: string;
  page: number;
  limit: number;
};

export type UserVotedPollsOutput = {
  votes: Array<{
    pollId: string;
    title: string;
    description: string | null;
    votedAt: Date;
    optionChosen: {
      id: string;
      text: string;
    };
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export class GetUserVotedPollsUseCase {
  constructor(
    private readonly voteRepository: IVoteRepository,
    private readonly pollRepository: IPollRepository
  ) {}

  async execute(input: UserVotedPollsInput): Promise<UserVotedPollsOutput> {
    if (input.page < 1) {
      throw new Error("Page must be greater than 0");
    }

    if (input.limit < 1 || input.limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    const votesWithDetails = await this.voteRepository.findUserVotesWithDetails(
      input.userId,
      input.page,
      input.limit
    );

    const total = await this.voteRepository.countByUser(input.userId);

    return {
      votes: votesWithDetails,
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
      },
    };
  }
}
