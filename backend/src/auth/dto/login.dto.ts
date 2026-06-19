import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(9)
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
