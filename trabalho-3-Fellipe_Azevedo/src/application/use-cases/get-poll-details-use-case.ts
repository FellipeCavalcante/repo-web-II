import { IPollRepository } from "../../domain/repositories/poll-repository";

export class GetPollDetailsUseCase {
  constructor(private readonly pollRepository: IPollRepository) {}

  async execute(pollId: string): Promise<{ poll: any; options: any[] }> {
    const pollWithOptions = await this.pollRepository.findByIdWithOptions(
      pollId
    );

    if (!pollWithOptions) {
      throw new Error("Poll not found");
    }

    return {
      poll: pollWithOptions.poll,
      options: pollWithOptions.options,
    };
  }
}
