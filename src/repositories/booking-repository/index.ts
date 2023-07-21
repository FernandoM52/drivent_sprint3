import { prisma } from "@/config";
import { createBookingParams } from "@/protocols";

async function create(booking: createBookingParams) {
  return prisma.booking.create({
    data: booking
  });
}

async function findRoomById(roomId: number) {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: { Booking: true }
  });
}

async function decrementRoomCapacity(roomId: number) {
  return prisma.room.update({
    where: { id: roomId },
    data: {
      capacity: {
        decrement: 1
      }
    },
  });
}

async function incrementRoomCapacity(roomId: number) {
  return prisma.room.update({
    where: { id: roomId },
    data: {
      capacity: {
        increment: 1
      }
    },
  });
}

const bookingRepository = {
  create,
  findRoomById,
  decrementRoomCapacity,
  incrementRoomCapacity,

}

export default bookingRepository;