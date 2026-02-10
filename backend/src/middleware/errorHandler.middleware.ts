import AppError from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';

interface MongoError extends Error {
    statusCode?: number;
    code?: number;
    errors?: Record<string, { message: string }>;
}

const errorHandler = (err: MongoError, req: Request, res: Response, next: NextFunction): void => {
    let error = new AppError(err.message || 'Error del servidor', 500);

    if (err.name === 'CastError') {
        error = new AppError('Recurso no encontrado', 404);
    }

    if (err.code === 11000) {
        error = new AppError('Valor duplicado', 400);
    }

    if (err.name === 'ValidationError' && err.errors) {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Error del servidor'
    });
};

export default errorHandler;