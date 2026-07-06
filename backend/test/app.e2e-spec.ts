import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from '../src/app.setup';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  
    app = moduleFixture.createNestApplication();
  
    configureApp(app);
  
    await app.init();
  });

  it('/test (GET)', () => {
    return request(app.getHttpServer())
      .get('/test')
      .expect(200)
      .expect({
        message: 'Hello World!',
        status: 'success',
      });
  });

  it('/transactions (POST) rejects invalid input', () => {
    return request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: '',
        amountMinor: 0,
        type: 'invalid',
        transactionDate: 'not-a-date',
        extra: 'rejected',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(400);
        expect(body.message).toContain('property extra should not exist');
      });
  });

  it('/transactions/:id (DELETE) deletes a transaction', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Temporary transaction',
        amountMinor: 2500,
        type: 'expense',
        transactionDate: '2026-07-06',
      })
      .expect(201);
  
    const transactionId = createResponse.body.id as string;
  
    await request(app.getHttpServer())
      .delete(`/transactions/${transactionId}`)
      .expect(204);
  
    const transactionsResponse = await request(
      app.getHttpServer(),
    )
      .get('/transactions')
      .expect(200);
  
    expect(
      transactionsResponse.body.some(
        (transaction: { id: string }) =>
          transaction.id === transactionId,
      ),
    ).toBe(false);
  });
  
  it('/transactions/:id (DELETE) returns 404 for unknown transaction', () => {
    const unknownId =
      '02c106ad-974d-48f8-99b0-f4585ae47ae1';
  
    return request(app.getHttpServer())
      .delete(`/transactions/${unknownId}`)
      .expect(404)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(404);
        expect(body.message).toContain('was not found');
      });
  });
  
  it('/transactions/:id (DELETE) rejects an invalid UUID', () => {
    return request(app.getHttpServer())
      .delete('/transactions/not-a-uuid')
      .expect(400)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(400);
        expect(body.message.toLowerCase()).toContain('uuid');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
