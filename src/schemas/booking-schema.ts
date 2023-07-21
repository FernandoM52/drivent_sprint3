import Joi from 'joi';
import { bookingBody } from '@/protocols';

export const bookingSchema = Joi.object<bookingBody>({
  roomId: Joi.number().required(),
});