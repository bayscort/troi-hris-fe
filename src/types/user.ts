export interface Role {
  id?: number;
  name: string;
}

export interface User {
  id?: number;
  name: string;
  username: string;
  role: Role
}

export interface UserCreate {
  name: string;
  username: string;
  password: string;
  roleId: number
};
