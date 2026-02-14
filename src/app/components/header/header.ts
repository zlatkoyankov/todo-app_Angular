import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../service/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  protected authService = inject(AuthService);
  private router = inject(Router);

  protected currentUser = this.authService.currentUser;
  protected isAuthenticated = this.authService.isAuthenticated;

  protected async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
