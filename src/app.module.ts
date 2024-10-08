import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './component/auth/auth.module';
import { MediaUploadModule } from './component/media-upload/media-upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL),
    AuthModule.forRoot(),
    MediaUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
