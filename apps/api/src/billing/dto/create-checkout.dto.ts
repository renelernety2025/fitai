import { IsEnum } from 'class-validator';

enum CheckoutTier {
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}

export class CreateCheckoutDto {
  @IsEnum(CheckoutTier)
  tier: CheckoutTier;
}
