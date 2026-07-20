import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

export interface TransactionsSummary {
  incomeMinor: number;
  expenseMinor: number;
  balanceMinor: number;
  transactionCount: number;
}

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  findAll(userId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: { userId },
      order: {
        transactionDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      userId,
    });

    return this.transactionsRepository.save(transaction);
  }

  async findOne(id: string, userId: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOneBy({ id, userId });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" was not found.`);
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);

    Object.assign(transaction, updateTransactionDto);

    await this.transactionsRepository.save(transaction);

    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.transactionsRepository.delete({ id, userId });

    if (!result.affected) {
      throw new NotFoundException(`Transaction with id "${id}" was not found.`);
    }
  }

  async getSummary(userId: string): Promise<TransactionsSummary> {
    const transactions = await this.findAll(userId);

    return transactions.reduce<TransactionsSummary>(
      (summary, transaction) => {
        if (transaction.type === 'income') {
          summary.incomeMinor += transaction.amountMinor;
        }

        if (transaction.type === 'expense') {
          summary.expenseMinor += transaction.amountMinor;
        }

        summary.balanceMinor = summary.incomeMinor - summary.expenseMinor;
        summary.transactionCount += 1;

        return summary;
      },
      {
        incomeMinor: 0,
        expenseMinor: 0,
        balanceMinor: 0,
        transactionCount: 0,
      },
    );
  }
}
