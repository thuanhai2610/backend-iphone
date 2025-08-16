// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
// } from '@nestjs/common';
// import { Observable, of } from 'rxjs';
// import { tap } from 'rxjs/operators';
// import Redis from 'ioredis';
// import { Inject } from '@nestjs/common';

// @Injectable()
// export class RedisCacheInterceptor implements NestInterceptor {
//   constructor(
//     @Inject('REDIS_CLIENT') private readonly redisClient: Redis
//   ) {}

//   async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
//     const request = context.switchToHttp().getRequest();

//     if (request.method !== 'GET') {
//       return next.handle();
//     }

//     const key = `cache:${request.originalUrl}`;

//     const cached = await this.redisClient.get(key);
//     if (cached) {
//       console.log(`✅ Redis cache hit: ${key}`);
//       return of(JSON.parse(cached)); 
//     }

//     return next.handle().pipe(
//       tap(async (data) => {
//         console.log(`💾 Save to Redis: ${key}`);
//         await this.redisClient.set(key, JSON.stringify(data), 'EX', 3600); 
//       })
//     );
//   }
// }
