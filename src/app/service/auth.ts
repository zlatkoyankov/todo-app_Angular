import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  User,
  UserCredentials,
  UserRegistration,
  UserUpdate,
  PasswordChange,
  StoredUser,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  private router = inject(Router);

  constructor() {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const userData = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userData) {
      const user: User = JSON.parse(userData);
      // Convert date strings back to Date objects
      user.createdAt = new Date(user.createdAt);
      this.currentUserSignal.set(user);
    }
  }

  private saveCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    this.currentUserSignal.set(user);
  }

  private getUsers(): StoredUser[] {
    const usersData = localStorage.getItem(this.USERS_KEY);
    if (!usersData) {
      return [];
    }
    const users = JSON.parse(usersData);
    return users.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    }));
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  private hashPassword(password: string): string {
    // Simple hash function for demo purposes
    // In a real app, password hashing should be done server-side
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  register(registration: UserRegistration): { success: boolean; error?: string } {
    // Validate passwords match
    if (registration.password !== registration.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    // Validate password strength
    if (registration.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === registration.email.toLowerCase())) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser: StoredUser = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      email: registration.email,
      name: registration.name,
      passwordHash: this.hashPassword(registration.password),
      createdAt: new Date(),
    };

    users.push(newUser);
    this.saveUsers(users);

    // Auto-login after registration
    const { passwordHash, ...userWithoutPassword } = newUser;
    this.saveCurrentUser(userWithoutPassword);

    return { success: true };
  }

  login(credentials: UserCredentials): { success: boolean; error?: string } {
    const users = this.getUsers();
    const passwordHash = this.hashPassword(credentials.password);

    const user = users.find(
      u =>
        u.email.toLowerCase() === credentials.email.toLowerCase() &&
        u.passwordHash === passwordHash
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    this.saveCurrentUser(userWithoutPassword);

    return { success: true };
  }

  logout(): void {
    this.saveCurrentUser(null);
    this.router.navigate(['/']);
  }

  updateAccount(update: UserUpdate): { success: boolean; error?: string } {
    const currentUser = this.currentUserSignal();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Check if email is being changed and if it's already taken
    if (
      update.email &&
      update.email.toLowerCase() !== currentUser.email.toLowerCase() &&
      users.some(
        u => u.id !== currentUser.id && u.email.toLowerCase() === update.email!.toLowerCase()
      )
    ) {
      return { success: false, error: 'Email already in use' };
    }

    // Update user
    const updatedStoredUser: StoredUser = {
      ...users[userIndex],
      ...(update.name && { name: update.name }),
      ...(update.email && { email: update.email }),
    };

    users[userIndex] = updatedStoredUser;
    this.saveUsers(users);

    // Update current user session
    const { passwordHash, ...userWithoutPassword } = updatedStoredUser;
    this.saveCurrentUser(userWithoutPassword);

    return { success: true };
  }

  changePassword(passwordChange: PasswordChange): { success: boolean; error?: string } {
    const currentUser = this.currentUserSignal();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate new passwords match
    if (passwordChange.newPassword !== passwordChange.confirmPassword) {
      return { success: false, error: 'New passwords do not match' };
    }

    // Validate new password strength
    if (passwordChange.newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    const currentPasswordHash = this.hashPassword(passwordChange.currentPassword);
    if (users[userIndex].passwordHash !== currentPasswordHash) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    users[userIndex].passwordHash = this.hashPassword(passwordChange.newPassword);
    this.saveUsers(users);

    return { success: true };
  }

  deleteAccount(): { success: boolean; error?: string } {
    const currentUser = this.currentUserSignal();
    if (!currentUser) {
      return { success: false, error: 'Not authenticated' };
    }

    // Delete user's todos
    localStorage.removeItem(`todos_${currentUser.id}`);

    // Delete user
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== currentUser.id);
    this.saveUsers(filteredUsers);

    // Logout
    this.logout();

    return { success: true };
  }
}
