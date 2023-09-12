import { Request } from 'express';
import { ConnectionPool } from 'mssql';

interface CustomRequest extends Request {
  db: ConnectionPool;
}

export default CustomRequest;