import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import bookingService from '@/services/booking-service';
import { BookingBody } from '@/protocols';
import httpStatus from 'http-status';

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body as BookingBody;


  const booking = await bookingService.createBooking(userId, roomId);
  res.send({ bookingId: booking.id });
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { bookingId } = req.params;
  const { roomId } = req.body as BookingBody;

  if (!roomId) return res.sendStatus(httpStatus.UNPROCESSABLE_ENTITY);

  const booking = await bookingService.updateBooking(userId, Number(bookingId), roomId);
  res.send({ bookingId: booking.id });
}

export async function getUserBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const userBooking = await bookingService.getUserBooking(userId);
  res.send(userBooking);
}