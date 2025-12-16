import { IPollRepository } from "../../domain/repositories/poll-repository";

export type ListPollsFilters = {
  category?: string;
  minVotes?: number;
  maxVotes?: number;
  createdFrom?: Date;
  createdTo?: Date;
  status?: "OPEN" | "CLOSED" | "DRAFT";
  page: number;
  limit: number;
};

export type ListPollsOutput = {
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
  filters: {
    category?: string;
    minVotes?: number;
    maxVotes?: number;
    createdFrom?: Date;
    createdTo?: Date;
    status?: string;
  };
};

export class ListPollsUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(filters: ListPollsFilters): Promise<ListPollsOutput> {
    if (filters.page < 1) {
      throw new Error("Page must be greater than 0");
    }

    if (filters.limit < 1 || filters.limit > 100) {
      throw new Error("Limit must be between 1 and 100");
    }

    if (filters.minVotes !== undefined && filters.minVotes < 0) {
      throw new Error("minVotes must be non-negative");
    }

    if (filters.maxVotes !== undefined && filters.maxVotes < 0) {
      throw new Error("maxVotes must be non-negative");
    }

    if (
      filters.minVotes !== undefined &&
      filters.maxVotes !== undefined &&
      filters.minVotes > filters.maxVotes
    ) {
      throw new Error("minVotes cannot be greater than maxVotes");
    }

    if (
      filters.createdFrom &&
      filters.createdTo &&
      filters.createdFrom > filters.createdTo
    ) {
      throw new Error("createdFrom cannot be later than createdTo");
    }

    const result = await this.pollRepository.findManyWithFilters(filters);

    return {
      polls: result.polls,
      pagination: result.pagination,
      filters: {
        category: filters.category,
        minVotes: filters.minVotes,
        maxVotes: filters.maxVotes,
        createdFrom: filters.createdFrom,
        createdTo: filters.createdTo,
        status: filters.status,
      },
    };
  }
}
