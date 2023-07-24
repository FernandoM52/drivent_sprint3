import { prisma } from "@/config";
import { createBookingParams } from "@/protocols";

async function create(booking: createBookingParams) {
  return prisma.booking.create({
    data: booking
  });
}

async function countBookingsByRoomId(roomId: number) {
  return prisma.booking.count({
    where: { roomId }
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
  findBookingByUserId
}

export default bookingRepository;