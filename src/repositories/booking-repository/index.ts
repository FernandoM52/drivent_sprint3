import { prisma } from "@/config";
import { createOrUpdateBookingParams } from "@/protocols";

async function create(booking: createOrUpdateBookingParams) {
  return prisma.booking.create({
    data: booking
  });
}

async function countBookingsByRoomId(roomId: number) {
  return prisma.booking.count({
    where: { roomId }
  });
}

async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    data: {
      roomId,
      updatedAt: new Date(Date.now())
    },
    where: { id: bookingId }
  });
}

async function findBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    select: {
      id: true,
      Room: true
    },
    where: { userId }
  });
}
const bookingRepository = {
  create,
  countBookingsByRoomId,
  findBookingByUserId,
  updateBooking
}

export default bookingRepository;