"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  User,
  // Calendar,
  FileText,
  Phone,
  Mail,
  // Building,
  // GraduationCap,
} from "lucide-react";

interface TherapistApplication {
  id: string;
  therapistId: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: {
    houseNumber: string;
    streetName: string;
    city: string;
  };
  gender: string;
  licenseNumber: string;
  primarySpecialty: string;
  yearsOfExperience: string;
  highestEducation: string;
  institution: string;
  adhdExperience: string;
  documents: {
    professionalLicense: { id: string; name: string; originalName: string; url: string }[];
    educationalCertificates: { id: string; name: string; originalName: string; url: string }[];
    additionalCertifications: { id: string; name: string; originalName: string; url: string }[];
  };
  reference: {
    firstName: string;
    lastName: string;
    professionalTitle: string;
    phoneNumber: string;
    email: string;
  } | null;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export default function ManagerApplicationsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<TherapistApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TherapistApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] =
    useState<TherapistApplication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (statusFilter !== "all") {
        searchParams.set("status", statusFilter.toUpperCase());
      }
      if (searchTerm) {
        searchParams.set("search", searchTerm);
      }

      const response = await fetch(`/api/manager/verification-requests?${searchParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Handle error - maybe show a toast notification
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchApplications();
    }
  }, [session, fetchApplications]);

  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );

      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/manager/verification-requests/${applicationId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve application');
      }

      // Refresh applications list
      await fetchApplications();
      alert("Application approved successfully!");
    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("Failed to approve application. Please try again.");
    }
  };

  const handleReject = async (applicationId: string, reason: string) => {
    try {
      const response = await fetch(`/api/manager/verification-requests/${applicationId}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          reviewNotes: reason
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject application');
      }

      setShowReviewModal(false);
      setRejectionReason("");

      // Refresh applications list
      await fetchApplications();
      alert("Application rejected.");
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Failed to reject application. Please try again.");
    }
  };



  const handleDownloadDocument = async (url: string, fileName: string) => {
    try {
      // Fetch the document as a blob
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary link to download the document
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSpecialtyDisplay = (specialty: string) => {
    return specialty
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getExperienceDisplay = (experience: string) => {
    return experience.split("-").join(" ").toUpperCase();
  };

  const getEducationDisplay = (education: string) => {
    switch (education) {
      case "doctorate":
        return "Doctorate";
      case "phd":
        return "PhD";
      case "masters-degree":
        return "Master's Degree";
      case "bachelors-degree":
        return "Bachelor's Degree";
      default:
        return education;
    }
  };

  const ApplicationCard = ({
    application,
  }: {
    application: TherapistApplication;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              {application.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {application.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                {application.phone}
              </span>
            </div>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">License:</span>{" "}
              {application.licenseNumber}
            </div>
            <div>
              <span className="font-medium">Specialty:</span>{" "}
              {getSpecialtyDisplay(application.primarySpecialty)}
            </div>
            <div>
              <span className="font-medium">Experience:</span>{" "}
              {getExperienceDisplay(application.yearsOfExperience)}
            </div>
            <div>
              <span className="font-medium">Education:</span>{" "}
              {getEducationDisplay(application.highestEducation)}
            </div>
          </div>

          <div className="text-sm">
            <span className="font-medium">Institution:</span>{" "}
            {application.institution}
          </div>

          <div className="text-xs text-muted-foreground">
            Submitted: {formatDate(application.submittedAt)}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedApplication(application)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>

            {application.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(application.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedApplication(application);
                    setShowReviewModal(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ApplicationDetailsModal = () => {
    if (!selectedApplication) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">
              Application Details - {selectedApplication.name}
            </h2>
            <Button
              variant="outline"
              onClick={() => setSelectedApplication(null)}
            >
              Close
            </Button>
          </div>

          <div className="p-6">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="professional">Professional</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="reference">Reference</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium">Full Name:</label>
                      <p>{selectedApplication.name}</p>
                    </div>
                    <div>
                      <label className="font-medium">Email:</label>
                      <p>{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="font-medium">Phone:</label>
                      <p>{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <label className="font-medium">Date of Birth:</label>
                      <p>
                        {new Date(
                          selectedApplication.dateOfBirth
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium">Gender:</label>
                      <p className="capitalize">{selectedApplication.gender}</p>
                    </div>
                    <div>
                      <label className="font-medium">Address:</label>
                      <p>
                        {selectedApplication.address.houseNumber}{" "}
                        {selectedApplication.address.streetName},{" "}
                        {selectedApplication.address.city}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium">License Number:</label>
                        <p>{selectedApplication.licenseNumber}</p>
                      </div>
                      <div>
                        <label className="font-medium">
                          Primary Specialty:
                        </label>
                        <p>
                          {getSpecialtyDisplay(
                            selectedApplication.primarySpecialty
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium">
                          Years of Experience:
                        </label>
                        <p>
                          {getExperienceDisplay(
                            selectedApplication.yearsOfExperience
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="font-medium">
                          Highest Education:
                        </label>
                        <p>
                          {getEducationDisplay(
                            selectedApplication.highestEducation
                          )}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <label className="font-medium">Institution:</label>
                        <p>{selectedApplication.institution}</p>
                      </div>
                    </div>
                    <div>
                      <label className="font-medium">ADHD Experience:</label>
                      <p className="mt-2 p-3 bg-muted rounded-md">
                        {selectedApplication.adhdExperience}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Professional License</h4>
                      {selectedApplication.documents.professionalLicense.map(
                        (doc, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted rounded"
                          >
                            <FileText className="w-4 h-4" />
                            <span>{doc.originalName || doc.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                              onClick={() => handleDownloadDocument(doc.url, doc.originalName || doc.name)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        )
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">
                        Educational Certificates
                      </h4>
                      {selectedApplication.documents.educationalCertificates.map(
                        (doc, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-muted rounded"
                          >
                            <FileText className="w-4 h-4" />
                            <span>{doc.originalName || doc.name}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                              onClick={() => handleDownloadDocument(doc.url, doc.originalName || doc.name)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        )
                      )}
                    </div>

                    {selectedApplication.documents.additionalCertifications
                      .length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">
                          Additional Certifications
                        </h4>
                        {selectedApplication.documents.additionalCertifications.map(
                          (doc, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-muted rounded"
                            >
                              <FileText className="w-4 h-4" />
                              <span>{doc.originalName || doc.name}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={() => handleDownloadDocument(doc.url, doc.originalName || doc.name)}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reference" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Professional Reference</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {selectedApplication.reference ? (
                      <>
                        <div>
                          <label className="font-medium">Name:</label>
                          <p>
                            {selectedApplication.reference.firstName}{" "}
                            {selectedApplication.reference.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="font-medium">Professional Title:</label>
                          <p>{selectedApplication.reference.professionalTitle}</p>
                        </div>
                        <div>
                          <label className="font-medium">Phone Number:</label>
                          <p>{selectedApplication.reference.phoneNumber}</p>
                        </div>
                        <div>
                          <label className="font-medium">Email:</label>
                          <p>{selectedApplication.reference.email}</p>
                        </div>
                      </>
                    ) : (
                      <p className="col-span-2 text-muted-foreground">No reference information provided</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {selectedApplication.status === "pending" && (
              <div className="flex gap-4 mt-6 pt-6 border-t">
                <Button
                  onClick={() => handleApprove(selectedApplication.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowReviewModal(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RejectModal = () => {
    if (!showReviewModal || !selectedApplication) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <h3 className="text-lg font-bold mb-4">Reject Application</h3>
          <p className="text-muted-foreground mb-4">
            Please provide a reason for rejecting {selectedApplication.name}&apos;s
            application:
          </p>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full p-3 border rounded-md min-h-[100px] mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={4}
          />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowReviewModal(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                handleReject(selectedApplication.id, rejectionReason)
              }
              disabled={!rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter((app) => app.status === "pending").length,
      approved: applications.filter((app) => app.status === "approved").length,
      rejected: applications.filter((app) => app.status === "rejected").length,
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Therapist Applications
              </h1>
              <p className="text-muted-foreground">
                Review and manage therapist verification requests
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
              <div className="text-left">
                <div className="text-3xl font-bold text-[#8159A8]">{statusCounts.all}</div>
                <div className="text-gray-500 text-sm">Total</div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <User className="w-10 h-10 text-[#8159A8]" />
              </div>
            </Card>
            <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
              <div className="text-left">
                <div className="text-3xl font-bold text-[#8159A8]">{statusCounts.pending}</div>
                <div className="text-gray-500 text-sm">Pending</div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <Clock className="w-10 h-10 text-[#8159A8]" />
              </div>
            </Card>
            <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
              <div className="text-left">
                <div className="text-3xl font-bold text-[#8159A8]">{statusCounts.approved}</div>
                <div className="text-gray-500 text-sm">Approved</div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <CheckCircle className="w-10 h-10 text-[#8159A8]" />
              </div>
            </Card>
            <Card className="bg-primary-foreground p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-between min-w-[200px]">
              <div className="text-left">
                <div className="text-3xl font-bold text-[#8159A8]">{statusCounts.rejected}</div>
                <div className="text-gray-500 text-sm">Rejected</div>
              </div>
              <div className="flex-shrink-0 ml-4">
                <XCircle className="w-10 h-10 text-[#8159A8]" />
              </div>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or license number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid gap-6">
          {loading ? (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No applications found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <ApplicationDetailsModal />
      <RejectModal />
    </div>
  );
}
