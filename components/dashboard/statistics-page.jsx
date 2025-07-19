"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { TrendingUp, CheckCircle, Clock, XCircle, Users, DollarSign, Calendar } from "lucide-react";

const statsConfig = [
  {
    key: "total_appointments",
    label: "Total Appointments",
    icon: Calendar,
    color: "bg-blue-100 text-blue-800",
  },
  {
    key: "completed_appointments",
    label: "Completed",
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
  },
  {
    key: "pending_appointments",
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    key: "cancelled_appointments",
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-100 text-red-800",
  },
  {
    key: "total_earnings",
    label: "Total Earnings",
    icon: DollarSign,
    color: "bg-purple-100 text-purple-800",
    prefix: "₹",
  },
  {
    key: "unique_patients",
    label: "Unique Patients",
    icon: Users,
    color: "bg-cyan-100 text-cyan-800",
  },
  {
    key: "consultation_fee",
    label: "Consultation Fee",
    icon: TrendingUp,
    color: "bg-pink-100 text-pink-800",
    prefix: "₹",
  },
];

export function StatisticsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user && token && user.role === "doctor") {
      fetchStats();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user, token]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/doctors/statistics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        toast({ title: "Error", description: "Failed to fetch statistics", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch statistics", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "doctor") {
    return <div className="text-center py-12">Not authorized. Only doctors can view this page.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {statsConfig.map(({ key, label, icon: Icon, color, prefix }) => (
                <div
                  key={key}
                  className={`flex items-center gap-4 rounded-lg shadow-sm p-5 ${color} bg-opacity-60`}
                >
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 opacity-80" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{label}</div>
                    <div className="text-2xl font-bold">
                      {prefix || ""}
                      {stats[key] !== undefined ? stats[key] : "-"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No statistics available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 