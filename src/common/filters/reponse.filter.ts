import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

export class ResponseFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse();

        let status: number;
        let message: string | object;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            message = typeof res === 'string' ? { message: res } : res;
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = { message: exception.message }
        }

        res.status(status).json({
            success: false,
            error: {
                statusCode: status,
                ...(typeof message === 'object' ? message : { message })
            },
            timestamp: new Date().toISOString(),
            path: req.url,
        })
    }
}
