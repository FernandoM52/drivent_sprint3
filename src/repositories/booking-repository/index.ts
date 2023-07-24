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

const bookingRepository = {
  create,
  countBookingsByRoomId

}

export default bookingRepository;