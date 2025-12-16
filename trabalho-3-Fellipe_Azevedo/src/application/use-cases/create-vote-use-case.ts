import { Vote } from "../../domain/entities/vote";
import { IVoteRepository } from "../../domain/repositories/vote-repository";
import { IPollRepository } from "../../domain/repositories/poll-repository";

export type CreateVoteInput = {
  userId: string;
  pollId: string;
  optionId: string;
};

export class CreateVoteUseCase {
  constructor(
    private readonly voteRepository: IVoteRepository,
    private readonly pollRepository: IPollRepository
  ) {}

  async execute(input: CreateVoteInput): Promise<Vote> {
    const poll = await this.pollRepository.findByIdWithOptions(input.pollId);

    if (!poll) {
      throw new Error("Poll not found");
    }

    if (poll.poll.status !== "OPEN") {
      throw new Error("Poll is closed");
    }

    const now = new Date();
    if (poll.poll.startAt > now) {
      throw new Error("Poll has not started yet");
    }

    if (poll.poll.endAt && poll.poll.endAt < now) {
      throw new Error("Poll has already ended");
    }

    const hasVoted = await this.voteRepository.hasUserVoted(
      input.userId,
      input.pollId
    );

    if (hasVoted) {
      throw new Error("User has already voted in this poll");
    }

    const optionExists = poll.options.some((opt) => opt.id === input.optionId);

    if (!optionExists) {
      throw new Error("Option does not belong to this poll");
    }

    if (poll.poll.expectedVotes) {
      const currentVotes = await this.voteRepository.countByPoll(input.pollId);
      if (currentVotes >= poll.poll.expectedVotes) {
        throw new Error("Poll has reached maximum number of votes");
      }
    }

    const vote = Vote.create({
      userId: input.userId,
      pollId: input.pollId,
      optionId: input.optionId,
    });

    return await this.voteRepository.create(vote);
  }
}
