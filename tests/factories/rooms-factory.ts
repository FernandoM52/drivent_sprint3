import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createRooms(hotelId: number, capacity?: number) {
  return prisma.room.create({
    data: {
      name: faker.commerce.department(),
      capacity: capacity ?? faker.datatype.number(),
      hotelId,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.future(),
    }
  });
}

export function buildRoomReturn() {
  return {
    id: 1,
    name: faker.name.findName(),
    capacity: 4,
    hotelId: 1,
    createdAt: new Date(),
    updatedAt: faker.date.future()
  }
}