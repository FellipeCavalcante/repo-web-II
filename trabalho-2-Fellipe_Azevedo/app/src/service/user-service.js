import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export class UserService {
  async create(name, email, password, password2) {
    try {
      if (!name || !email || !password) {
        throw new Error("Todos os campos são obrigatórios");
      }

      if (password !== password2) {
        throw new Error("As senhas não coincidem");
      }

      if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      const emailAlreadyExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailAlreadyExists) {
        throw new Error("Email já cadastrado");
      }

      const passwordHashed = bcrypt.hashSync(password, 8);

      await prisma.user.create({
        data: {
          name,
          email,
          password: passwordHashed,
        },
      });

      return { success: true };
    } catch (error) {
      throw new Error("Erro ao criar usuário: " + error.message);
    }
  }

  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error("Email e senha são obrigatórios");
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("Credenciais inválidas");
      }

      const passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) {
        throw new Error("Credenciais inválidas");
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error("Erro ao fazer login: " + error.message);
    }
  }
}
