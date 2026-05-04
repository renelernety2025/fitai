import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WearablesController } from './wearables.controller';
import { WearablesService } from './wearables.service';
import { WearablesConnectionsController } from './wearables-connections.controller';
import { OuraController } from './providers/oura/oura.controller';
import { OuraOAuthService } from './providers/oura/oura-oauth.service';
import { OuraSyncService } from './providers/oura/oura-sync.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
  ],
  controllers: [WearablesController, WearablesConnectionsController, OuraController],
  providers: [WearablesService, OuraOAuthService, OuraSyncService],
  exports: [WearablesService, OuraSyncService],
})
export class WearablesModule {}
