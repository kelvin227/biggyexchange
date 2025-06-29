"use client";
/* eslint-disable */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { approvekyc, rejectkyc } from "@/functions/user";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";


interface KycRequest {
  id: string;
  FullName: string;
  country: string;
  IDNO: string;
  documentURL1: string;
  documentURL2?: string;
  Status: string;
  user: {
    email: string;
    [key: string]: any;
  };
  [key: string]: any;
}
export default function KycHolder({kyc} :{kyc: KycRequest[]}) {
  const [kycRequests] = useState<KycRequest[]>(kyc);
  const [FilteredKyc, setFilteredKyc] = useState<KycRequest[]>(kyc)
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const [showRejectModal, setShowRejectModal] = useState(false); // State to show/hide the rejection modal
  const [rejectionReason, setRejectionReason] = useState(""); // State to store the rejection reason

  const handleViewDetails = (request: KycRequest) => {
    setSelectedRequest(request);
  };


  const Approve = async ({ email }: { email: string }) => {
    try {
      const response = await approvekyc(email);
      if (response.success) {
        toast("KYC Approved successfully!");
      } else {
        toast("Failed to approve KYC request.");
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
    }
  };

  const Reject = async ({ email, reason }: { email: string; reason: string }) => {
    try {
      const response = await rejectkyc(email, reason);
      if (response.success) {
        console.log("KYC Rejected successfully!");
      } else {
        console.log("Failed to reject KYC request.");
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedRequest) return;

    try {
      await Reject({ email: selectedRequest.user.email, reason: rejectionReason });
      setShowRejectModal(false); // Close the modal after submission
      setRejectionReason(""); // Clear the rejection reason
    } catch (error) {
      console.error("Error submitting rejection reason:", error);
    }
  };
  
 // Filter wallet transactions by type
  const filterTransactions = (type: string | null) => {
    if (type) {
      const filtered = kycRequests.filter((stat: any) => stat.Status === type.toLowerCase() as "pending" | "approved");
      setFilteredKyc(filtered);
    } else {
      setFilteredKyc(kycRequests);
    }
  };
// ...existing imports and code...

return (
  <div className="max-w-6xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
    <h1 className="text-2xl font-bold mb-6 text-center">KYC Requests</h1>
{/* Desktop Filter Buttons */}
    <div className="hidden sm:flex justify-end mb-4 gap-4">
      <Button
        className="bg-gray-500 text-white px-4 py-2 rounded-md"
        onClick={() => filterTransactions(null)}
        disabled={!kyc || kyc.length === 0}
      >
        Show All
      </Button>
      <Button
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
        onClick={() => filterTransactions("pending")}
        disabled={!kyc || kyc.length === 0}
      >
        Show Pending KYC
      </Button>
      <Button
        className="bg-green-500 text-white px-4 py-2 rounded-md"
        onClick={() => filterTransactions("approved")}
        disabled={!kyc || kyc.length === 0}
      >
        Show Approved KYC
      </Button>
    </div>

    {/* Mobile Dropdown Filter */}
    <div className="flex sm:hidden justify-end mb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full bg-blue-500 text-white px-4 py-2 rounded-md">
            Filter KYC
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onClick={() => filterTransactions(null)}
            className="cursor-pointer"
          >
            Show All
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => filterTransactions("pending")}
            className="cursor-pointer"
          >
            Show Pending KYC
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => filterTransactions("approved")}
            className="cursor-pointer"
          >
            Show Approved KYC
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Rejection Modal */}
    {showRejectModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="light:bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Reject KYC Request</h2>
          <p className="mb-4">
            Please provide a reason for rejecting the KYC request for <strong>{selectedRequest?.FullName}</strong>.
          </p>
          <Input
            type="text"
            placeholder="Enter rejection reason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full mb-4"
          />
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-md"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectSubmit}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              disabled={!rejectionReason.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Mobile View */}
    <div className="block sm:hidden">
      {selectedRequest ? (
        <div className="p-4 light:bg-gray-50 border border-gray-300 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4">Full Details</h2>
          <p>
            <strong>Full Name:</strong> {selectedRequest.FullName}
          </p>
          <p>
            <strong>Email:</strong> {selectedRequest.user.email}
          </p>
          <p>
            <strong>Country:</strong> {selectedRequest.country}
          </p>
          <p>
            <strong>ID Card Number:</strong> {selectedRequest.IDNO}
          </p>
          <div className="mt-4">
            <strong>ID Card Front:</strong>
            <img src={selectedRequest.documentURL1} alt="ID Card Front" className="mt-2 w-full max-w-xs border rounded-md" />
          </div>
          <div className="mt-4">
            <strong>ID Card Back:</strong>
            <img src={selectedRequest.documentURL1} alt="ID Card Back" className="mt-2 w-full max-w-xs border rounded-md" />
          </div>
          <Button
            onClick={() => setSelectedRequest(null)}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md w-full"
          >
            Back to Requests
          </Button>
        </div>
      ) : FilteredKyc.length > 0 ? (
        <div className="space-y-4">
          {FilteredKyc.map((request: KycRequest) => (
            <div key={request.id} className="border rounded-lg shadow p-4 light:bg-white">
              <div className="mb-2">
                <span className="font-semibold">Full Name:</span> {request.FullName}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Email:</span> {request.user.email}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Country:</span> {request.country}
              </div>
              <div className="mb-2">
                <span className="font-semibold">ID Card Number:</span> {request.IDNO}
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  className={request.Status === "approved" ? "hidden" : "bg-green-500 text-white px-3 py-1 rounded-md"}
                  onClick={() => {
                    Approve({ email: request.user.email });
                  }}
                >
                  Approve
                </Button>
                <Button
                  className={request.Status === "approved" ? "hidden" : "bg-red-500 text-white px-3 py-1 rounded-md"}
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowRejectModal(true);
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleViewDetails(request)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md"
                >
                  View Full Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No KYC requests available</p>
      )}
    </div>

    {/* Desktop Table View */}
    <div className="hidden sm:block">
      {selectedRequest ? (
        <div className="p-6 light:bg-gray-50 border border-gray-300 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Full Details</h2>
          <p>
            <strong>Full Name:</strong> {selectedRequest.FullName}
          </p>
          <p>
            <strong>Email:</strong> {selectedRequest.user.email}
          </p>
          <p>
            <strong>Country:</strong> {selectedRequest.country}
          </p>
          <p>
            <strong>ID Card Number:</strong> {selectedRequest.IDNO}
          </p>
          <div className="mt-4">
            <strong>ID Card Front:</strong>
            <img src={selectedRequest.documentURL1} alt="ID Card Front" className="mt-2 w-full max-w-sm border rounded-md" />
          </div>
          <div className="mt-4">
            <strong>ID Card Back:</strong>
            <img src={selectedRequest.documentURL1} alt="ID Card Back" className="mt-2 w-full max-w-sm border rounded-md" />
          </div>
          <Button
            onClick={() => setSelectedRequest(null)}
            className="mt-6 bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Back to Requests
          </Button>
        </div>
      ) : FilteredKyc.length > 0 ? (
        <table className="min-w-full light:bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead>
            <tr className="dark:bg-gray-500 light:bg-gray-100">
              <th className="p-4 text-left">Full Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Country</th>
              <th className="p-4 text-left">ID Card Number</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {FilteredKyc.map((request: KycRequest) => (
              <tr key={request.id}>
                <td className="p-4 border-b">{request.FullName}</td>
                <td className="p-4 border-b">{request.user.email}</td>
                <td className="p-4 border-b">{request.country}</td>
                <td className="p-4 border-b">{request.IDNO}</td>
                <td className="p-4 border-b flex gap-2">
                  <Button
                    className={request.Status === "approved" ? "hidden" : "bg-green-500 text-white px-4 py-2 rounded-md"}
                    onClick={() => {
                      Approve({ email: request.user.email });
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    className={request.Status === "approved" ? "hidden" : "bg-red-500 text-white px-4 py-2 rounded-md"}
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleViewDetails(request)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    View Full Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center">No KYC requests available</p>
      )}
    </div>
  </div>
);
}