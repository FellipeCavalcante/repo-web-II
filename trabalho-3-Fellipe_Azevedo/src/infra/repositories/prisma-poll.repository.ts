import { PrismaClient } from "@prisma/client/extension";
import {
  Poll as PrismaPoll,
  PollOption as PrismaPollOption,
  PollCategory as PrismaPollCategory,
  Category as PrismaCategory,
} from "@prisma/client";
import {
  CreatePollData,
  ExtendPollInput,
  IPollRepository,
} from "../../domain/repositories/poll-repository";
import { Poll, PollStatus, PollVisibility } from "../../domain/entities/poll";
import { PollOption } from "../../domain/entities/poll-option";

type PollWithIncludes = PrismaPoll & {
  creator: { id: string; name: string };
  categories: Array<{ category: { id: string; name: string; slug: string } }>;
  _count: { votes: number };
};

type PollCategoryWithCategory = {
  category: { id: string; name: string; slug: string };
};

export class PrismaPollRepository implements IPollRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findManyWithFilters(filters: {
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
  }> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.createdFrom || filters.createdTo) {
      where.created_at = {};
      if (filters.createdFrom) {
        where.created_at.gte = filters.createdFrom;
      }
      if (filters.createdTo) {
        where.created_at.lte = filters.createdTo;
      }
    }

    if (filters.category) {
      where.categories = {
        some: {
          category: {
            slug: filters.category,
          },
        },
      };
    }

    const [polls, total] = await Promise.all([
      this.prisma.poll.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { created_at: "desc" },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              votes: true,
            },
          },
        },
      }),
      this.prisma.poll.count({ where }),
    ]);

    let filteredPolls = polls;

    if (filters.minVotes !== undefined || filters.maxVotes !== undefined) {
      filteredPolls = polls.filter((poll: PollWithIncludes) => {
        const voteCount = poll._count.votes;

        if (filters.minVotes !== undefined && voteCount < filters.minVotes) {
          return false;
        }

        if (filters.maxVotes !== undefined && voteCount > filters.maxVotes) {
          return false;
        }

        return true;
      });
    }

    const mappedPolls = filteredPolls.map((poll: PollWithIncludes) => ({
      id: poll.id,
      title: poll.title,
      description: poll.description,
      visibility: poll.visibility,
      status: poll.status,
      startAt: poll.start_at,
      endAt: poll.end_at,
      expectedVotes: poll.expected_votes,
      totalVotes: poll._count.votes,
      createdAt: poll.created_at,
      creator: {
        id: poll.creator.id,
        name: poll.creator.name,
      },
      categories: poll.categories.map((pc: PollCategoryWithCategory) => ({
        id: pc.category.id,
        name: pc.category.name,
        slug: pc.category.slug,
      })),
    }));

    return {
      polls: mappedPolls,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: filteredPolls.length,
      },
    };
  }

  async countByCreatorId(creatorId: string): Promise<number> {
    return await this.prisma.poll.count({
      where: { creator_id: creatorId },
    });
  }

  async extendEndDate(pollId: string, input: ExtendPollInput): Promise<void> {
    return await this.prisma.poll
      .update({
        where: { id: pollId },
        data: {
          end_at: input.endAt,
          expected_votes: input.expectedVotes,
        },
      })
      .then(() => {});
  }

  async close(pollId: string): Promise<void> {
    return await this.prisma.poll
      .updateMany({
        where: {
          id: pollId,
          status: "OPEN",
        },
        data: {
          status: "CLOSED",
        },
      })
      .then(() => {});
  }

  async create(data: CreatePollData): Promise<Poll> {
    const { poll, options, categoryIds } = data;

    const createdPoll = await this.prisma.poll.create({
      data: {
        title: poll.title,
        description: poll.description,
        image_data: poll.imageData,
        image_type: poll.imageType,
        visibility: poll.visibility,
        status: poll.status,
        start_at: poll.startAt,
        end_at: poll.endAt,
        expected_votes: poll.expectedVotes,
        creator_id: poll.creatorId,
        options: {
          create: options.map((opt) => ({
            text: opt.text,
            image_data: opt.imageData,
            image_type: opt.imageType,
            position: opt.position,
          })),
        },
        categories: {
          create: categoryIds.map((categoryId) => ({
            category_id: categoryId,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return new Poll(
      createdPoll.id,
      createdPoll.title,
      createdPoll.description,
      createdPoll.image_data,
      createdPoll.image_type,
      createdPoll.visibility as PollVisibility,
      createdPoll.status as PollStatus,
      createdPoll.start_at,
      createdPoll.end_at,
      createdPoll.expected_votes,
      createdPoll.creator_id,
      createdPoll.created_at,
      createdPoll.updated_at
    );
  }

  async findById(id: string): Promise<Poll | null> {
    const poll = await this.prisma.poll.findUnique({
      where: { id },
    });

    if (!poll) return null;

    return new Poll(
      poll.id,
      poll.title,
      poll.description,
      poll.image_data,
      poll.image_type,
      poll.visibility as PollVisibility,
      poll.status as PollStatus,
      poll.start_at,
      poll.end_at,
      poll.expected_votes,
      poll.creator_id,
      poll.created_at,
      poll.updated_at
    );
  }

  async findByIdWithOptions(
    id: string
  ): Promise<{ poll: Poll; options: PollOption[] } | null> {
    const pollData = await this.prisma.poll.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { position: "asc" },
        },
      },
    });

    if (!pollData) return null;

    const poll = new Poll(
      pollData.id,
      pollData.title,
      pollData.description,
      pollData.image_data ? Buffer.from(pollData.image_data) : null,
      pollData.image_type,
      pollData.visibility as PollVisibility,
      pollData.status as PollStatus,
      pollData.start_at,
      pollData.end_at,
      pollData.expected_votes,
      pollData.creator_id,
      pollData.created_at,
      pollData.updated_at
    );

    const options = pollData.options.map(
      (opt: PrismaPollOption) =>
        new PollOption(
          opt.id,
          opt.text,
          opt.image_data ? Buffer.from(opt.image_data) : null,
          opt.image_type,
          opt.position,
          opt.poll_id,
          opt.created_at
        )
    );

    return { poll, options };
  }

  async findByCreatorId(
    creatorId: string,
    page: number,
    limit: number
  ): Promise<Poll[]> {
    const polls = await this.prisma.poll.findMany({
      where: { creator_id: creatorId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });

    return polls.map(
      (poll: PrismaPoll) =>
        new Poll(
          poll.id,
          poll.title,
          poll.description,
          poll.image_data ? Buffer.from(poll.image_data) : null,
          poll.image_type,
          poll.visibility as PollVisibility,
          poll.status as PollStatus,
          poll.start_at,
          poll.end_at,
          poll.expected_votes,
          poll.creator_id,
          poll.created_at,
          poll.updated_at
        )
    );
  }
}
