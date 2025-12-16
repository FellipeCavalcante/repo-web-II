import jwt from "jsonwebtoken";
import { ITokenService } from "../../domain/services/token-service";

export class JwtTokenService implements ITokenService {
  constructor(private readonly secret: string) {}

  generate(payload: Record<string, any>): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: "7d",
    });
  }

  verify(token: string): Record<string, any> {
    try {
      return jwt.verify(token, this.secret) as Record<string, any>;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}
