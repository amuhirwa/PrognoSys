import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  User,
  ChevronRight,
} from "lucide-react";
import { api } from "@/utils/axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const PatientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const response = await api().get("patients/");
      console.log(response.data);
      setPatients(response.data);
    } catch (error) {
      toast.error("Failed to fetch patients");
      console.error("Error fetching patients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = patient.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (showNewPatientForm) {
    return (
      <NewPatientForm
        onBack={() => {
          setShowNewPatientForm(false);
          fetchPatients(); // Refresh the list after adding a new patient
        }}
      />
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-8">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:flex-1 sm:max-w-md relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            className="pl-10 pr-4 py-2 w-full rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <select
            className="px-4 py-2 w-full sm:w-auto rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setShowNewPatientForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Patient
          </Button>
        </div>
      </div>

      {/* Patient List Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <User className="mr-2 h-5 w-5 text-blue-500" />
            Patients ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col cursor-pointer sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-4"
                  onClick={() => navigate(`/patient/${patient.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">{patient.name}</p>
                      <p className="text-sm text-gray-500">
                        {patient.age} years • {patient.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{patient.created_at}</p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm
                      ${
                        patient.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        patient.status === "Inactive"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }
                    `}
                    >
                      {patient.status}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => navigate(`/patient/${patient.id}`)}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const NewPatientForm = ({ onBack }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: "",
    medicalHistory: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const patientData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phoneNumber: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        password: "tempPassword123",
        userRole: "Patient",
      };

      // Register the user first
      const response = await api().post("register/", patientData);

      if (response.status === 201) {
        const profileData = {
          age: calculateAge(formData.dateOfBirth),
          emergency_contact: formData.emergencyContact,
          medical_history: formData.medicalHistory,
          user: response.data.user,
        };

        await api().post("create-patient-profile/", profileData);

        toast.success("Patient created successfully");
        onBack();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create patient");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const GenderChoices = {
    Male: "Male",
    Female: "Female",
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  return (
    <div className="flex-1 p-4 sm:p-8">
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
        Back to Patient List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Plus className="mr-2 h-5 w-5 text-blue-500" />
            Add New Patient
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Gender</option>
                    {Object.values(GenderChoices).map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Medical History (Optional)
                  </label>
                  <textarea
                    name="medicalHistory"
                    rows="3"
                    className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Add Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default {
  PatientList,
  NewPatientForm,
};
