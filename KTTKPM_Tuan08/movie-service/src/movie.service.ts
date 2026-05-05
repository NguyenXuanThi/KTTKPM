import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Movie } from "./schemas/movie.schema";

interface CreateMovieData {
  title: string;
  description: string;
  genre: string;
  duration: number;
  price: number;
  totalSeats: number;
  showtime: string;
}

interface UpdateMovieData {
  title?: string;
  description?: string;
  genre?: string;
  duration?: number;
  price?: number;
  totalSeats?: number;
  availableSeats?: number;
  showtime?: string;
}

@Injectable()
export class MovieService {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  async seedMovies() {
    const count = await this.movieModel.countDocuments();
    if (count === 0) {
      await this.movieModel.insertMany([
        {
          title: "Avengers: Endgame",
          description: "Siêu anh hùng cứu thế giới",
          genre: "Action",
          duration: 180,
          price: 75000,
          totalSeats: 100,
          availableSeats: 100,
          showtime: "2026-04-15 19:00",
        },
        {
          title: "Spider-Man: No Way Home",
          description: "Người nhện đa vũ trụ",
          genre: "Action",
          duration: 150,
          price: 85000,
          totalSeats: 80,
          availableSeats: 80,
          showtime: "2026-04-15 21:00",
        },
        {
          title: "Doraemon: Stand By Me",
          description: "Phim hoạt hình cảm động",
          genre: "Animation",
          duration: 120,
          price: 65000,
          totalSeats: 120,
          availableSeats: 120,
          showtime: "2026-04-16 14:00",
        },
      ]);
      console.log("[Movie Service] Seeded 3 movies into database");
    }
  }

  async getAll() {
    return this.movieModel.find();
  }

  async getById(id: string) {
    return this.movieModel.findById(id);
  }

  async create(data: CreateMovieData) {
    return this.movieModel.create({ ...data, availableSeats: data.totalSeats });
  }

  async update(id: string, data: UpdateMovieData) {
    return this.movieModel.findByIdAndUpdate(id, data, { new: true });
  }

  async updateSeats(id: string, seatsToBook: number): Promise<boolean> {
    const result = await this.movieModel.findOneAndUpdate(
      { _id: id, availableSeats: { $gte: seatsToBook } },
      { $inc: { availableSeats: -seatsToBook } },
      { new: true },
    );
    return !!result;
  }

  async releaseSeats(id: string, seats: number) {
    await this.movieModel.findByIdAndUpdate(id, {
      $inc: { availableSeats: seats },
    });
  }
}
