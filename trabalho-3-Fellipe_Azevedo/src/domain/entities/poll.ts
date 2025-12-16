export enum PollVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export enum PollStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  DRAFT = "DRAFT",
}

export class Poll {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly imageData: Buffer | null,
    public readonly imageType: string | null,
    public readonly visibility: PollVisibility,
    public readonly status: PollStatus,
    public readonly startAt: Date,
    public readonly endAt: Date | null,
    public readonly expectedVotes: number | null,
    public readonly creatorId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: {
    title: string;
    description?: string;
    imageData?: Buffer;
    imageType?: string;
    visibility?: PollVisibility;
    status?: PollStatus;
    startAt?: Date;
    endAt?: Date;
    expectedVotes?: number;
    creatorId: string;
  }): Poll {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Poll title is required");
    }

    if (data.title.length > 255) {
      throw new Error("Poll title must be less than 255 characters");
    }

    if (!data.endAt && !data.expectedVotes) {
      throw new Error("Poll must have either endAt or expectedVotes");
    }

    if (data.endAt && data.endAt < new Date()) {
      throw new Error("Poll endAt cannot be in the past");
    }

    if (data.expectedVotes && data.expectedVotes < 1) {
      throw new Error("Expected votes must be at least 1");
    }

    const now = new Date();

    return new Poll(
      "",
      data.title.trim(),
      data.description?.trim() || null,
      data.imageData || null,
      data.imageType || null,
      data.visibility || PollVisibility.PUBLIC,
      data.status || PollStatus.OPEN,
      data.startAt || now,
      data.endAt || null,
      data.expectedVotes || null,
      data.creatorId,
      now,
      now
    );
  }
}
