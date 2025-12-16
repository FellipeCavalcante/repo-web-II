import "dotenv/config";
import Fastify from "fastify";
import { PrismaUserRepository } from "../infra/repositories/prisma-user.repository";
import { JwtTokenService } from "../infra/auth/jwt-token-service";
import { LoginUseCase } from "../application/use-cases/login-use-case";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { AuthMiddleware } from "../interface/http/middlewares/auth-middleware";
import { notFoundHandler } from "../infra/handlers/not-found-handler";
import { AuthController } from "../interface/http/controllers/auth-controller";
import { RegisterUseCase } from "../application/use-cases/register-use-case";
import { PollController } from "../interface/http/controllers/poll-controller";
import { CreatePollUseCase } from "../application/use-cases/create-poll-use-case";
import { PrismaPollRepository } from "../infra/repositories/prisma-poll.repository";
import { ClosePollsUseCase } from "../application/use-cases/close-polls-use-case";
import { GetPollDetailsUseCase } from "../application/use-cases/get-poll-details-use-case";
import { ExtendPollsUseCase } from "../application/use-cases/extend-polls-use-case";
import { PrismaVoteRepository } from "../infra/repositories/prisma-vote.repository";
import { CreateVoteUseCase } from "../application/use-cases/create-vote-use-case";
import { VoteController } from "../interface/http/controllers/vote-controller";
import { GetPollResultsUseCase } from "../application/use-cases/get-polls-result";
import { GetUserCreatedPollsUseCase } from "../application/use-cases/get-user-created-polls-use-case";
import { GetUserVotedPollsUseCase } from "../application/use-cases/get-user-voted-polls-use-case";
import { UserController } from "../interface/http/controllers/user-controller";
import { ListPollsUseCase } from "../application/use-cases/list-polls-use-case";
import { GeneratePollQRCodeUseCase } from "../application/use-cases/generate-poll-qRCode-use-case";

const app = Fastify();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não está definido nas variáveis de ambiente");
}

// Prisma Config
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// dependencies
const usersRepo = new PrismaUserRepository(prisma);
const pollsRepo = new PrismaPollRepository(prisma);
const tokenService = new JwtTokenService(process.env.JWT_SECRET);

const loginUseCase = new LoginUseCase(usersRepo, tokenService);
const registerUseCase = new RegisterUseCase(usersRepo);
const voteRepo = new PrismaVoteRepository(prisma);

const createPollUseCase = new CreatePollUseCase(pollsRepo);
const closePollUseCase = new ClosePollsUseCase(pollsRepo);
const getPollDetailsUseCase = new GetPollDetailsUseCase(pollsRepo);
const extendPollUseCase = new ExtendPollsUseCase(pollsRepo);
const getPollResultsUseCase = new GetPollResultsUseCase(pollsRepo, voteRepo);

const listPollsUseCase = new ListPollsUseCase(pollsRepo);

const createVoteUseCase = new CreateVoteUseCase(voteRepo, pollsRepo);

const generatePollQRCodeUseCase = new GeneratePollQRCodeUseCase(pollsRepo);

const getUserCreatedPollsUseCase = new GetUserCreatedPollsUseCase(pollsRepo);
const getUserVotedPollsUseCase = new GetUserVotedPollsUseCase(
  voteRepo,
  pollsRepo
);

const voteController = new VoteController(createVoteUseCase);
const authController = new AuthController(registerUseCase, loginUseCase);
const pollController = new PollController(
  createPollUseCase,
  closePollUseCase,
  getPollDetailsUseCase,
  extendPollUseCase,
  getPollResultsUseCase,
  listPollsUseCase,
  generatePollQRCodeUseCase
);
const userController = new UserController(
  getUserCreatedPollsUseCase,
  getUserVotedPollsUseCase
);

// Middleware
const authMiddleware = new AuthMiddleware(tokenService);

// Handlers
app.setNotFoundHandler(notFoundHandler);

// Health Check Routes
app.get("/", async (req, reply) => {
  return reply.send({
    statusCode: 200,
    message: "OK",
    timestamp: new Date().toISOString(),
  });
});
app.get(
  "/me",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    const user = (req as any).user;

    return reply.status(200).send({
      message: "Authenticated user",
      user: {
        id: user.sub,
        email: user.email,
        name: user.name,
      },
    });
  }
);

// qrCode route
app.get<{ Params: { pollId: string } }>(
  "/api/v1/polls/:pollId/qrcode",
  async (req, reply) => {
    return pollController.getQRCode(req, reply);
  }
);

// Auth Routes
app.post("/api/v1/login", async (req, reply) => {
  return authController.login(req, reply);
});
app.post("/api/v1/register", async (req, reply) => {
  return authController.register(req, reply);
});

// Poll Routes
app.post(
  "/api/v1/polls",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return pollController.create(req, reply);
  }
);
app.post<{ Params: { pollId: string } }>(
  "/api/v1/polls/:pollId/close",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return pollController.close(req, reply);
  }
);
app.get<{ Params: { pollId: string } }>(
  "/api/v1/polls/:pollId",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return pollController.getDetails(req, reply);
  }
);
app.patch<{ Params: { pollId: string } }>(
  "/api/v1/polls/:pollId/extend",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return pollController.extend(req, reply);
  }
);
app.post<{ Params: { pollId: string } }>(
  "/api/v1/polls/:pollId/votes",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return voteController.vote(req, reply);
  }
);
app.get<{ Params: { pollId: string } }>(
  "/api/v1/polls/:pollId/results",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return pollController.getResults(req, reply);
  }
);
app.get("/api/v1/polls", async (req, reply) => {
  return pollController.list(req, reply);
});

app.addHook("onClose", async () => {
  await prisma.$disconnect();
  await pool.end();
});

// User Routes
app.get(
  "/api/v1/me/polls/created",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return userController.getCreatedPolls(req, reply);
  }
);
app.get(
  "/api/v1/me/polls/voted",
  {
    preHandler: async (req, reply) => {
      await authMiddleware.handle(req, reply);
    },
  },
  async (req, reply) => {
    return userController.getVotedPolls(req, reply);
  }
);

app
  .listen({ port: 3333 })
  .then(() => {
    console.log("🔥 Server running at http://localhost:3333");
  })
  .catch((err) => {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  });
