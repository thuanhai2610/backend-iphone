// import { Global, Module } from '@nestjs/common';
// import Redis from 'ioredis';

// @Global()
// @Module({
//   providers: [
//     {
//       provide: 'REDIS_CLIENT',
//       useFactory: () => {
//         return new Redis({
//           host: process.env.REDIS_HOST,
//           port: Number(process.env.REDIS_PORT),
//           password: process.env.REDIS_PASSWORD,
//         //   tls: {}, 
//         });
//       },
//     },
//   ],
//   exports: ['REDIS_CLIENT'],
// })
// export class RedisModule {}
