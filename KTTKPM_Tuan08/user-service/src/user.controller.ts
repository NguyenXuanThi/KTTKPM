import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { UserService } from "./user.service";

interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Controller("api/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("register")
  async register(@Body() body: RegisterDto) {
    try {
      const user = await this.userService.register(
        body.username,
        body.email,
        body.password,
      );
      return { success: true, data: user, message: "Đăng ký thành công" };
    } catch (error) {
      throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post("login")
  async login(@Body() body: LoginDto) {
    try {
      const result = await this.userService.login(body.email, body.password);
      return { success: true, data: result, message: "Đăng nhập thành công" };
    } catch (error) {
      throw new HttpException(
        (error as Error).message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get("me")
  async getMe(@Headers("authorization") auth: string) {
    try {
      const token = auth?.replace("Bearer ", "");
      if (!token) throw new Error("Token required");
      const user = await this.userService.verifyToken(token);
      return { success: true, data: user };
    } catch (error) {
      throw new HttpException(
        (error as Error).message,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get()
  async getAll() {
    return { success: true, data: await this.userService.getAll() };
  }
}
