import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

export async function updateBooking(bookingId: number, roomId: number) {
  return prisma.booking.update({
    data: {
      roomId,
      updatedAt: faker.date.future()
    },
    where: { id: bookingId }
  });
}