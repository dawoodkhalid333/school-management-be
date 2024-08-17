import { Module, DynamicModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CreateUserSchema, CreateUser } from '../schema/Signup.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { CheckInOut, CheckInOutSchema } from '../schema/CheckInOut.schema';

@Module({})
export class AuthModule {
  static forRoot(): DynamicModule {
    return {
      imports: [
        MongooseModule.forFeature([
          { name: CreateUser.name, schema: CreateUserSchema },
          { name: CheckInOut.name, schema: CheckInOutSchema },
        ]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '7200s' },
        }),
      ],

      controllers: [AuthController],
      providers: [AuthService, JwtStrategy],
      module: AuthModule,
    };
  }
}
