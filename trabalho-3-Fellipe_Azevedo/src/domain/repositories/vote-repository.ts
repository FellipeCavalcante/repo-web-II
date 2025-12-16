import { Vote } from "../entities/vote";

export interface IVoteRepository {
  create(vote: Vote): Promise<Vote>;
  findByUserAndPoll(userId: string, pollId: string): Promise<Vote | null>;
  countByPoll(pollId: string): Promise<number>;
  countByOption(optionId: string): Promise<number>;
  findVotesByUser(userId: string, page: number, limit: number): Promise<Vote[]>;
  findVotesByPoll(pollId: string, page: number, limit: number): Promise<Vote[]>;
  hasUserVoted(userId: string, pollId: string): Promise<boolean>;
  countByUser(userId: string): Promise<number>;
  findUserVotesWithDetails(
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
  >;
}
