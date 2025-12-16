import bcrypt from "bcrypt";
import { IUserRepository } from "../../domain/repositories/user-repository";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export class RegisterUseCase {
  constructor(private readonly usersRepo: IUserRepository) {}

  async execute(data: RegisterInput) {
    const existingUser = await this.usersRepo.findByEmail(data.email);

    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const newUser = await this.usersRepo.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
    });

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      creteadAt: newUser.createdAt,
    };
  }
}
