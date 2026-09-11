import { User, type UserDocument } from "../models/User";
import { AppError } from "../utils/AppError";
import { signToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";

export interface AuthResult {
  user: UserDocument;
  token: string;
}

export class AuthService {
  async register(name: string, email: string, password: string): Promise<AuthResult> {
    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required.", 400);
    }
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters.", 400);
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    return { user, token: signToken(user.id) };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid email or password.", 401);
    }

    return { user, token: signToken(user.id) };
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId);
  }
}

export const authService = new AuthService();
