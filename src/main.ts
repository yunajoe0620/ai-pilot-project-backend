import { NestFactory } from '@nestjs/core';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { AppModule } from './app.module';

const WOLFRAM_IMG_URL = 'https://www6b3.wolframalpha.com';
const proxyMiddleware = createProxyMiddleware<Request, Response>({
  target: 'http',
  changeOrigin: true,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // app.use('/problem/wolfram', (req, res, next) => {
  //   createProxyMiddleware({
  //     target: WOLFRAM_IMG_URL,
  //     changeOrigin: true,
  //   });
  // });

  await app.listen(5000);
}
bootstrap();
