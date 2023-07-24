import { roomCapacityError, forbiddenError, notFoundError, paymentError } from "@/errors";
import { createOrUpdateBookingParams } from "@/protocols";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/rooms-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { TicketStatus } from "@prisma/client";

async function createBooking(userId: number, roomId: number) {
  await validateBooking(userId, roomId);

  const bookingData: createOrUpdateBookingParams = { userId, roomId };
  const booking = await bookingRepository.create(bookingData);
  await roomRepository.decrementRoomCapacity(roomId);

  return booking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  if (isNaN(bookingId) || bookingId < 0) throw forbiddenError();

  const userBooking = await bookingRepository.findBookingByUserId(userId);
  if (!userBooking) throw forbiddenError();

  await validateBooking(userId, roomId);
  const booking = await bookingRepository.updateBooking(bookingId, roomId);

  await roomRepository.incrementRoomCapacity(userBooking.Room.id);
  await roomRepository.decrementRoomCapacity(roomId);

  return booking;
}

async function getUserBooking(userId: number) {
  const userBooking = await bookingRepository.findBookingByUserId(userId);
  if (!userBooking) throw notFoundError();

  return userBooking;
}

async function validateBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findUserEnrollment(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const { isRemote, includesHotel } = ticket.TicketType;
  if (ticket.status !== TicketStatus.PAID || isRemote || !includesHotel) throw forbiddenError();

  const room = await roomRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const bookings = await bookingRepository.countBookingsByRoomId(roomId);
  if (bookings >= room.capacity) throw roomCapacityError();
}

const bookingService = { createBooking, updateBooking, getUserBooking };

export default bookingService;