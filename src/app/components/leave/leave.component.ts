import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface LeaveRecord {
  id: number;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  numberOfHours: number;
  leaveType: 'Absent' | 'Quota';
  reason: string;
}

interface LeaveStats {
  absentLeave: number;
  quotaLeave: number;
  totalLeave: number;
  workingHoursMissed: number;
}

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [
    SidebarComponent,
    NavbarComponent,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './leave.component.html',
  styleUrl: './leave.component.css'
})
export class LeaveComponent implements OnInit {
  leaveStats: LeaveStats = {
    absentLeave: 0,
    quotaLeave: 0,
    totalLeave: 0,
    workingHoursMissed: 0
  };

  leaveRecords: LeaveRecord[] = [];

  // Calendar properties
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  calendarDays: any[] = [];
  leaveDates: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const empId = localStorage.getItem('userid') || '';
    this.fetchLeaveData(empId);
  }

  fetchLeaveData(empId: string) {
    this.http.post<any>('http://localhost:3000/empleave', { empId }).subscribe({
      next: (response) => {
        console.log('API Response:', response);
        this.parseLeaveData(response);
        this.generateLeaveDates();
        this.generateCalendar();
      },
      error: (error) => {
        console.error('Error fetching leave data:', error);
        alert('Failed to load leave data.');
      }
    });
  }

  parseLeaveData(response: any) {
    this.leaveRecords = [];
    let recordId = 1;

    // Parse Absences (Absent Leave)
    if (response.EtAbsences?.item) {
      const absences = Array.isArray(response.EtAbsences.item) 
        ? response.EtAbsences.item 
        : [response.EtAbsences.item];

      absences.forEach((absence: any) => {
        this.leaveRecords.push({
          id: recordId++,
          startDate: absence.Begda,
          endDate: absence.Endda,
          numberOfDays: parseFloat(absence.Abwtg) || 0,
          numberOfHours: parseFloat(absence.Stdaz) || 0,
          leaveType: 'Absent',
          reason: absence.Reason || 'N/A'
        });
      });
    }

    // Parse Quotas (Quota Leave)
    if (response.EtQuotas?.item) {
      const quotas = Array.isArray(response.EtQuotas.item) 
        ? response.EtQuotas.item 
        : [response.EtQuotas.item];

      quotas.forEach((quota: any) => {
        this.leaveRecords.push({
          id: recordId++,
          startDate: quota.Begda,
          endDate: quota.Endda,
          numberOfDays: parseFloat(quota.Anzhl) || 0,
          numberOfHours: parseFloat(quota.Stdaz) || 0,
          leaveType: 'Quota',
          reason: quota.Reason || 'N/A'
        });
      });
    }

    // Set stats from API response (the 4 card values)
    this.leaveStats = {
      totalLeave: parseInt(response.EvDays?.toString().trim() || '0'),
      absentLeave: parseFloat(response.EvLeaveTaken?.toString().trim() || '0'),
      quotaLeave: parseFloat(response.EvTotalQuota?.toString().trim() || '0'),
      workingHoursMissed: parseFloat(response.EvHours?.toString().trim() || '0')
    };
  }

  generateLeaveDates() {
    this.leaveDates = [];
    this.leaveRecords.forEach(record => {
      const startDate = new Date(record.startDate);
      const endDate = new Date(record.endDate);
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = date.getFullYear() + '-' + 
                          String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                          String(date.getDate()).padStart(2, '0');
        this.leaveDates.push(dateString);
      }
    });
  }

  generateCalendar() {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    this.calendarDays = [];
    
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateString = date.getFullYear() + '-' + 
                        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(date.getDate()).padStart(2, '0');
      
      const isCurrentMonth = date.getMonth() === this.currentMonth;
      const isToday = dateString === todayString;
      const isLeaveDate = this.leaveDates.includes(dateString);

      this.calendarDays.push({
        date: date.getDate(),
        fullDate: dateString,
        isCurrentMonth,
        isToday,
        isLeaveDate
      });
    }
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  getLeaveTypeClass(leaveType: string): string {
    switch (leaveType.toLowerCase()) {
      case 'absent': return 'leave-type-absent';
      case 'quota': return 'leave-type-quota';
      default: return '';
    }
  }
}