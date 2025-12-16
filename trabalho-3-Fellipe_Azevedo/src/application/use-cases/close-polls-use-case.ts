import { IPollRepository } from "../../domain/repositories/poll-repository";

export class ClosePollsUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(pollId: string): Promise<void> {
    const poll = await this.pollRepository.findById(pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.status !== "OPEN") {
      throw new Error("Only open polls can be closed");
    }

    await this.pollRepository.close(pollId);
  }
}
