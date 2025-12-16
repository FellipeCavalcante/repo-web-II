export class PollOption {
  constructor(
    public readonly id: string,
    public readonly text: string,
    public readonly imageData: Buffer | null,
    public readonly imageType: string | null,
    public readonly position: number,
    public readonly pollId: string,
    public readonly createdAt: Date
  ) {}

  static create(data: {
    text: string;
    imageData?: Buffer;
    imageType?: string;
    position: number;
    pollId?: string;
  }): PollOption {
    if (!data.text || data.text.trim().length === 0) {
      throw new Error("Option text is required");
    }

    if (data.text.length > 255) {
      throw new Error("Option text must be less than 255 characters");
    }

    return new PollOption(
      "",
      data.text.trim(),
      data.imageData || null,
      data.imageType || null,
      data.position,
      data.pollId || "",
      new Date()
    );
  }
}
