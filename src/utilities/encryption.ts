import bcrypt from "bcrypt";
import * as env from "../config/env";

const encrypt = (data: string) => {
  return bcrypt.hash(data, env.SALTING_NUM);
};

const compareEncrypt = (data1: string, data2: string) => {
  return bcrypt.compare(data1, data2);
};


export { encrypt, compareEncrypt };
