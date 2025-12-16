import { FastifyReply, FastifyRequest } from "fastify";
import { LoginUseCase } from "../../../application/use-cases/login-use-case";
import { RegisterUseCase } from "../../../application/use-cases/register-use-case";
import z from "zod";

const registerUserSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    const body = registerUserSchema.parse(request.body);

    try {
      const result = await this.registerUseCase.execute({
        name: body.name,
        email: body.email,
        password: body.password,
      });

      return reply.status(201).send(result);
    } catch (err: any) {
      return reply.status(401).send({ message: err.message });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const body = loginUserSchema.parse(request.body);

    try {
      const result = await this.loginUseCase.execute({
        email: body.email,
        password: body.password,
      });
      return reply.status(200).send(result);
    } catch (err: any) {
      return reply.status(401).send({ message: err.message });
    }
  }
}
