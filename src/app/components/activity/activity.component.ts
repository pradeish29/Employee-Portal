import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Activity {
  id: number;
  type: 'login' | 'task' | 'meeting' | 'document' | 'system' | 'leave';
  title: string;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'in-progress' | 'cancelled';
  icon: string;
}

@Component({
  selector: 'app-activity',
  imports: [
    SidebarComponent,
    NavbarComponent,
    CommonModule
  ],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.css'
})
export class ActivityComponent implements OnInit {
  activities: Activity[] = [];
  filteredActivities: Activity[] = [];
  selectedFilter: string = 'all';
  
  constructor() { }

  ngOnInit(): void {
    this.loadActivities();
    this.filteredActivities = this.activities;
  }

  loadActivities(): void {
    this.activities = [
      {
        id: 1,
        type: 'login',
        title: 'System Login',
        description: 'Logged into employee portal from Chennai office',
        timestamp: new Date('2025-06-11T09:15:00'),
        status: 'completed',
        icon: '🔐'
      },
      {
        id: 2,
        type: 'task',
        title: 'Code Review Completed',
        description: 'Reviewed pull request #PR-2045 for payment gateway integration',
        timestamp: new Date('2025-06-11T10:30:00'),
        status: 'completed',
        icon: '✅'
      },
      {
        id: 3,
        type: 'meeting',
        title: 'Sprint Planning Meeting',
        description: 'Attended sprint planning for Q3 2025 roadmap discussion',
        timestamp: new Date('2025-06-11T11:00:00'),
        status: 'completed',
        icon: '📋'
      },
      {
        id: 4,
        type: 'document',
        title: 'Technical Specification Updated',
        description: 'Updated API documentation for user management module',
        timestamp: new Date('2025-06-11T14:20:00'),
        status: 'completed',
        icon: '📄'
      },
      {
        id: 5,
        type: 'task',
        title: 'Database Optimization',
        description: 'Working on query optimization for employee reports module',
        timestamp: new Date('2025-06-11T15:45:00'),
        status: 'in-progress',
        icon: '🔧'
      },
      {
        id: 6,
        type: 'meeting',
        title: 'Client Presentation',
        description: 'Scheduled presentation for Kaar Technologies new portal features',
        timestamp: new Date('2025-06-12T10:00:00'),
        status: 'pending',
        icon: '📊'
      },
      {
        id: 7,
        type: 'leave',
        title: 'Leave Request Submitted',
        description: 'Applied for casual leave on June 15th for personal work',
        timestamp: new Date('2025-06-10T16:30:00'),
        status: 'pending',
        icon: '🏖️'
      },
      {
        id: 8,
        type: 'system',
        title: 'Password Updated',
        description: 'Successfully updated account password as per security policy',
        timestamp: new Date('2025-06-10T12:15:00'),
        status: 'completed',
        icon: '🔑'
      },
      {
        id: 9,
        type: 'task',
        title: 'Bug Fix Deployment',
        description: 'Fixed critical bug in employee attendance tracking system',
        timestamp: new Date('2025-06-09T18:30:00'),
        status: 'completed',
        icon: '🐛'
      },
      {
        id: 10,
        type: 'meeting',
        title: 'Team Standup',
        description: 'Daily standup meeting with development team',
        timestamp: new Date('2025-06-09T09:30:00'),
        status: 'completed',
        icon: '👥'
      }
    ];
  }

  filterActivities(filter: string): void {
    this.selectedFilter = filter;
    if (filter === 'all') {
      this.filteredActivities = this.activities;
    } else {
      this.filteredActivities = this.activities.filter(activity => activity.type === filter);
    }
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-progress';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return 'Today at ' + timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else if (days === 1) {
      return 'Yesterday at ' + timestamp.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } else {
      return timestamp.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
  }

  trackByFn(index: number, item: Activity): number {
    return item.id;
  }
}