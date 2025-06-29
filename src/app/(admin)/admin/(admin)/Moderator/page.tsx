"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { addModerator } from "@/functions/user";

const AddModerator = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "moderator", // Default role
  });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await addModerator(formData.email, formData.name, formData.role); // Call the function to add moderator

      if (response.success) {
        console.log(response.message);
        toast.success(response.message || "Moderator added successfully");
        setFormData({ name: "", email: "", role: "moderator" }); // Reset form
      }else {
        console.log(response.message);
        toast.error(response.message || "Failed to add moderator");
      }

    } catch (error) {
      console.error("Error adding moderator:", error);
      toast.error("Failed to add moderator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 light:bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Add Moderator</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium light:text-gray-700">
            Name
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Enter moderator's name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full"
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium light:text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter moderator's email"
            value={formData.email}
            onChange={handleInputChange}
            className="mt-1 block w-full"
            required
          />
        </div>

        {/* Role Field */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium light:text-gray-700">
            Role
          </label>
          <Input
            id="role"
            name="role"
            type="text"
            value={formData.role}
            onChange={handleInputChange}
            className="mt-1 block w-full"
            disabled // Role is fixed as "moderator"
          />
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Moderator"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddModerator;