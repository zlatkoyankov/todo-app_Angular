export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  name: string;
  confirmPassword: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
}

export interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}
