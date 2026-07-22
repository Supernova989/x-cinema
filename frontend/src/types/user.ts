export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}
