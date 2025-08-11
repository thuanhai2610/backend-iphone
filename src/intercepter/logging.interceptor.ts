import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";


@Injectable()
export class LonggingInterceptor implements NestInterceptor{
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const {method, url, body} = req;
        console.log(`Request: ${req.method} ${req.url}` );
        console.log(`Request body: ${JSON.stringify(body)}` );
        return next.handle().pipe(
            tap(() => {
                console.log(`Response: ${method} ${url}`);
                console.log(`Response status: `, res.statusCode);
            })
        )
    }
}