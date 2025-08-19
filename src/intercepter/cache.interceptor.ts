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
//     const method = request.method;
//     const key = `cache:${request.originalUrl}`;

//     if (method === 'GET') {
//       // 👉 Check cache
//       const cached = await this.redisClient.get(key);
//       if (cached) {
//         console.log(`✅ Redis cache hit: ${key}`);
//         return of(JSON.parse(cached)); 
//       }

//       return next.handle().pipe(
//         tap(async (data) => {
//           console.log(`💾 Save to Redis: ${key}`);
//           await this.redisClient.set(key, JSON.stringify(data), 'EX', 3600); 
//         })
//       );
//     }

//     if (method === 'POST') {
//       return next.handle().pipe(
//         tap(async () => {
//           console.log(`🗑️ Invalidate cache after POST: ${request.originalUrl}`);
//           // Xóa cache liên quan, ví dụ như danh sách GET cùng resource
//           const baseUrl = request.baseUrl || request.originalUrl.split('?')[0];
//           const pattern = `cache:${baseUrl}*`;

//           const keys = await this.redisClient.keys(pattern);
//           if (keys.length > 0) {
//             await this.redisClient.del(keys);
//             console.log(`🗑️ Cleared ${keys.length} keys with pattern: ${pattern}`);
//           }
//         })
//       );
//     }

//     return next.handle();
//   }
// }
