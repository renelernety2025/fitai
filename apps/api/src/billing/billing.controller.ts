import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';

@Controller('billing')
export class BillingController {
  constructor(private service: BillingService) {}

  @Get('status')
  @UseGuards(JwtAuthGuard)
  getStatus(@Request() req: any) {
    return this.service.getStatus(req.user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(
    @Request() req: any,
    @Body() dto: CreateCheckoutDto,
  ) {
    return this.service.createCheckout(
      req.user.id,
      dto.tier,
    );
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  createPortal(@Request() req: any) {
    return this.service.createPortal(req.user.id);
  }

  @Post('webhook')
  handleWebhook(
    @Body() body: unknown,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.service.handleWebhook(body, signature);
  }

  @Get('plans')
  getPlans() {
    return this.service.getPlans();
  }
}
