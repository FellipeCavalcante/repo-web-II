import { FastifyRequest, FastifyReply } from "fastify";
import { JwtTokenService } from "../../../infra/auth/jwt-token-service";

export class AuthMiddleware {
  constructor(private readonly tokenService: JwtTokenService) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.status(401).send({ message: "Token not provided" });
      }

      const [, token] = authHeader.split(" ");

      if (!token) {
        return reply.status(401).send({ message: "Token malformed" });
      }

      const decoded = this.tokenService.verify(token);

      (request as any).user = decoded;

      return;
    } catch (error) {
      return reply.status(401).send({ message: "Invalid token" });
    }
  }
}
