import { NextFunction, Request, Response } from 'express';
import { config } from '../config.js';
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from './customErrors.js';
import { respondWithError } from './json.js';

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const statusCode = res.statusCode;

        if (statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });

    next();
}


export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    config.api.fileserverHits++;

    next();
}

export function middlewareErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = 500;
    let message = "Something went wrong on our end";

    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
    } else if (err instanceof UnauthorizedError) {
        statusCode = 401;
        message = err.message;
    }

    if (err instanceof ForbiddenError) {
        statusCode = 403;
        message = err.message;
    }

    if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    }

    if (statusCode >= 500) {
        console.error(err);
    }

    respondWithError(res, statusCode, message);
}
