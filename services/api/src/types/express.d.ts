import { UserDTO } from '@gbud/types';

declare global {
  namespace Express {
    interface Request {
      user?: UserDTO;
    }
  }
}
