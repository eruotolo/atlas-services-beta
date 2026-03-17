import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError, Prisma.PrismaClientValidationError)
export class PrismaExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(PrismaExceptionFilter.name);

    catch(exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof Prisma.PrismaClientValidationError) {
            return response.status(HttpStatus.BAD_REQUEST).json({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Datos inválidos en la solicitud',
            });
        }

        const { status, message } = this.mapPrismaError(exception);

        this.logger.error(`Prisma error ${exception.code}: ${exception.message}`);

        return response.status(status).json({ statusCode: status, message });
    }

    private mapPrismaError(exception: Prisma.PrismaClientKnownRequestError): {
        status: number;
        message: string;
    } {
        switch (exception.code) {
            case 'P2002': // Unique constraint
                return {
                    status: HttpStatus.CONFLICT,
                    message: `El campo '${(exception.meta?.target as string[])?.join(', ')}' ya existe`,
                };
            case 'P2025': // Record not found
                return {
                    status: HttpStatus.NOT_FOUND,
                    message: 'Registro no encontrado',
                };
            case 'P2003': // Foreign key constraint
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'Referencia a un registro que no existe',
                };
            case 'P2014': // Relation violation
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: 'La operación viola una relación requerida',
                };
            default:
                return {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Error en la base de datos',
                };
        }
    }
}
