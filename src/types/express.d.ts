declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string;
      access: number;
    };
  }
}

// import { File } from 'multer';

// declare global {
//   namespace Express {
//     export interface Request {
//       file?: File;
//       files?: File[];
//     }
//   }
// }
