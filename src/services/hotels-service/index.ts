
import { invalidParamsError } from "@/errors/invalid-params-error";
import { TicketStatus } from "@prisma/client";
import { paymentError } from "@/errors/payment-error";
import enrollmentsService from "../enrollments-service";
import ticketsRepository from "@/repositories/tickets-repository";
import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-repository";

async function getHotelsByTicketUser(userId: number) {
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


}

const hotelsService = {
  getHotelsByTicketUser,
  getHotelById
}

export default hotelsService;