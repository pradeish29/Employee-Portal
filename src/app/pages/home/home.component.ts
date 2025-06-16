import { Component, OnInit, OnDestroy } from '@angular/core'; // Import OnInit and OnDestroy
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';
import { interval, Subscription } from 'rxjs'; // Import interval and Subscription from RxJS

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SidebarComponent,
    NavbarComponent,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle,
    MatIcon,
    MatButton,
    RouterLink,
    NgFor
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy { // Implement OnInit and OnDestroy
  currentPage = 'Dashboard';
  employeeName = localStorage.getItem('username') || 'Employee';
  currentDateTime: string = ''; // New property to hold the formatted date and time
  private dateTimeSubscription: Subscription | undefined; // To hold our interval subscription

  quickActions = [
    {
      title: 'My Profile',
      description: 'View and update your personal information, contact details, and professional settings',
      icon: 'person',
      route: '/profile',
      color: '#6264A7'
    },
    {
      title: 'Leave Management',
      description: 'Apply for leave, track requests, and view your leave balance and history',
      icon: 'event_available',
      route: '/leave',
      color: '#0078D4'
    },
    {
      title: 'Payroll',
      description: 'Access pay slips, tax documents, and salary information securely',
      icon: 'payment',
      route: '/payroll',
      color: '#107C10'
    },
    {
      title: 'Team Directory',
      description: 'Find and connect with colleagues across your organization',
      icon: 'groups',
      route: '/directory',
      color: '#8661C5'
    },
    {
      title: 'Time Tracking',
      description: 'Log work hours, track projects, and manage your time efficiently',
      icon: 'schedule',
      route: '/timesheet',
      color: '#D83B01'
    },
    {
      title: 'Documents',
      description: 'Access company policies, forms, and important documentation',
      icon: 'folder',
      route: '/documents',
      color: '#038387'
    }
  ];

  ngOnInit(): void {
    // Initialize the time immediately
    this.updateDateTime();
    // Set up an interval to update the time every second (1000 milliseconds)
    this.dateTimeSubscription = interval(1000).subscribe(() => {
      this.updateDateTime();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the interval to prevent memory leaks when the component is destroyed
    if (this.dateTimeSubscription) {
      this.dateTimeSubscription.unsubscribe();
    }
  }

  updateDateTime(): void {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit' // Added second to see it refresh immediately
    };
    this.currentDateTime = now.toLocaleDateString('en-US', options);
  }
}