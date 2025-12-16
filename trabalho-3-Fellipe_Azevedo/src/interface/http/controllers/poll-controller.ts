import { FastifyRequest, FastifyReply } from "fastify";
import { CreatePollUseCase } from "../../../application/use-cases/create-poll-use-case";
import { z } from "zod";
import { ClosePollsUseCase } from "../../../application/use-cases/close-polls-use-case";
import { GetPollDetailsUseCase } from "../../../application/use-cases/get-poll-details-use-case";
import { ExtendPollsUseCase } from "../../../application/use-cases/extend-polls-use-case";
import { GetPollResultsUseCase } from "../../../application/use-cases/get-polls-result";
import { ListPollsUseCase } from "../../../application/use-cases/list-polls-use-case";
import { GeneratePollQRCodeUseCase } from "../../../application/use-cases/generate-poll-qRCode-use-case";

const createPollSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  status: z.enum(["OPEN", "CLOSED", "DRAFT"]).default("OPEN"),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  expectedVotes: z.number().int().positive().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  options: z
    .array(
      z.object({
        text: z.string().min(1).max(255),
      })
    )
    .min(2, "Poll must have at least 2 options"),
});

const extendPollSchema = z.object({
  endAt: z
    .string()
    .datetime()
    .transform((val) => new Date(val))
    .optional(),
  expectedVotes: z.number().int().positive().optional(),
});

const listPollsSchema = z.object({
  category: z.string().optional(),
  minVotes: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  maxVotes: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  createdFrom: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  createdTo: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  status: z.enum(["OPEN", "CLOSED", "DRAFT"]).optional(),
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => Number(val)),
  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => Number(val)),
});

export class PollController {
  constructor(
    private readonly createPollUseCase: CreatePollUseCase,
    private readonly closePollUseCase: ClosePollsUseCase,
    private readonly getPollDetailsUseCase: GetPollDetailsUseCase,
    private readonly extendPollUseCase: ExtendPollsUseCase,
    private readonly getPollResultsUseCase: GetPollResultsUseCase,
    private readonly listPollsUseCase: ListPollsUseCase,
    private readonly generatePollQRCodeUseCase: GeneratePollQRCodeUseCase
  ) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;

      if (!user || !user.sub) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const body = createPollSchema.parse(request.body);

      const result = await this.createPollUseCase.execute({
        title: body.title,
        description: body.description,
        visibility: body.visibility,
        status: body.status,
        startAt: body.startAt ? new Date(body.startAt) : undefined,
        endAt: body.endAt ? new Date(body.endAt) : undefined,
        expectedVotes: body.expectedVotes,
        creatorId: user.sub,
        categoryIds: body.categoryIds,
        options: body.options,
      });

      return reply.status(201).send(result);
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

  async close(
    request: FastifyRequest<{ Params: { pollId: string } }>,
    reply: FastifyReply
  ) {
    const { pollId } = request.params;

    try {
      await this.closePollUseCase.execute(pollId);
      return reply.status(200).send({ message: "Poll closed successfully" });
    } catch (err: any) {
      return reply.status(400).send({ message: err.message });
    }
  }

  async extend(
    request: FastifyRequest<{ Params: { pollId: string } }>,
    reply: FastifyReply
  ) {
    const { pollId } = request.params;

    const body = extendPollSchema.parse(request.body);

    try {
      await this.extendPollUseCase.execute(pollId, body);
      return reply.status(200).send({ message: "Poll closed successfully" });
    } catch (err: any) {
      return reply.status(400).send({ message: err.message });
    }
  }

  async getDetails(
    request: FastifyRequest<{ Params: { pollId: string } }>,
    reply: FastifyReply
  ) {
    const { pollId } = request.params;

    try {
      const poll = await this.getPollDetailsUseCase.execute(pollId);

      return reply.status(200).send(poll);
    } catch (err: any) {
      return reply.status(400).send({ message: err.message });
    }
  }

  async getResults(
    request: FastifyRequest<{ Params: { pollId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const user = (request as any).user;

      if (!user || !user.sub) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { pollId } = request.params;

      const results = await this.getPollResultsUseCase.execute(
        pollId,
        user.sub
      );

      return reply.status(200).send(results);
    } catch (err: any) {
      if (err.message === "Poll not found") {
        return reply.status(404).send({ message: err.message });
      }

      if (
        err.message ===
        "Only the poll creator can view results of private polls"
      ) {
        return reply.status(403).send({ message: err.message });
      }

      return reply.status(400).send({ message: err.message });
    }
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = listPollsSchema.parse(request.query);

      const result = await this.listPollsUseCase.execute({
        category: query.category,
        minVotes: query.minVotes,
        maxVotes: query.maxVotes,
        createdFrom: query.createdFrom,
        createdTo: query.createdTo,
        status: query.status,
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

  async getQRCode(
    request: FastifyRequest<{ Params: { pollId: string } }>,
    reply: FastifyReply
  ) {
    try {
      const { pollId } = request.params;

      // Pegar base URL do ambiente ou da requisição
      const protocol = request.protocol;
      const host = request.headers.host;
      const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

      const qrCodeDataURL = await this.generatePollQRCodeUseCase.execute({
        pollId,
        baseUrl,
      });

      return reply.status(200).send({
        pollId,
        qrCode: qrCodeDataURL,
        format: "data:image/png;base64",
      });
    } catch (err: any) {
      if (err.message === "Poll not found") {
        return reply.status(404).send({ message: err.message });
      }

      return reply.status(500).send({ message: err.message });
    }
  }
}
