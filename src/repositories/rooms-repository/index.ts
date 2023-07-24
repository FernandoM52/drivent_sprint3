import { prisma } from '@/config';

async function findRoomById(roomId: number) {
  return prisma.room.findFirst({
    where: { id: roomId },
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

async function findAvaibleRoomsByRoomId(roomId: number) {
  return prisma.room.findMany({
    where: { id: roomId },
  });
}

const roomRepository = {
  findRoomById,
  decrementRoomCapacity,
  incrementRoomCapacity,
  findAvaibleRoomsByRoomId
}

export default roomRepository;