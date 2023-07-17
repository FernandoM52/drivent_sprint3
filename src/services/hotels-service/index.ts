
import { notFoundError } from "@/errors";
import { paymentError } from "@/errors/payment-error";
import { invalidParamsError } from "@/errors/invalid-params-error";
import { TicketStatus } from "@prisma/client";
import enrollmentsService from "../enrollments-service";
import ticketsRepository from "@/repositories/tickets-repository";
import hotelsRepository from "@/repositories/hotels-repository";

async function getHotels(userId: number) {
  const enrollment = await enrollmentsService.getEnrollmentByUserId(userId);

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();

  const { isRemote, includesHotel } = ticket.TicketType;
  if (ticket.status !== TicketStatus.PAID || isRemote || !includesHotel) throw paymentError();

  const hotels = await hotelsRepository.findHotels();
  if (!hotels || hotels.length === 0) throw notFoundError();

  return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
  if (isNaN(hotelId) || hotelId < 0) throw invalidParamsError();

  await getHotels(userId);

  const hotelWithRooms = await hotelsRepository.findRoomsByHotelId(hotelId);
  if (!hotelWithRooms) throw notFoundError();

  const { id, name, image, createdAt, updatedAt, Rooms } = hotelWithRooms;
  return {
    id,
    name,
    image,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    Rooms: Rooms.length > 0
      ? Rooms.map((room) => {
        return {
          ...room,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        };
      })
      : []
  };
}

const hotelsService = {
  getHotels,
  getHotelById
}

export default hotelsService;