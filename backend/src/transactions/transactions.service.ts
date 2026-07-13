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

  findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      order: {
        transactionDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction =
      this.transactionsRepository.create(createTransactionDto);

    return this.transactionsRepository.save(transaction);
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOneBy({ id });

    if (!transaction) {
      throw new NotFoundException(`Transaction with id "${id}" was not found.`);
    }

    return transaction;
  }

  async update(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    Object.assign(transaction, updateTransactionDto);

    await this.transactionsRepository.save(transaction);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.transactionsRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Transaction with id "${id}" was not found.`);
    }
  }

  async getSummary(): Promise<TransactionsSummary> {
    const transactions = await this.transactionsRepository.find();

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
