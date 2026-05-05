import { Module, OnModuleInit } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MovieController } from "./movie.controller";
import { MovieService } from "./movie.service";
import { Movie, MovieSchema } from "./schemas/movie.schema";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({ uri: process.env.MONGODB_URI }),
    }),
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
  ],
  controllers: [MovieController],
  providers: [MovieService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly movieService: MovieService) {}

  async onModuleInit() {
    await this.movieService.seedMovies();
  }
}
