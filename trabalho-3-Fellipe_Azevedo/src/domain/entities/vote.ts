export class Vote {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly pollId: string,
    public readonly optionId: string,
    public readonly votedAt: Date
  ) {}

  static create(data: {
    userId: string;
    pollId: string;
    optionId: string;
  }): Vote {
    if (!data.userId || data.userId.trim().length === 0) {
      throw new Error("User ID is required");
    }

    if (!data.pollId || data.pollId.trim().length === 0) {
      throw new Error("Poll ID is required");
    }

    if (!data.optionId || data.optionId.trim().length === 0) {
      throw new Error("Option ID is required");
    }

    return new Vote("", data.userId, data.pollId, data.optionId, new Date());
  }
}
