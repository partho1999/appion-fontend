"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

function getCurrentYearMonth() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

// Convert JSON to CSV
function jsonToCSV(jsonData, reportType) {
  if (reportType === "monthly") {
    const { period, total_doctors, total_appointments, total_earnings, total_unique_patients, doctor_reports } = jsonData;
    
    let csv = "Period,Total Doctors,Total Appointments,Total Earnings,Total Unique Patients\n";
    csv += `${period},${total_doctors},${total_appointments},${total_earnings},${total_unique_patients}\n\n`;
    
    csv += "Doctor Reports\n";
    csv += "Doctor ID,Doctor Name,Specialization,Total Appointments,Total Earnings,Total Patients,Consultation Fee\n";
    
    doctor_reports.forEach(doctor => {
      csv += `${doctor.doctor_id},"${doctor.doctor_name}",${doctor.specialization},${doctor.total_appointments},${doctor.total_earnings},${doctor.total_patients},${doctor.consultation_fee}\n`;
    });
    
    return csv;
  } else if (reportType === "doctor") {
    const { doctor_id, doctor_name, specialization, consultation_fee, total_appointments, completed_appointments, pending_appointments, cancelled_appointments, total_earnings, unique_patients, period } = jsonData;
    
    let csv = "Doctor Report\n";
    csv += "Doctor ID,Doctor Name,Specialization,Consultation Fee\n";
    csv += `${doctor_id},"${doctor_name}",${specialization},${consultation_fee}\n\n`;
    
    csv += "Appointment Statistics\n";
    csv += "Total Appointments,Completed Appointments,Pending Appointments,Cancelled Appointments,Total Earnings,Unique Patients\n";
    csv += `${total_appointments},${completed_appointments},${pending_appointments},${cancelled_appointments},${total_earnings},${unique_patients}\n\n`;
    
    csv += "Period\n";
    csv += "Start Date,End Date\n";
    csv += `${period.start_date.split('T')[0]},${period.end_date.split('T')[0]}\n`;
    
    return csv;
  }
  
  return "";
}

export function ReportsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  // Monthly report state
  const [year, setYear] = useState(getCurrentYearMonth().year);
  const [month, setMonth] = useState(getCurrentYearMonth().month);
  // Doctor report state
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (user && token && user.role === "admin") {
      fetchDoctors();
      setLoading(false);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user, token]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/v1/admin/doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDoctors(data.data || []);
      }
    } catch (error) {
      // ignore
    }
  };

  const downloadCSV = async (url, filename, reportType) => {
    setDownloading(true);
    try {
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const jsonData = await response.json();
        const csvContent = jsonToCSV(jsonData.data, reportType);
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast({ title: "Success", description: "Report downloaded" });
      } else {
        toast({ title: "Error", description: "Failed to download report", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to download report", variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") {
    return <div className="text-center py-12">Not authorized. Only admins can view this page.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Monthly Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col sm:flex-row gap-4 items-end"
            onSubmit={e => {
              e.preventDefault();
              const url = `http://localhost:8000/api/v1/admin/reports/monthly?year=${year}&month=${month}`;
              downloadCSV(url, `monthly_report_${year}_${month}.csv`, "monthly");
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <Input
                type="number"
                min="2000"
                max="2100"
                value={year}
                onChange={e => setYear(e.target.value)}
                required
                className="w-28"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <Input
                type="number"
                min="1"
                max="12"
                value={month}
                onChange={e => setMonth(e.target.value)}
                required
                className="w-20"
              />
            </div>
            <Button type="submit" disabled={downloading} className="mt-6">
              {downloading ? "Downloading..." : "Download CSV"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Doctor Report</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col sm:flex-row gap-4 items-end"
            onSubmit={e => {
              e.preventDefault();
              if (!selectedDoctor || !startDate || !endDate) {
                toast({ title: "Error", description: "Please select doctor and date range", variant: "destructive" });
                return;
              }
              const url = `http://localhost:8000/api/v1/admin/reports/doctor/${selectedDoctor}?start_date=${startDate}&end_date=${endDate}`;
              downloadCSV(url, `doctor_report_${selectedDoctor}_${startDate}_${endDate}.csv`, "doctor");
            }}
          >
            <div>
              <label className="block text-sm font-medium mb-1">Doctor</label>
              <select
                className="w-48 border rounded px-2 py-2"
                value={selectedDoctor}
                onChange={e => setSelectedDoctor(e.target.value)}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                className="w-40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                className="w-40"
              />
            </div>
            <Button type="submit" disabled={downloading} className="mt-6">
              {downloading ? "Downloading..." : "Download CSV"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 