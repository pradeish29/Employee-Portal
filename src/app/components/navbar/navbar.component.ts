// navbar.component.ts
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

export interface UserStatus {
  status: 'available' | 'busy' | 'away' | 'offline';
  label: string;
  color: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class NavbarComponent implements OnInit {
  searchQuery: string = '';
  hasLogo: boolean = true;
  showProfileDropdown: boolean = false;
  
  // Navigation state
  canGoBack: boolean = false;
  canGoForward: boolean = false;
  private navigationHistory: string[] = [];
  private currentIndex: number = -1;
  
  // User data - replace with actual user service
  user = {
  name: localStorage.getItem('username') || 'Unknown',
  email: (localStorage.getItem('email') || `${localStorage.getItem('username') || 'Unknown'}@email.com`)
};


  currentStatus: UserStatus = {
    status: 'available',
    label: 'Available',
    color: '#6bb700'
  };

  statusOptions: UserStatus[] = [
    { status: 'available', label: 'Available', color: '#6bb700' },
    { status: 'busy', label: 'Busy', color: '#c4314b' },
    { status: 'away', label: 'Away', color: '#ffaa44' },
    { status: 'offline', label: 'Appear offline', color: '#8a8886' }
  ];

  constructor(
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Load saved status from localStorage
    this.loadStatusFromStorage();
    
  }

  private loadStatusFromStorage(): void {
    const savedStatus = localStorage.getItem('userStatus');
    if (savedStatus) {
      try {
        const parsedStatus = JSON.parse(savedStatus);
        const foundStatus = this.statusOptions.find(s => s.status === parsedStatus.status);
        if (foundStatus) {
          this.currentStatus = foundStatus;
        }
      } catch (error) {
        console.error('Error loading status from localStorage:', error);
      }
    }
  }

  private saveStatusToStorage(): void {
    try {
      localStorage.setItem('userStatus', JSON.stringify(this.currentStatus));
    } catch (error) {
      console.error('Error saving status to localStorage:', error);
    }
  }


  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery = target.value;
    console.log('Searching for:', this.searchQuery);
  }

  onProfileClick(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  onViewProfile(): void {
    this.showProfileDropdown = false;
    this.router.navigate(['/profile']);
  }

  onStatusChange(status: UserStatus): void {
    this.currentStatus = status;
    this.saveStatusToStorage(); // Save to localStorage
    this.showProfileDropdown = false;
    console.log('Status changed to:', status.label);
  }

  // Method to get current status (can be called from other components)
  getCurrentStatus(): UserStatus {
    return this.currentStatus;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const profileIcon = document.querySelector('.profile-icon');
    const dropdown = document.querySelector('.profile-dropdown');
    
    if (profileIcon && dropdown && 
        !profileIcon.contains(target) && 
        !dropdown.contains(target)) {
      this.showProfileDropdown = false;
    }
  }


}