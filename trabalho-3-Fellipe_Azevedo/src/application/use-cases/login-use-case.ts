import { IUserRepository } from "../../domain/repositories/user-repository";
import { ITokenService } from "../../domain/services/token-service";
import bcrypt from "bcrypt";

export type LoginInput = {
  email: string;
  password: string;
};

export class LoginUseCase {
  constructor(
    private readonly usersRepo: IUserRepository,
    private readonly tokenService: ITokenService
  ) {}

  async execute(data: LoginInput) {
    const user = await this.usersRepo.findByEmail(data.email);
    if (!user) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(data.password, user.password);
    if (!match) throw new Error("Invalid credentials");

    const token = this.tokenService.generate({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
