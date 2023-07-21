import { createBooking, getUserBooking, updateBooking } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { bookingSchema } from "@/schemas/booking-schema";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", validateBody(bookingSchema), createBooking) //recebe do body o roomId
  .put("/:bookingId", validateBody(bookingSchema), updateBooking); //recebe do body o roomId

export { bookingsRouter }