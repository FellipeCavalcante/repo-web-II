import { User } from "../entities/user";

export interface IUserRepository {
  create(arg0: {
    name: string;
    email: string;
    password: string;
  }): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
}
