import {
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsString,
    MaxLength,
    Min,
  } from 'class-validator';
import { TransactionType } from '../entities/transaction.entity';
  
export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    description!: string;
  
    @IsInt()
    @Min(1)
    amountMinor!: number;
  
    @IsEnum(TransactionType)
    type!: TransactionType;
  
    @IsDateString()
    transactionDate!: string;
}