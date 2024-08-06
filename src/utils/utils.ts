import { Types } from 'mongoose';

export const generateStringId = () => {
  return new Types.ObjectId().toHexString();
};
