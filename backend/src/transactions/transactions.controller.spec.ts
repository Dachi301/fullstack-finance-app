import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionType } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const transactionsService = {
    findAll: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    transactionsService.findAll.mockReset();
    transactionsService.create.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: transactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return all transactions', async () => {
    transactionsService.findAll.mockResolvedValue([]);

    const result = await controller.findAll();

    expect(result).toEqual([]);
    expect(transactionsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('should create a transaction', async () => {
    const dto: CreateTransactionDto = {
      description: 'Groceries',
      amountMinor: 4599,
      type: TransactionType.Expense,
      transactionDate: '2026-07-06',
    };
  
    const transaction = {
      ...dto,
      id: 'transaction-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  
    transactionsService.create.mockResolvedValue(transaction);
  
    const result = await controller.create(dto);
  
    expect(transactionsService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(transaction);
  });
});