import { prisma } from "@/config";

async function findHotels() {
  return await prisma.hotel.findMany();
}

async function findRoomsByHotelId() {
}

const hotelsRepository = {
  findHotels,
  findRoomsByHotelId
}

export default hotelsRepository;