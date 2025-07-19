"use client"

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export function SchedulePage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [form, setForm] = useState({
    available_timeslots: "",
    consultation_fee: "",
    experience_years: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user && token && user.role === "doctor") {
      fetchSchedule();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user, token]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/doctors/${user.id}/schedule`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.data);
        setForm({
          available_timeslots: data.data.available_timeslots?.join(", ") || "",
          consultation_fee: data.data.consultation_fee || "",
          experience_years: data.data.experience_years || "",
        });
      } else {
        toast({ title: "Error", description: "Failed to fetch schedule", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch schedule", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const body = {
        available_timeslots: form.available_timeslots,
        consultation_fee: parseFloat(form.consultation_fee),
        experience_years: parseInt(form.experience_years, 10),
      };
      const response = await fetch("http://localhost:8000/api/v1/doctors/schedule", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Schedule updated" });
        fetchSchedule();
      } else {
        toast({ title: "Error", description: "Failed to update schedule", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update schedule", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "doctor") {
    return <div className="text-center py-12">Not authorized. Only doctors can view this page.</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {schedule && (
            <div className="mb-6">
              <div><strong>Name:</strong> {schedule.doctor_name}</div>
              <div><strong>Specialization:</strong> {schedule.specialization}</div>
            </div>
          )}
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Available Timeslots (comma separated)</label>
              <Input
                name="available_timeslots"
                value={form.available_timeslots}
                onChange={handleChange}
                placeholder="09:00-12:00, 14:00-17:00"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Consultation Fee</label>
              <Input
                name="consultation_fee"
                type="number"
                value={form.consultation_fee}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Experience (years)</label>
              <Input
                name="experience_years"
                type="number"
                value={form.experience_years}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" disabled={updating}>{updating ? "Updating..." : "Update Schedule"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 