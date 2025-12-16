import { IPollRepository } from "../../domain/repositories/poll-repository";

export type ExtendPollInput = {
  endAt?: Date;
  expectedVotes?: number;
};

export class ExtendPollsUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(pollId: string, input: ExtendPollInput): Promise<void> {
    const poll = await this.pollRepository.findById(pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status !== "OPEN") {
      throw new Error("Only open polls can be extended");
    }

    if (input.endAt) {
      if (poll.endAt !== null && input.endAt <= poll.endAt) {
        throw new Error("New end date must be later than current end date");
      }

      if (input.endAt <= new Date()) {
        throw new Error("End date cannot be in the past");
      }
    }

    if (input.expectedVotes !== undefined && input.expectedVotes < 1) {
      throw new Error("Expected votes must be at least 1");
    }

    await this.pollRepository.extendEndDate(pollId, input);
  }
}
