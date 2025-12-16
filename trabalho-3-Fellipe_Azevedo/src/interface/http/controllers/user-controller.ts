import { FastifyRequest, FastifyReply } from "fastify";
import { GetUserCreatedPollsUseCase } from "../../../application/use-cases/get-user-created-polls-use-case";
import { GetUserVotedPollsUseCase } from "../../../application/use-cases/get-user-voted-polls-use-case";
import { z } from "zod";

const paginationSchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("10").transform(Number),
});

export class UserController {
  constructor(
    private readonly getUserCreatedPollsUseCase: GetUserCreatedPollsUseCase,
    private readonly getUserVotedPollsUseCase: GetUserVotedPollsUseCase
  ) {}

  async getCreatedPolls(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;

      if (!user || !user.sub) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const query = paginationSchema.parse(request.query);

      const result = await this.getUserCreatedPollsUseCase.execute({
        userId: user.sub,
        page: query.page,
        limit: query.limit,
      });

      return reply.status(200).send(result);
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

  async getVotedPolls(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;

      if (!user || !user.sub) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const query = paginationSchema.parse(request.query);

      const result = await this.getUserVotedPollsUseCase.execute({
        userId: user.sub,
        page: query.page,
        limit: query.limit,
      });

      return reply.status(200).send(result);
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
