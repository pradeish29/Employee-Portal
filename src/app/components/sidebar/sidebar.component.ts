// sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SidebarComponent implements OnInit {
  currentRoute: string = '/home';
  
  navItems: NavItem[] = [
    {
      id: 'activity',
      label: 'Activity',
      route: '/activity',
      icon: 'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'
    },
    {
      id: 'home',
      label: 'Home',
      route: '/home',
      icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
    },
    {
      id: 'leave',
      label: 'Leave',
      route: '/leave',
      icon: 'M9 11H7v6h2v-6zm4 0h-2v6h2v-6zm4 0h-2v6h2v-6zm2-7h-3V2h-2v2H8V2H6v2H3v2h18V4zm0 4H3v12h18V8z'
    },
    {
      id: 'payroll',
      label: 'Payroll',
      route: '/payroll',
      icon: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z'
    },
    {
      id: 'profile',
      label: 'Profile',
      route: '/profile',
      icon: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes to update active state
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
      });

    // Set initial route
    this.currentRoute = this.router.url || '/home';
  }

  onNavItemClick(item: NavItem): void {
    this.router.navigate([item.route]);
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }
}