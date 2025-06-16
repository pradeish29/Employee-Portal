import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    HttpClientModule,
    MatIcon
  ],
})
export class LoginComponent {
  username = '';
  password = '';
  showError = false;

  constructor(private http: HttpClient, private router: Router) {}

  onLogin() {
    // Simple validation
    if (!this.username || !this.password) {
      this.showError = true;
      return;
    }

    const loginPayload = {
      username: this.username,
      password: this.password
    };

    // First API call - Login authentication
    this.http.post<any>('http://localhost:3000/emplogin', loginPayload).subscribe({
      next: (loginResponse) => {
        console.log('Login response:', loginResponse);
        
        if (loginResponse?.Return === 'SUCCESS') {
          // Second API call - Get employee profile
          const profilePayload = {
            empId: this.username
          };

          this.http.post<any>('http://localhost:3000/empprofile', profilePayload).subscribe({
            next: (profileResponse) => {
              console.log('Profile response:', profileResponse);
              
              // Store data in localStorage
              localStorage.setItem('isLoggedIn', 'true');
              localStorage.setItem('userid', this.username);
              localStorage.setItem('username', profileResponse.FirstName + ' ' + profileResponse.LastName);
              localStorage.setItem('email', profileResponse.Email);
              
              console.log('Login successful, navigating to home');
              // Navigate to home
              this.router.navigate(['/home']);
            },
            error: (err) => {
              console.error('Profile fetch error:', err);
              alert('Failed to fetch user profile');
              this.showError = true;
            }
          });
        } else {
          console.log('Login failed - invalid credentials');
          alert('Invalid username or password');
          this.showError = true;
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        alert('Login failed. Please try again.');
        this.showError = true;
      }
    });
  }
}