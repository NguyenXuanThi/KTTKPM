import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import axios, { AxiosError } from "axios";

function getUserServiceUrl() {
  return process.env.USER_SERVICE_URL || "http://localhost:8081";
}
function getMovieServiceUrl() {
  return process.env.MOVIE_SERVICE_URL || "http://localhost:8082";
}
function getNotificationServiceUrl() {
  return process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8085";
}
function getPaymentServiceUrl() {
  return process.env.PAYMENT_SERVICE_URL || "http://localhost:8084";
}

@Controller("api")
export class GatewayController {
  // ===== Auth (proxy to User Service) =====

  @Post("auth/register")
  async register(
    @Body() body: { username: string; email: string; password: string },
  ) {
    try {
      const res = await axios.post(
        `${getUserServiceUrl()}/api/users/register`,
        body,
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      throw new HttpException(
        err.response?.data?.message || "Đăng ký thất bại",
        err.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post("auth/login")
  async login(@Body() body: { email: string; password: string }) {
    try {
      const res = await axios.post(
        `${getUserServiceUrl()}/api/users/login`,
        body,
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      throw new HttpException(
        err.response?.data?.message || "Đăng nhập thất bại",
        err.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Get("auth/me")
  async getMe(@Headers("authorization") auth: string) {
    try {
      const res = await axios.get(`${getUserServiceUrl()}/api/users/me`, {
        headers: { Authorization: auth },
      });
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      throw new HttpException(
        err.response?.data?.message || "Token không hợp lệ",
        err.response?.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // ===== Movies (proxy to Movie Service) =====

  @Get("movies")
  async getMovies() {
    try {
      const res = await axios.get(`${getMovieServiceUrl()}/api/movies`);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      throw new HttpException(
        err.response?.data?.message || "Lỗi lấy danh sách phim",
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post("movies")
  async createMovie(@Body() body: Record<string, unknown>) {
    try {
      const res = await axios.post(`${getMovieServiceUrl()}/api/movies`, body);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      throw new HttpException(
        err.response?.data?.message || "Lỗi tạo phim",
        err.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ===== Notifications (proxy to Notification Service) =====

  @Get("notifications/user/:userId")
  async getNotificationsByUser(@Param("userId") userId: string) {
    try {
      const res = await axios.get(
        `${getNotificationServiceUrl()}/api/notifications/user/${userId}`,
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      throw new HttpException(
        err.response?.data?.message || "Lỗi lấy thông báo",
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ===== Payments (proxy to Payment Service) =====

  @Get("payments/booking/:bookingId")
  async getPaymentByBooking(@Param("bookingId") bookingId: string) {
    try {
      const res = await axios.get(
        `${getPaymentServiceUrl()}/api/payments/booking/${bookingId}`,
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      throw new HttpException(
        err.response?.data?.message || "Lỗi lấy thông tin thanh toán",
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
