import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface PayrollData {
  cost_center: string;
  pay_scale: {
    type: string;
    area: string;
    group: string;
    level: string;
  };
  currency: string;
  basic_salary: string;
  annual_salary: string;
  wage_type: string;
  capacity_utilization: string;
  work_hours: string;
  Bank: string;
  Bank_code: string;
  Acc_no: string;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.css'
})
export class PayrollComponent implements OnInit {
  
  payrollData: PayrollData = {
    cost_center: "",
    pay_scale: { type: "0", area: "0", group: "0", level: "0" },
    currency: "INR",
    basic_salary: "0.00",
    annual_salary: "0.00",
    wage_type: "",
    capacity_utilization: "0.00",
    work_hours: "0",
    Bank: "",
    Bank_code: "",
    Acc_no: ""
  };

  loading = false;
  error: string | null = null;
  
  // Dropdown selections
  selectedMonth: string = new Date().getMonth().toString();
  selectedYear: string = new Date().getFullYear().toString();
  
  // PDF preview
  pdfPreviewUrl: SafeResourceUrl | null = null;
  showPdfPreview = false;
  
  // Dropdown options
  months = [
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];
  
  years = ['2024', '2025'];
  
  private readonly empId = localStorage.getItem('userid') || '';
  private readonly apiUrl = 'http://localhost:3000';
  private readonly headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  // Currency symbol mapping
  private readonly currencySymbols: { [key: string]: string } = {
    'INR': '₹ ',
    'USD': '$ ',
    'EUR': '€ ',
    'GBP': '£ ',
    'JPY': '¥ ',
    'CAD': 'C$ ',
    'AUD': 'A$ ',
    'SGD': 'S$ '
  };

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.loadPayrollData();
  }

  loadPayrollData() {
    this.setLoading(true);
    
    this.http.post<any>(`${this.apiUrl}/emppayroll`, 
      { empId: this.empId }, 
      { headers: this.headers }
    ).subscribe({
      next: (data) => {
        this.payrollData = {
          cost_center: data.Costcenter || "",
          pay_scale: {
            type: data.Paytype || "",
            area: data.Payarea || "",
            group: data.Paygroup || "",
            level: data.Paylevel || "0"
          },
          currency: data.Curr || "INR",
          basic_salary: data.Salary || "0.00",
          annual_salary: data.Annual || "0.00",
          wage_type: data.Wagetype || "",
          capacity_utilization: data.Capacity || "0.00",
          work_hours: data.Workhrs || "0",
          Bank: data.BankName || "HSBC",
          Bank_code: data.BankKey || "A1234",
          Acc_no: data.AccNo || "3643628"
        };
        this.setLoading(false);
      },
      error: (error) => this.handleError('Failed to load payroll data', error)
    });
  }

  // Helper method to get selected month label
  getSelectedMonthLabel(): string {
    const selectedMonth = this.months.find(m => m.value === this.selectedMonth);
    return selectedMonth ? selectedMonth.label : 'Unknown';
  }

  previewPayslip() {
    this.setLoading(true);
    
    const requestData = {
      empId: this.empId,
      month: this.selectedMonth,
      year: this.selectedYear
    };
    
    this.http.post(`${this.apiUrl}/emppayslip`, 
      requestData, 
      { headers: this.headers, responseType: 'blob' }
    ).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.showPdfPreview = true;
        this.setLoading(false);
      },
      error: (error) => this.handleError('Failed to preview payslip', error)
    });
  }

  downloadPayslip() {
    this.setLoading(true);
    
    const requestData = {
      empId: this.empId,
      month: this.selectedMonth,
      year: this.selectedYear
    };
    
    this.http.post(`${this.apiUrl}/emppayslip`, 
      requestData, 
      { headers: this.headers, responseType: 'blob' }
    ).subscribe({
      next: (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const monthName = this.getSelectedMonthLabel();
        link.download = `Payslip_${this.empId.padStart(8, '0')}_${monthName}_${this.selectedYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.setLoading(false);
      },
      error: (error) => this.handleError('Failed to download payslip', error)
    });
  }

  closePdfPreview() {
    this.showPdfPreview = false;
    if (this.pdfPreviewUrl) {
      // Clean up the blob URL
      const url = (this.pdfPreviewUrl as any).changingThisBreaksApplicationSecurity;
      if (url) {
        URL.revokeObjectURL(url);
      }
      this.pdfPreviewUrl = null;
    }
  }

  emailPayslip() {
    if (!this.pdfPreviewUrl) {
      this.error = 'Please preview the payslip first before emailing.';
      return;
    }
    
    const monthName = this.getSelectedMonthLabel();
    const subject = `Payslip for ${monthName} ${this.selectedYear}`;
    const body = `Dear Sir/Madam,

  Please find attached my payslip for ${monthName} ${this.selectedYear}.

  Employee ID: ${this.empId}
  Month: ${monthName}
  Year: ${this.selectedYear}

  Thank you.

  Best regards`;
    
    // Open Gmail compose window instead of default mail client
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
  }

  formatCurrency(amount: string): string {
    if (!amount || amount === "0.00") {
      return `${this.getCurrencySymbol()}0.00`;
    }
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) {
      return `${this.getCurrencySymbol()}0.00`;
    }

    // Try to use Intl.NumberFormat if currency is supported
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: this.payrollData.currency
      }).format(numAmount);
    } catch {
      // Fallback to manual formatting
      return `${this.getCurrencySymbol()}${numAmount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`;
    }
  }

  private handleError(message: string, error: any) {
    console.error(message, error);
    this.error = `${message}. Please try again.`;
    this.setLoading(false);
  }

  private setLoading(loading: boolean) {
    this.loading = loading;
    if (loading) this.error = null;
  }

  private getCurrencySymbol(): string {
    return this.currencySymbols[this.payrollData.currency] || this.payrollData.currency;
  }
}