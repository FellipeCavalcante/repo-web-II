import { IPollRepository } from "../../domain/repositories/poll-repository";
import { IVoteRepository } from "../../domain/repositories/vote-repository";

export type PollResultOutput = {
  pollId: string;
  title: string;
  description: string | null;
  totalVotes: number;
  status: string;
  options: Array<{
    id: string;
    text: string;
    votes: number;
    percentage: number;
  }>;
};

export class GetPollResultsUseCase {
  constructor(
    private readonly pollRepository: IPollRepository,
    private readonly voteRepository: IVoteRepository
  ) {}

  async execute(pollId: string, userId: string): Promise<PollResultOutput> {
    const pollWithOptions = await this.pollRepository.findByIdWithOptions(
      pollId
    );

    if (!pollWithOptions) {
      throw new Error("Poll not found");
    }

    const { poll, options } = pollWithOptions;

    if (poll.visibility === "PRIVATE" && poll.creatorId !== userId) {
      throw new Error(
        "Only the poll creator can view results of private polls"
      );
    }

    const totalVotes = await this.voteRepository.countByPoll(pollId);

    const optionsWithVotes = await Promise.all(
      options.map(async (option) => {
        const votes = await this.voteRepository.countByOption(option.id);
        const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

        return {
          id: option.id,
          text: option.text,
          votes,
          percentage: Math.round(percentage * 100) / 100,
        };
      })
    );

    optionsWithVotes.sort((a, b) => b.votes - a.votes);

    return {
      pollId: poll.id,
      title: poll.title,
      description: poll.description,
      totalVotes,
      status: poll.status,
      options: optionsWithVotes,
    };
  }
}
