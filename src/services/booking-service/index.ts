import { roomCapacityError, forbiddenError, notFoundError, paymentError } from "@/errors";
import { createBookingParams } from "@/protocols";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { TicketStatus } from "@prisma/client";

async function createBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const { isRemote, includesHotel } = ticket.TicketType;
  if (ticket.status !== TicketStatus.PAID || isRemote || !includesHotel) throw paymentError();

  const room = await bookingRepository.findRoomById(roomId);
  if (!room) throw notFoundError();
  if (room.capacity <= 0) throw roomCapacityError();

  const bookingData: createBookingParams = { userId, roomId };
  const booking = await bookingRepository.create(bookingData);
  await bookingRepository.decrementRoomCapacity(roomId);

  return booking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  if (isNaN(bookingId) || bookingId < 0) throw forbiddenError();
}

async function getUserBooking(userId: number) {

}

const bookingService = { createBooking, updateBooking, getUserBooking };

export default bookingService;