declare namespace Express {
  export interface Request {
    host_url: string;
    current_url: string;
    user: {
      id: number;
    };
  }
}
