import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionType } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const transactionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
  };

  beforeEach(async () => {
    transactionsService.findAll.mockReset();
    transactionsService.findOne.mockReset();
    transactionsService.create.mockReset();
    transactionsService.update.mockReset();
    transactionsService.remove.mockReset();
    transactionsService.getSummary.mockReset();

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

  it('should return one transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';
    const transaction = {
      id,
      description: 'Groceries',
      amountMinor: 4599,
      type: TransactionType.Expense,
      transactionDate: '2026-07-06',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    transactionsService.findOne.mockResolvedValue(transaction);

    const result = await controller.findOne(id);

    expect(transactionsService.findOne).toHaveBeenCalledWith(id);
    expect(result).toEqual(transaction);
  });

  it('should update a transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';
    const dto: UpdateTransactionDto = {
      description: 'Updated groceries',
      amountMinor: 5000,
    };
    const transaction = {
      id,
      description: 'Updated groceries',
      amountMinor: 5000,
      type: TransactionType.Expense,
      transactionDate: '2026-07-06',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    transactionsService.update.mockResolvedValue(transaction);

    const result = await controller.update(id, dto);

    expect(transactionsService.update).toHaveBeenCalledWith(id, dto);
    expect(result).toEqual(transaction);
  });

  it('should delete a transaction', async () => {
    const id = '02c106ad-974d-48f8-99b0-f4585ae47ae1';

    transactionsService.remove.mockResolvedValue(undefined);

    await controller.remove(id);

    expect(transactionsService.remove).toHaveBeenCalledWith(id);
    expect(transactionsService.remove).toHaveBeenCalledTimes(1);
  });

  it('should return a transactions summary', async () => {
    const summary = {
      incomeMinor: 500000,
      expenseMinor: 20000,
      balanceMinor: 480000,
      transactionCount: 3,
    };

    transactionsService.getSummary.mockResolvedValue(summary);

    const result = await controller.getSummary();

    expect(transactionsService.getSummary).toHaveBeenCalledTimes(1);
    expect(result).toEqual(summary);
  });
});
