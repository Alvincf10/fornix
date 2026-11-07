import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema.js';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type PublicUser = {
  id: string;
  email: string;
  displayName: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      displayName: dto.displayName,
      passwordHash,
    });

    const tokens = await this.issueTokens(user.id);
    return { user: this.toPublicUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.issueTokens(user.id);
    return { user: this.toPublicUser(user), tokens };
  }

  async refresh(rawRefreshToken?: string): Promise<AuthTokens> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    const stored = await this.refreshTokenModel.findOne({ tokenHash }).exec();
    if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(rawRefreshToken, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }

    if (payload.sub !== stored.userId.toString()) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const tokens = await this.issueTokens(payload.sub);
    stored.revokedAt = new Date();
    stored.replacedByTokenHash = this.hashToken(tokens.refreshToken);
    await stored.save();

    return tokens;
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const tokenHash = this.hashToken(rawRefreshToken);
    await this.refreshTokenModel
      .updateOne({ tokenHash, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } })
      .exec();
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.toPublicUser(user);
  }

  private async issueTokens(userId: string): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId, typ: 'access' },
      {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: this.configService.getOrThrow<string>('jwt.accessExpiresIn') as `${number}m`,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, typ: 'refresh', jti: randomBytes(16).toString('hex') },
      {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: this.configService.getOrThrow<string>('jwt.refreshExpiresIn') as `${number}d`,
      },
    );

    const decoded = this.jwtService.decode(refreshToken) as { exp: number };
    await this.refreshTokenModel.create({
      userId: new Types.ObjectId(userId),
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000),
    });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private toPublicUser(user: { id: string; email: string; displayName: string }): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}
