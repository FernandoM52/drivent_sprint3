import { prisma } from "@/config";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findUnique({
    where: { id: hotelId },
    include: { Rooms: true }
  });
}

const hotelsRepository = {
  findHotels,
  findRoomsByHotelId
}

export default hotelsRepository;