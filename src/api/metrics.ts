import type { Request, Response } from 'express';
import { config } from '../config.js';

export async function handleMetrics(_: Request, res: Response) {
    res.setHeader('Content-Type', "text/html; charset=utf-8");
    const template = `
        <html>
          <body>
            <h1>Welcome, Chirpy Admin</h1>
            <p>Chirpy has been visited ${config.fileserverHits} times!</p>
          </body>
        </html>
    `;

    res.send(template);
}
