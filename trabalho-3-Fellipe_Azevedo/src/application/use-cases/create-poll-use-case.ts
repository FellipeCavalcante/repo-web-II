import { Poll, PollStatus, PollVisibility } from "../../domain/entities/poll";
import { IPollRepository } from "../../domain/repositories/poll-repository";
import { PollOption } from "../../domain/entities/poll-option";

export type CreatePollInput = {
  title: string;
  description?: string;
  imageData?: Buffer;
  imageType?: string;
  visibility?: "PUBLIC" | "PRIVATE";
  status?: "OPEN" | "CLOSED" | "DRAFT";
  startAt?: Date;
  endAt?: Date;
  expectedVotes?: number;
  creatorId: string;
  categoryIds?: string[];
  options: Array<{
    text: string;
    imageData?: Buffer;
    imageType?: string;
  }>;
};

export type CreatePollOutput = {
  id: string;
  title: string;
  description: string | null;
  visibility: string;
  status: string;
  startAt: Date;
  endAt: Date | null;
  expectedVotes: number | null;
  createdAt: Date;
  options: Array<{
    id: string;
    text: string;
    position: number;
  }>;
};

export class CreatePollUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(input: CreatePollInput): Promise<CreatePollOutput> {
    if (!input.options || input.options.length < 2) {
      throw new Error("Poll must have at least 2 options");
    }

    const poll = Poll.create({
      title: input.title,
      description: input.description,
      imageData: input.imageData,
      imageType: input.imageType,
      visibility: input.visibility as PollVisibility,
      status: input.status as PollStatus,
      startAt: input.startAt,
      endAt: input.endAt,
      expectedVotes: input.expectedVotes,
      creatorId: input.creatorId,
    });

    const options = input.options.map((opt, index) =>
      PollOption.create({
        text: opt.text,
        imageData: opt.imageData,
        imageType: opt.imageType,
        position: index,
      })
    );

    const createdPoll = await this.pollRepository.create({
      poll,
      options,
      categoryIds: input.categoryIds || [],
    });

    const pollWithOptions = await this.pollRepository.findByIdWithOptions(
      createdPoll.id
    );

    if (!pollWithOptions) {
      throw new Error("Failed to retrieve created poll");
    }

    return {
      id: pollWithOptions.poll.id,
      title: pollWithOptions.poll.title,
      description: pollWithOptions.poll.description,
      visibility: pollWithOptions.poll.visibility,
      status: pollWithOptions.poll.status,
      startAt: pollWithOptions.poll.startAt,
      endAt: pollWithOptions.poll.endAt,
      expectedVotes: pollWithOptions.poll.expectedVotes,
      createdAt: pollWithOptions.poll.createdAt,
      options: pollWithOptions.options.map((opt) => ({
        id: opt.id,
        text: opt.text,
        position: opt.position,
      })),
    };
  }
}
