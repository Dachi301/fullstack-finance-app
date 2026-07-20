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
    return request(app.getHttpServer()).get('/test').expect(200).expect({
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

    const transactionsResponse = await request(app.getHttpServer())
      .get('/transactions')
      .expect(200);

    expect(
      transactionsResponse.body.some(
        (transaction: { id: string }) => transaction.id === transactionId,
      ),
    ).toBe(false);
  });

  it('/transactions/:id (GET) returns one transaction', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Transaction to fetch',
        amountMinor: 1999,
        type: 'expense',
        transactionDate: '2026-07-07',
      })
      .expect(201);

    const transactionId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get(`/transactions/${transactionId}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(transactionId);
        expect(body.description).toBe('Transaction to fetch');
        expect(body.amountMinor).toBe(1999);
      });
  });

  it('/transactions/:id (GET) returns 404 for unknown transaction', () => {
    const unknownId = '02c106ad-974d-48f8-99b0-f4585ae47ae1';

    return request(app.getHttpServer())
      .get(`/transactions/${unknownId}`)
      .expect(404)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(404);
        expect(body.message).toContain('was not found');
      });
  });

  it('/transactions/:id (PATCH) updates a transaction', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Transaction to update',
        amountMinor: 2500,
        type: 'expense',
        transactionDate: '2026-07-08',
      })
      .expect(201);

    const transactionId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}`)
      .send({
        description: 'Updated transaction',
        amountMinor: 3000,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toBe(transactionId);
        expect(body.description).toBe('Updated transaction');
        expect(body.amountMinor).toBe(3000);
        expect(body.type).toBe('expense');
      });
  });

  it('/transactions/:id (PATCH) rejects invalid input', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Transaction with invalid update',
        amountMinor: 2500,
        type: 'expense',
        transactionDate: '2026-07-08',
      })
      .expect(201);

    const transactionId = createResponse.body.id as string;

    await request(app.getHttpServer())
      .patch(`/transactions/${transactionId}`)
      .send({
        description: '',
        amountMinor: 0,
        extra: 'rejected',
      })
      .expect(400)
      .expect(({ body }) => {
        expect(body.statusCode).toBe(400);
        expect(body.message).toContain('property extra should not exist');
      });
  });

  it('/transactions/summary (GET) returns totals', async () => {
    await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Summary income',
        amountMinor: 100000,
        type: 'income',
        transactionDate: '2026-07-09',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/transactions')
      .send({
        description: 'Summary expense',
        amountMinor: 25000,
        type: 'expense',
        transactionDate: '2026-07-09',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/transactions/summary')
      .expect(200)
      .expect(({ body }) => {
        expect(body.incomeMinor).toBeGreaterThanOrEqual(100000);
        expect(body.expenseMinor).toBeGreaterThanOrEqual(25000);
        expect(body.balanceMinor).toBe(body.incomeMinor - body.expenseMinor);
        expect(body.transactionCount).toBeGreaterThanOrEqual(2);
      });
  });

  it('/transactions/:id (DELETE) returns 404 for unknown transaction', () => {
    const unknownId = '02c106ad-974d-48f8-99b0-f4585ae47ae1';

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
