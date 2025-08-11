import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware{
    use(req: Request, res: Response, next: NextFunction) {
        console.log(`[${new Date().toDateString()}] ${req.method} ${req.url}`);
        next();
    }
}