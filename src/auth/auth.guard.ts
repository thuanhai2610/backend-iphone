import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private readonly  jwtService: JwtService){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(req);
        if (!token) {
            throw new UnauthorizedException('Token is missing...');
        } try {
            const payload = await this.jwtService.verifyAsync(token , {
                secret: process.env.JWT_SECRET
            })
            req['user'] = payload;
        } catch (error) {
            throw new UnauthorizedException('', error)
        }
        return true;
    }
    private extractTokenFromHeader(req : Request){
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined
    }
}