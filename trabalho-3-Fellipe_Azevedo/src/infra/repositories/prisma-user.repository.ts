import { PrismaClient } from "@prisma/client";
import { User } from "../../domain/entities/user";
import { IUserRepository } from "../../domain/repositories/user-repository";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}
  create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const createdUser = this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    return createdUser.then((user) => {
      return new User(
        user.id,
        user.email,
        user.name,
        user.password,
        user.created_at
      );
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await this.prisma.user.findUnique({ where: { email } });

    if (!data) return null;

    return new User(
      data.id,
      data.email,
      data.name,
      data.password,
      data.created_at
    );
  }
}
