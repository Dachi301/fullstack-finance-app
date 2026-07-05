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

  afterEach(async () => {
    await app.close();
  });
});
