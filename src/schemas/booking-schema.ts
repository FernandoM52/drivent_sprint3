import Joi from 'joi';
import { BookingBody } from '@/protocols';

export const bookingSchema = Joi.object<BookingBody>({
  roomId: Joi.number().required(),
});