import { IsInt, Min, Max } from 'class-validator';

export class SubscriptionPriceDto {
  @IsInt()
  @Min(100)
  @Max(5000)
  priceXP: number;
}
