import { IsString, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  from!: string;

  @IsString()
  @MinLength(2)
  to!: string;
}
