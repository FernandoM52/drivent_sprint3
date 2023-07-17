import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const hotels = await hotelsService.getHotelsByTicketUser(userId);
  res.send(hotels);
}

export async function getHotelById(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;
  const { userId } = req;

  const hotel = await hotelsService.getHotelById(userId, Number(hotelId));
  res.send(hotel);
}