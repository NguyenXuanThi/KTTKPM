import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly USER_SERVICE_URL: string;
  private readonly TOUR_SERVICE_URL: string;
  private readonly BOOKING_SERVICE_URL: string;
  private readonly PAYMENT_SERVICE_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.USER_SERVICE_URL = this.configService.get<string>('USER_SERVICE_URL') || 'http://127.0.0.1:8081/users';
    this.TOUR_SERVICE_URL = this.configService.get<string>('TOUR_SERVICE_URL') || 'http://127.0.0.1:8082/tours';
    this.BOOKING_SERVICE_URL = this.configService.get<string>('BOOKING_SERVICE_URL') || 'http://127.0.0.1:8083/bookings';
    this.PAYMENT_SERVICE_URL = this.configService.get<string>('PAYMENT_SERVICE_URL') || 'http://127.0.0.1:8084/payments';
  }

  async login(body: any) {
    try {
      const response = await firstValueFrom(this.httpService.post(`${this.USER_SERVICE_URL}/login`, body));
      return response.data;
    } catch (error) {
      throw new HttpException('User service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async register(body: any) {
    try {
      const response = await firstValueFrom(this.httpService.post(`${this.USER_SERVICE_URL}/register`, body));
      return response.data;
    } catch (error) {
      throw new HttpException('User service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getTours() {
    try {
      const response = await firstValueFrom(this.httpService.get(this.TOUR_SERVICE_URL));
      return response.data;
    } catch (error) {
      throw new HttpException('Tour service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getTourById(id: string) {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.TOUR_SERVICE_URL}/${id}`));
      return response.data;
    } catch (error) {
      throw new HttpException('Tour service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async bookTour(userId: string, tourId: string) {
    try {
      const userRes = await firstValueFrom(this.httpService.get(`${this.USER_SERVICE_URL}/${userId}`));
      if (!userRes.data.success) return { success: false, message: 'User validation failed' };

      const tourRes = await firstValueFrom(this.httpService.get(`${this.TOUR_SERVICE_URL}/${tourId}`));
      if (!tourRes.data.success) return { success: false, message: 'Tour validation failed' };
      const price = tourRes.data.data.price;

      if (userRes.data.data.balance < price) {
        return { success: false, message: 'Insufficient balance to book this tour' };
      }

      const bookingRes = await firstValueFrom(this.httpService.post(this.BOOKING_SERVICE_URL, { userId, tourId }));
      if (!bookingRes.data.success) return { success: false, message: 'Booking creation failed' };
      const bookingId = bookingRes.data.data.id;

      let paymentRes;
      for (let retry = 0; retry < 5; retry++) {
        paymentRes = await firstValueFrom(this.httpService.post(this.PAYMENT_SERVICE_URL, { bookingId, amount: price }));
        if (paymentRes.data.success) break;
      }
      if (!paymentRes.data.success) return { success: false, message: 'Payment failed after 5 retries: ' + paymentRes.data.message };

      await firstValueFrom(this.httpService.post(`${this.USER_SERVICE_URL}/${userId}/deduct`, { amount: price }));

      return {
        success: true,
        message: 'Tour booked and paid successfully!',
        data: {
          bookingId,
          tour: tourRes.data.data.name,
          amountPaid: price,
          transactionId: paymentRes.data.transactionId
        }
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Orchestration failed due to internal error', error: error.message };
    }
  }

  async getNotifications(id: string) {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.USER_SERVICE_URL}/${id}`));
      return response.data;
    } catch (error) {
      throw new HttpException('User service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async markNotificationRead(id: string, notifId: string) {
    try {
      const response = await firstValueFrom(this.httpService.put(`${this.USER_SERVICE_URL}/${id}/notifications/${notifId}/read`));
      return response.data;
    } catch (error) {
      throw new HttpException('User service unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async checkoutCart(userId: string, tourIds: string[]) {
    try {
      const userRes = await firstValueFrom(this.httpService.get(`${this.USER_SERVICE_URL}/${userId}`));
      if (!userRes.data.success) return { success: false, message: 'User validation failed' };

      let totalPrice = 0;
      const tours: any[] = [];
      for (const tourId of tourIds) {
        const tourRes = await firstValueFrom(this.httpService.get(`${this.TOUR_SERVICE_URL}/${tourId}`));
        if (!tourRes.data.success) return { success: false, message: `Tour ${tourId} validation failed` };
        totalPrice += tourRes.data.data.price;
        tours.push(tourRes.data.data);
      }

      if (userRes.data.data.balance < totalPrice) {
        return { success: false, message: 'Insufficient balance to checkout cart' };
      }

      const transactions: any[] = [];
      for (const tour of tours) {
        const bookingRes = await firstValueFrom(this.httpService.post(this.BOOKING_SERVICE_URL, { userId, tourId: tour.id }));
        if (!bookingRes.data.success) throw new Error('Booking creation failed');
        const bookingId = bookingRes.data.data.id;

        let paymentRes;
        for (let retry = 0; retry < 5; retry++) {
          paymentRes = await firstValueFrom(this.httpService.post(this.PAYMENT_SERVICE_URL, { bookingId, amount: tour.price }));
          if (paymentRes.data.success) break;
        }
        if (!paymentRes.data.success) throw new Error('Payment failed after 5 retries: ' + paymentRes.data.message);
        transactions.push(paymentRes.data.transactionId);
      }

      await firstValueFrom(this.httpService.post(`${this.USER_SERVICE_URL}/${userId}/deduct`, { amount: totalPrice }));

      const notifMsg = `You successfully booked ${tours.length} tours for $${totalPrice}.`;
      await firstValueFrom(this.httpService.post(`${this.USER_SERVICE_URL}/${userId}/notifications`, { message: notifMsg }));

      return {
        success: true,
        message: 'Cart checkout successful!',
        data: {
          totalPaid: totalPrice,
          toursBooked: tours.length,
          transactions
        }
      };
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Cart checkout failed: ' + error.message };
    }
  }
}
