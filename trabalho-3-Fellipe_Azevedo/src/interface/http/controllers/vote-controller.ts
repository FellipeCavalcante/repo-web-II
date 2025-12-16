import { FastifyRequest, FastifyReply } from "fastify";
import { CreateVoteUseCase } from "../../../application/use-cases/create-vote-use-case";
import { z } from "zod";

const createVoteSchema = z.object({
  optionId: z.string().uuid(),
});

export class VoteController {
  constructor(private readonly createVoteUseCase: CreateVoteUseCase) {}

  async vote(
    request: FastifyRequest<{ Params: { pollId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user;

      if (!user || !user.sub) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { pollId } = request.params;
      const body = createVoteSchema.parse(request.body);

      const vote = await this.createVoteUseCase.execute({
        userId: user.sub,
        pollId,
        optionId: body.optionId,
      });

      return reply.status(201).send({
        id: vote.id,
        pollId: vote.pollId,
        optionId: vote.optionId,
        votedAt: vote.votedAt,
      });
    } catch (err: any) {
      if (err.name === "ZodError") {
        return reply.status(400).send({
          message: "Validation error",
          errors: err.errors,
        });
      }

      return reply.status(400).send({ message: err.message });
    }
  }
}
