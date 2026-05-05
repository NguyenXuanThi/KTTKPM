import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { MovieService } from "./movie.service";

interface CreateMovieDto {
  title: string;
  description: string;
  genre: string;
  duration: number;
  price: number;
  totalSeats: number;
  availableSeats: number;
  showtime: string;
}

interface UpdateMovieDto {
  title?: string;
  description?: string;
  genre?: string;
  duration?: number;
  price?: number;
  totalSeats?: number;
  availableSeats?: number;
  showtime?: string;
}

@Controller("api/movies")
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async getAll() {
    const data = await this.movieService.getAll();
    return { success: true, data };
  }

  @Get(":id")
  async getById(@Param("id") id: string) {
    const movie = await this.movieService.getById(id);
    if (!movie) {
      throw new HttpException("Phim không tồn tại", HttpStatus.NOT_FOUND);
    }
    return { success: true, data: movie };
  }

  @Post()
  async create(@Body() body: CreateMovieDto) {
    const movie = await this.movieService.create(body);
    return { success: true, data: movie, message: "Thêm phim thành công" };
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: UpdateMovieDto) {
    const movie = await this.movieService.update(id, body);
    if (!movie) {
      throw new HttpException("Phim không tồn tại", HttpStatus.NOT_FOUND);
    }
    return { success: true, data: movie, message: "Cập nhật phim thành công" };
  }
}
