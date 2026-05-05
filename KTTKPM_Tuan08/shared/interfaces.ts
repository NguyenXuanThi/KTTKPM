export interface UserRegisteredEvent {
  userId: string;
  username: string;
  email: string;
  timestamp: string;
}

export interface BookingCreatedEvent {
  bookingId: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  seats: number;
  totalPrice: number;
  userEmail: string;
  timestamp: string;
}

export interface PaymentCompletedEvent {
  bookingId: string;
  paymentId: string;
  userId: string;
  movieTitle: string;
  seats: number;
  amount: number;
  userEmail: string;
  timestamp: string;
}

export interface BookingFailedEvent {
  bookingId: string;
  paymentId: string;
  userId: string;
  movieTitle: string;
  userEmail: string;
  reason: string;
  timestamp: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateBookingDto {
  userId: string;
  movieId: string;
  movieTitle: string;
  seats: number;
  price: number;
  userEmail: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
