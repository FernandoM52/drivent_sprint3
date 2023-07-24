import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { jest } from "@jest/globals";
import { buildRoomReturn, buildTicketReturn, buildUserEnrollmentReturn } from "../factories";
import bookingService from "@/services/booking-service";
import { Enrollment, TicketStatus } from "@prisma/client";
import roomRepository from "@/repositories/rooms-repository";
import bookingRepository from "@/repositories/booking-repository";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Create booking tests", () => {
  it("should throw notFoundError if user has no enrollment", async () => {
    jest.spyOn(enrollmentRepository, "findUserEnrollment").mockResolvedValue(null);

    const promise = bookingService.createBooking(1, 1);
    expect(enrollmentRepository.findUserEnrollment).toBeCalledTimes(1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });

  it("should throw notFoundError if user does not have ticket", async () => {
    const mockEnrollment: Enrollment = buildUserEnrollmentReturn();

    jest.spyOn(enrollmentRepository, "findUserEnrollment").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(null);

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });

  it("should throw paymentError if user ticket has not been paid", async () => {
    const mockEnrollment: Enrollment = buildUserEnrollmentReturn();
    const ticket = buildTicketReturn(TicketStatus.RESERVED, false, true);

    jest.spyOn(enrollmentRepository, "findUserEnrollment").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(ticket);

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'PaymentError',
      message: 'You have not paid for your ticket yet',
    });
  });

  it("should throw paymentError if user ticket type is remote", async () => {
    const mockEnrollment: Enrollment = buildUserEnrollmentReturn();
    const ticket = buildTicketReturn(TicketStatus.PAID, true, false);

    jest.spyOn(enrollmentRepository, "findUserEnrollment").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(ticket);

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'PaymentError',
      message: 'You have not paid for your ticket yet',
    });
  });

  it("should throw paymentError if user ticket does not include hotel", async () => {
    const mockEnrollment: Enrollment = buildUserEnrollmentReturn();
    const ticket = buildTicketReturn(TicketStatus.PAID, false, false);

    jest.spyOn(enrollmentRepository, "findUserEnrollment").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(ticket);

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'PaymentError',
      message: 'You have not paid for your ticket yet',
    });
  });

  it("should throw notFoundError if room does not exist", async () => {
    const mockEnrollment: Enrollment = buildUserEnrollmentReturn();
    const ticket = buildTicketReturn(TicketStatus.PAID, false, true);

    jest.spyOn(enrollmentRepository, "findUserEnrollment").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(ticket);
    jest.spyOn(roomRepository, "findRoomById").mockResolvedValue(null);

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });

  it("should throw roomCapacityError if room has no vacancies", async () => {
    const mockEnrollment: Enrollment = buildUserEnrollmentReturn();
    const ticket = buildTicketReturn(TicketStatus.PAID, false, true);
    const room = buildRoomReturn();

    jest.spyOn(enrollmentRepository, "findUserEnrollment").mockResolvedValue(mockEnrollment);
    jest.spyOn(ticketsRepository, "findTicketByEnrollmentId").mockResolvedValue(ticket);
    jest.spyOn(roomRepository, "findRoomById").mockResolvedValue(room);
    jest.spyOn(bookingRepository, "countBookingsByRoomId").mockResolvedValue(4);

    const promise = bookingService.createBooking(1, 1);
    expect(promise).rejects.toEqual({
      name: 'roomCapacityError',
      message: 'Room is full',
    });
  });
});

describe("Get booking tests", () => {
  it("should throw notFoundError if user has no booking", async () => {
    jest.spyOn(bookingRepository, "findBookingByUserId").mockResolvedValue(null);

    const promise = bookingService.getUserBooking(1);
    expect(bookingRepository.findBookingByUserId).toBeCalledTimes(1);
    expect(promise).rejects.toEqual({
      name: 'NotFoundError',
      message: 'No result for this search!',
    });
  });
});