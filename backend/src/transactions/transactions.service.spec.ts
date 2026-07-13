import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  const repository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    repository.find.mockReset();
    repository.findOneBy.mockReset();
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
    expect(repository.find).toHaveBeenCalledWith({
      order: {
        transactionDate: 'DESC',
        createdAt: 'DESC',
      },
    });
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

  it('should return one transaction by id', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';
    const transaction = {
      id,
      description: 'Coffee',
      amountMinor: 450,
      type: TransactionType.Expense,
      transactionDate: '2026-07-06',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    repository.findOneBy.mockResolvedValue(transaction);

    const result = await service.findOne(id);

    expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    expect(result).toEqual(transaction);
  });

  it('should throw when finding an unknown transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';

    repository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id });
  });

  it('should update a transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';
    const existingTransaction = {
      id,
      description: 'Coffee',
      amountMinor: 450,
      type: TransactionType.Expense,
      transactionDate: '2026-07-06',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const dto: UpdateTransactionDto = {
      description: 'Coffee and snack',
      amountMinor: 800,
    };
    const updatedTransaction = {
      ...existingTransaction,
      ...dto,
    };

    repository.findOneBy
      .mockResolvedValueOnce(existingTransaction)
      .mockResolvedValueOnce(updatedTransaction);
    repository.save.mockResolvedValue(updatedTransaction);

    const result = await service.update(id, dto);

    expect(repository.findOneBy).toHaveBeenCalledTimes(2);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    expect(repository.save).toHaveBeenCalledWith(updatedTransaction);
    expect(result).toEqual(updatedTransaction);
  });

  it('should throw when updating an unknown transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';
    const dto: UpdateTransactionDto = {
      description: 'Updated description',
    };

    repository.findOneBy.mockResolvedValue(null);

    await expect(service.update(id, dto)).rejects.toThrow(NotFoundException);
    expect(repository.findOneBy).toHaveBeenCalledWith({ id });
    expect(repository.save).not.toHaveBeenCalled();
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

    await expect(service.remove(id)).rejects.toThrow(NotFoundException);

    expect(repository.delete).toHaveBeenCalledWith(id);
  });

  it('should return a transactions summary', async () => {
    repository.find.mockResolvedValue([
      {
        amountMinor: 500000,
        type: TransactionType.Income,
      },
      {
        amountMinor: 12500,
        type: TransactionType.Expense,
      },
      {
        amountMinor: 7500,
        type: TransactionType.Expense,
      },
    ]);

    const result = await service.getSummary();

    expect(result).toEqual({
      incomeMinor: 500000,
      expenseMinor: 20000,
      balanceMinor: 480000,
      transactionCount: 3,
    });
  });
});
