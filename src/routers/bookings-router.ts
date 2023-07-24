import { createBooking, getUserBooking, updateBooking } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { bookingSchema } from "@/schemas/booking-schema";
import { Router } from "express";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getUserBooking)
  .post("/", validateBody(bookingSchema), createBooking)
  .put("/:bookingId", validateBody(bookingSchema), updateBooking);

export { bookingsRouter }