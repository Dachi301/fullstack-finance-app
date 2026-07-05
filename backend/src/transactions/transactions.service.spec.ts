import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsService', () => {
  let service: TransactionsService;
  const repository = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    repository.find.mockReset();
    repository.create.mockReset();
    repository.save.mockReset();

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
});