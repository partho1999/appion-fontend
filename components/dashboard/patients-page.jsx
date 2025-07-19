"use client";

import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export function PatientsPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (user && token && user.role === "admin") {
      fetchPatients();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [user, token]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/v1/admin/patients?skip=0&limit=10", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data.data || []);
      } else {
        toast({ title: "Error", description: "Failed to fetch patients", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch patients", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return <div className="text-center py-12">Not authorized. Only admins can view this page.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Manage Patients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No patients found.</td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{patient.full_name}</td>
                      <td className="px-4 py-2">{patient.email}</td>
                      <td className="px-4 py-2">{patient.mobile}</td>
                      <td className="px-4 py-2">
                        {patient.is_active ? (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Active</span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">Inactive</span>
                        )}
                      </td>
                      <td className="px-4 py-2">{new Date(patient.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 