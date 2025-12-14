import { Estate } from "./location";

export interface Role {
  id?: number;
  name: string;
}

export interface User {
  id?: number;
  name: string;
  username: string;
  role: Role
  estate: Estate
}

export interface UserCreate {
  name: string;
  username: string;
  password: string;
  roleId: number
  estateId: number | null
};
