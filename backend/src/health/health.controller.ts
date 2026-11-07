import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import mongoose from 'mongoose';

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Get()
  check() {
    const dbReady = this.connection.readyState === 1;
    return {
      status: dbReady ? 'ok' : 'degraded',
      mongodb: dbReady ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }
}

