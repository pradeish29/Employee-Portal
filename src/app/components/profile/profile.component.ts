import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, HttpClientModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  activeTab = 'overview';
  
  userProfile = {
    name: 'Unknown',
    title: 'Unknown',
    code: 'Unknown',
    email: 'Unknown',
    phone: 'Unknown',
    location: 'Unknown',
    employeeId: 'Unknown',
    orgName: 'Unknown',
    employeeType: 'Unknown',
    status: 'offline',
    dateOfBirth: 'Unknown',
    gender: 'Unknown',
    address: 'Unknown',
    nationality: 'Unknown',
    orgAddress: 'Unknown',
    dateOfJoining: 'Unknown',
    jobId: 'Unknown',
    timezone: 'Unknown',
    workingHours: '9:00 AM - 6:00 PM'
  };

  statusOptions = [
    { value: 'available', label: 'Available', color: '#6bb700' },
    { value: 'busy', label: 'Busy', color: '#c4314b' },
    { value: 'away', label: 'Away', color: '#ffaa44' },
    { value: 'offline', label: 'Appear offline', color: '#8a8886' }
  ];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const empId = localStorage.getItem('userid') ;
    
    this.http.post<any>('http://localhost:3000/empprofile', { empId }).subscribe({
      next: data => {
        this.userProfile = {
          name: `${data.FirstName || 'Unknown'} ${data.LastName || ''}`.trim(),
          title: data.EmpSubTxt || 'Unknown',
          code: data.PersArea ||'Unknown',
          email: data.Email || `${data.FirstName}${data.LastName}@email.com`,
          phone: 'Unknown',
          location: `${data.ComCity || 'Unknown'}, ${data.ComCountryTxt || 'Unknown'}`,
          employeeId: data.Persno || 'Unknown',
          orgName: data.Company || 'Unknown',
          employeeType: data.EmpGroupTxt || 'Unknown',
          status: this.userProfile.status,
          dateOfBirth: this.formatDate(data.Dob) || 'Unknown',
          gender: data.GenderText || 'Unknown',
          address: this.formatAddress(data),
          nationality: data.NationalityTxt || 'Unknown',
          orgAddress: this.formatOrgAddress(data),
          dateOfJoining: this.formatDate(data.JoinDate) || 'Unknown',
          jobId: data.PostId || 'Unknown',
          timezone: 'Unknown',
          workingHours: '9:00 AM - 6:00 PM'
        };
        this.getTimezoneInfo();
      },
      error: err => {
        console.error('HTTP error:', err);
      }
    });
  }

  formatAddress(profile: any): string {
    const parts = [profile.Street, profile.City, profile.CountryTxt, profile.PinCode]
      .filter(part => part && part.trim());
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  }

  formatOrgAddress(profile: any): string {
    const parts = [profile.ComStreet, profile.ComCity, profile.ComCountryTxt, profile.CompPin]
      .filter(part => part && part.trim());
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'Unknown';
    try {
      return new Date(dateStr).toLocaleDateString('en-GB');
    } catch {
      return dateStr;
    }
  }

  getTimezoneInfo(): void {
    const location = this.userProfile.location;
    let apiUrl = `https://timezone.abstractapi.com/v1/current_time/?api_key=1844438e2860412eb0a2a19fe0ecacad&location=${encodeURIComponent(location)}`;
    
    this.http.get(apiUrl).subscribe({
      next: (response: any) => {
        if (response && response.timezone_name) {
          this.userProfile.timezone = `${response.timezone_name} (${response.timezone_abbreviation})`;
        } else {
          this.tryCountryOnly();
        }
      },
      error: () => this.tryCountryOnly()
    });
  }

  tryCountryOnly(): void {
    const country = this.userProfile.location.split(',').pop()?.trim();
    if (!country || country === 'Unknown') return;
    
    const apiUrl = `https://timezone.abstractapi.com/v1/current_time/?api_key=1844438e2860412eb0a2a19fe0ecacad&location=${encodeURIComponent(country)}`;
    
    this.http.get(apiUrl).subscribe({
      next: (response: any) => {
        if (response && response.timezone_name) {
          this.userProfile.timezone = `${response.timezone_name} (${response.timezone_abbreviation})`;
        }
      },
      error: (error) => console.error('Error getting timezone:', error)
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getCurrentStatusOption() {
    const savedStatus = localStorage.getItem('userStatus');
    if (savedStatus) {
      try {
        return JSON.parse(savedStatus);
      } catch (error) {
        console.error('Error parsing saved status:', error);
      }
    }
    return this.statusOptions.find(option => option.value === this.userProfile.status) || this.statusOptions[3];
  }

  signOut(): void {
    localStorage.clear()
    this.router.navigate(['/login']);
  }
}