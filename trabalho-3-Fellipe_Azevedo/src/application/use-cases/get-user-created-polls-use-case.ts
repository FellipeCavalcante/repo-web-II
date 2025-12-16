import { IPollRepository } from "../../domain/repositories/poll-repository";

export type UserCreatedPollsInput = {
  userId: string;
  page: number;
  limit: number;
};

export type UserCreatedPollsOutput = {
  polls: Array<{
    id: string;
    title: string;
    description: string | null;
    visibility: string;
    status: string;
    startAt: Date;
    endAt: Date | null;
    expectedVotes: number | null;
    createdAt: Date;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};

export class GetUserCreatedPollsUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(input: UserCreatedPollsInput): Promise<UserCreatedPollsOutput> {
    if (input.page < 1) {
      throw new Error("Page must be greater than 0");
    }

    if (input.limit < 1 || input.limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    const polls = await this.pollRepository.findByCreatorId(
      input.userId,
      input.page,
      input.limit
    );

    const total = await this.pollRepository.countByCreatorId(input.userId);

    return {
      polls: polls.map((poll) => ({
        id: poll.id,
        title: poll.title,
        description: poll.description,
        visibility: poll.visibility,
        status: poll.status,
        startAt: poll.startAt,
        endAt: poll.endAt,
        expectedVotes: poll.expectedVotes,
        createdAt: poll.createdAt,
      })),
      pagination: {
        page: input.page,
        limit: input.limit,
        total,
      },
    };
  }
}
