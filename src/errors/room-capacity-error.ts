import { ApplicationError } from '@/protocols';

export function roomCapacityError(): ApplicationError {
  return {
    name: 'roomCapacityError',
    message: 'Room is full',
  };
}
