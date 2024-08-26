import { Module } from '@nestjs/common';
import { MediaUploadController } from './media-upload.controller';
import { MediaUploadService } from './media-upload.service';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { CreateUser, CreateUserSchema } from '../schema/Signup.schema';
import { UtilsService } from 'src/component/utils/utils.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CreateUser.name, schema: CreateUserSchema },
    ]),
    JwtModule,
  ],
  controllers: [MediaUploadController],
  providers: [MediaUploadService, UtilsService],
})
export class MediaUploadModule {}
