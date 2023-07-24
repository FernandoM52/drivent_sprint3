import app, { init } from "@/app";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import {
  createBooking,
  createEnrollmentWithAddress,
  createHotels,
  createRooms,
  createTicket,
  createTicketTypeWithHotel,
  createUser,
  updateBooking
} from "../factories";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from 'jsonwebtoken';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('POST /booking', () => {
  describe('When token is valid', () => {
    it('should respond with status 200 with booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotels();
      const room = await createRooms(hotel.id);

      const { status, body } = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({
        bookingId: expect.any(Number)
      });
    });

    it('should respond with status 400 if body is invalid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);
      await createBooking(user.id, room.id);

      const fakeBody = { fakeProperty: faker.datatype.number() };

      const { status } = await server.post(`/booking`).set('Authorization', `Bearer ${token}`).send(fakeBody);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });
  });

  describe('When token is invalid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const { status } = await server.post(`/booking`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const { status } = await server.post(`/booking`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const { status } = await server.post(`/booking`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  })
});

describe('GET /booking', () => {
  describe('When token is valid', () => {
    it('should respond with status 200 with booking id and room data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const { status, body } = await server.get('/booking').set('Authorization', `Bearer ${token}`);
      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual(
        expect.objectContaining({
          id: booking.id,
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
            createdAt: room.createdAt.toISOString(),
            updatedAt: room.updatedAt.toISOString()
          }
        })
      );
    });
  });

  describe('When token is invalid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const id = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.get(`/booking`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
      const id = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.get(`/booking`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      const id = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.get(`/booking`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  })
});

describe('PUT /booking', () => {
  describe('When token is valid', () => {
    it('should respond with status 200 with booking id', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const room2 = await createRooms(hotel.id);

      const { status, body } = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: room2.id });
      expect(status).toEqual(httpStatus.OK);
      expect(body).toEqual({
        bookingId: expect.any(Number)
      });
    });

    it('should respond with status 400 if body is invalid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);
      await updateBooking(booking.id, room.id);

      const fakeBody = { fakeProperty: faker.datatype.number() };

      const { status } = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send(fakeBody);
      expect(status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 403 if booking id is NaN', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);
      await createBooking(user.id, room.id);

      const { status } = await server.put(`/booking/isNaN`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if booking id is negative', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const { status } = await server.put(`/booking/-${booking}`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if user has no booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);

      const fakeBookingId = { fakeProperty: faker.datatype.number() };

      const { status } = await server.put(`/booking/${fakeBookingId}`).set('Authorization', `Bearer ${token}`).send({ roomId: room.id });
      expect(status).toEqual(httpStatus.FORBIDDEN);
    });

    it('should respond with status 403 if room is full', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();
      const room = await createRooms(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const room2 = await createRooms(hotel.id, 2);
      await createBooking(user.id, room2.id);
      await createBooking(user.id, room2.id);

      const { status } = await server.put(`/booking/${booking.id}`).set('Authorization', `Bearer ${token}`).send({ roomId: room2.id });
      expect(status).toEqual(httpStatus.FORBIDDEN);
    });
  });

  describe('When token is invalid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const fakeBookingId = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.put(`/booking/${fakeBookingId}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
      const fakeBookingId = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.put(`/booking/${fakeBookingId}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      const fakeBookingId = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.put(`/booking/${fakeBookingId}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  })
});