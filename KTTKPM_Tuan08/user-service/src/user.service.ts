import { Injectable, Inject } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ClientProxy } from "@nestjs/microservices";
import { User } from "./schemas/user.schema";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "movie-ticket-secret-key-2026";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @Inject("RABBITMQ_SERVICE") private readonly client: ClientProxy,
  ) {}

  async register(username: string, email: string, password: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new Error("Email đã tồn tại");
    }

    const user = await this.userModel.create({ username, email, password });

    // Publish event USER_REGISTERED
    this.client.emit("USER_REGISTERED", {
      userId: user._id,
      username: user.username,
      email: user.email,
      timestamp: new Date().toISOString(),
    });
    console.log(
      `[User Service] Published USER_REGISTERED for user: ${user.username}`,
    );

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email, password });
    if (!user) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }
    const { password: _, ...result } = user.toObject();
    const token = jwt.sign(
      { _id: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" },
    );
    return { ...result, token };
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        _id: string;
        username: string;
        email: string;
      };
      const user = await this.userModel
        .findById(decoded._id)
        .select("-password");
      if (!user) throw new Error("User not found");
      return user;
    } catch {
      throw new Error("Token không hợp lệ");
    }
  }

  async getAll() {
    return this.userModel.find().select("-password");
  }
}
