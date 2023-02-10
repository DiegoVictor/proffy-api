import { Request, Response, NextFunction } from 'express';

export default (request: Request, _: Response, next: NextFunction): void => {
  const { protocol, hostname, originalUrl } = request;
  const hostUrl = `${protocol}://${hostname}:${process.env.APP_PORT}`;

  request.hostUrl = hostUrl;
  request.currentUrl = `${hostUrl + originalUrl.split('?').shift()}`;

  next();
};
