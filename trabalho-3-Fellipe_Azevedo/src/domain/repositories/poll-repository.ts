import { Poll } from "../entities/poll";
import { PollOption } from "../entities/poll-option";

export interface CreatePollData {
  poll: Poll;
  options: PollOption[];
  categoryIds: string[];
}

export type ExtendPollInput = {
  endAt?: Date;
  expectedVotes?: number;
};

export interface IPollRepository {
  create(data: CreatePollData): Promise<Poll>;
  findById(id: string): Promise<Poll | null>;
  findByIdWithOptions(
    id: string
  ): Promise<{ poll: Poll; options: PollOption[] } | null>;
  findByCreatorId(
    creatorId: string,
    page: number,
    limit: number
  ): Promise<Poll[]>;
  close(pollId: string): Promise<void>;
  extendEndDate(pollId: string, input: ExtendPollInput): Promise<void>;
  countByCreatorId(creatorId: string): Promise<number>;
  findManyWithFilters(filters: {
    category?: string;
    minVotes?: number;
    maxVotes?: number;
    createdFrom?: Date;
    createdTo?: Date;
    status?: "OPEN" | "CLOSED" | "DRAFT";
    page: number;
    limit: number;
  }): Promise<{
    polls: Array<{
      id: string;
      title: string;
      description: string | null;
      visibility: string;
      status: string;
      startAt: Date;
      endAt: Date | null;
      expectedVotes: number | null;
      totalVotes: number;
      createdAt: Date;
      creator: {
        id: string;
        name: string;
      };
      categories: Array<{
        id: string;
        name: string;
        slug: string;
      }>;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }>;
}
