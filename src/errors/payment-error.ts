import { ApplicationError } from '@/protocols';

export function paymentError(): ApplicationError {
  return {
    name: 'PaymentError',
    message: 'You have not paid for your ticket yet',
  };
}
