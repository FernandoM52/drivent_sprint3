import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createRooms(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.commerce.department(),
      capacity: faker.datatype.number(),
      hotelId,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.future(),
    }
  })
}

export async function findRoomsByHotelId(hotelId: number) {
  return prisma.room.findMany({
    where: { hotelId }
  });
}