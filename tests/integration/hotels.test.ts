import httpStatus from 'http-status';
import supertest from 'supertest';
import app, { init } from '@/app';
import { cleanDb, generateValidToken } from '../helpers';
import {
  createEnrollmentWithAddress,
  createHotels,
  createRooms,
  createTicket,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createUser
} from '../factories';
import { TicketStatus } from '@prisma/client';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  describe('When token is valid', () => {
    it('should respond with status 200 and the list with all hotels available', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      for (let i = 0; i < 3; i++) {
        await createHotels();
      }

      const { status, body } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.OK);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          })
        ])
      );
    });

    it('should respond with status 404 when user has no enrollment', async () => {
      const token = await generateValidToken();

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when user has no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when there are no hotels', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when user ticket was not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket does not include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  });

  describe('When token is invalid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const { status } = await server.get('/hotels');
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

      const { status } = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
});

describe('GET /hotels/:hotelId', () => {
  describe('When token is valid', () => {
    it('should respond with status 200 and the list with all rooms of selected hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotels();
      for (let i = 0; i < 4; i++) {
        await createRooms(hotel.id);
      }

      const { status, body } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.OK);
      expect(body.Rooms).toHaveLength(4);
      expect(body).toEqual(
        expect.objectContaining({
          id: hotel.id,
          name: hotel.name,
          image: hotel.image,
          createdAt: hotel.createdAt.toISOString(),
          updatedAt: hotel.updatedAt.toISOString(),
          Rooms: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
              capacity: expect.any(Number),
              hotelId: hotel.id,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            })
          ])
        })
      );
    });

    it('should respond with status 200 and a empty array when there are no rooms in the hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();

      const { status, body } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.OK);
      expect(body.Rooms).toHaveLength(0);
    });

    it('should respond with status 400 when params is NaN', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const { status } = await server.get("/hotels/isNaN").set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 400 when params is negative', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createHotels();

      const { status } = await server.get("/hotels/-1").set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.BAD_REQUEST);
    });

    it('should respond with status 404 when user has no enrollment', async () => {
      const token = await generateValidToken();
      const id = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when user has no ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const id = faker.datatype.number({ min: 1, max: 10 });

      await createEnrollmentWithAddress(user);

      const { status } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 404 when hotel does not exist', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const id = faker.datatype.number({ min: 1, max: 10 });

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const { status } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.NOT_FOUND);
    });

    it('should respond with status 402 when user ticket was not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const hotel = await createHotels();

      const { status } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket type is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const id = faker.datatype.number({ min: 1, max: 10 });

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();

      const { status } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should respond with status 402 when user ticket does not include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();

      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotels();

      const { status } = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);

      expect(status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
  });

  describe('When token is invalid', () => {
    it('should respond with status 401 if no token is given', async () => {
      const id = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.get(`/hotels/${id}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
      const id = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      const id = faker.datatype.number({ min: 1, max: 10 });

      const { status } = await server.get(`/hotels/${id}`).set('Authorization', `Bearer ${token}`);
      expect(status).toBe(httpStatus.UNAUTHORIZED);
    });
  });
});