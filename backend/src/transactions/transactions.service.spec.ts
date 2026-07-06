import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  const repository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    repository.find.mockReset();
    repository.create.mockReset();
    repository.save.mockReset();
    repository.delete.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all transactions', async () => {
    repository.find.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
    expect(repository.find).toHaveBeenCalledTimes(1);
  });

  it('should create a transaction', async () => {
    const dto: CreateTransactionDto = {
      description: 'Monthly salary',
      amountMinor: 250000,
      type: TransactionType.Income,
      transactionDate: '2026-07-06',
    };
  
    const transaction = {
      ...dto,
      id: 'transaction-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    repository.create.mockReturnValue(transaction);
    repository.save.mockResolvedValue(transaction);
  
    const result = await service.create(dto);
  
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(transaction);
    expect(result).toEqual(transaction);
  });

  it('should delete a transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';
  
    repository.delete.mockResolvedValue({
      affected: 1,
    });
  
    await service.remove(id);
  
    expect(repository.delete).toHaveBeenCalledWith(id);
    expect(repository.delete).toHaveBeenCalledTimes(1);
  });
  
  it('should throw when deleting an unknown transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';
  
    repository.delete.mockResolvedValue({
      affected: 0,
    });
  
    await expect(service.remove(id)).rejects.toThrow(
      NotFoundException,
    );
  
    expect(repository.delete).toHaveBeenCalledWith(id);
  });
});