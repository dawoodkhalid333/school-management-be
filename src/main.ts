import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  const config = new DocumentBuilder()
    .setTitle('school-backend-apis')
    .setDescription('school-backend-apis')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('apis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
  await app.listen(5000);
  console.log('server listening on port 5000');
}
bootstrap();
