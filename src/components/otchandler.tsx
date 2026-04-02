"use client";

import { useEffect, useMemo, useState } from "react";

type Bank = {
  name: string;
  code: string;
};

type Props = {
  userId: string;
};

export default function BankDetailsForm({ userId }: Props) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load banks on mount
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setLoadingBanks(true);
        setError("");

        const response = await fetch("/api/bank");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load banks");
        }

        setBanks(data.banks || []);
      } catch (err: any) {
        setError(err.message || "Could not load banks");
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  // Find selected bank object
  const selectedBank = useMemo(() => {
    return banks.find((bank) => bank.code === bankCode) || null;
  }, [banks, bankCode]);

  // Keep bankName in sync with selected bank
  useEffect(() => {
    setBankName(selectedBank?.name || "");
  }, [selectedBank]);

  // Resolve account when account number is complete
  useEffect(() => {
    const resolveAccount = async () => {
      if (!bankCode || accountNumber.length !== 10) {
        setAccountName("");
        return;
      }

      try {
        setResolving(true);
        setError("");
        setSuccess("");
        setAccountName("");

        const response = await fetch("/api/bank/resolve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountNumber,
            bankCode,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not resolve account");
        }

        setAccountName(data.accountName);
      } catch (err: any) {
        setAccountName("");
        setError(err.message || "Failed to resolve account");
      } finally {
        setResolving(false);
      }
    };

    const timeout = setTimeout(() => {
      resolveAccount();
    }, 500);

    return () => clearTimeout(timeout);
  }, [accountNumber, bankCode]);

  const handleAccountNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(value);
    setAccountName("");
    setError("");
    setSuccess("");
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBankCode(e.target.value);
    setAccountName("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      setError("User ID is missing");
      return;
    }

    if (!bankCode || !bankName || !accountNumber || !accountName) {
      setError("Please complete the bank details form");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/account-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          bankName,
          bankCode,
          accountNumber,
          accountName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save bank details");
      }

      setSuccess("Bank details saved successfully");
    } catch (err: any) {
      setError(err.message || "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center">
          <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-4 rounded-2xl border p-6 shadow-sm"
    >
      <div>
        <h2 className="text-xl font-semibold">Bank Details</h2>
        <p className="text-sm text-gray-500">
          Select your bank and enter your account number.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="bank" className="block text-sm font-medium">
          Bank
        </label>
        <select
          id="bank"
          value={bankCode}
          onChange={handleBankChange}
          className="w-full rounded-lg border px-3 py-2 outline-none"
          disabled={loadingBanks}
        >
          <option value="" className="dark:bg-black">
            {loadingBanks ? "Loading banks..." : "Select bank"}
          </option>
          {banks.map((bank) => (
            <option key={bank.name} value={bank.code} className="dark:bg-black">
              {bank.name}{bank.code}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="accountNumber" className="block text-sm font-medium">
          Account Number
        </label>
        <input
          id="accountNumber"
          type="text"
          inputMode="numeric"
          value={accountNumber}
          onChange={handleAccountNumberChange}
          placeholder="Enter 10-digit account number"
          className="w-full rounded-lg border px-3 py-2 outline-none"
          maxLength={10}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="accountName" className="block text-sm font-medium">
          Account Name
        </label>
        <input
          id="accountName"
          type="text"
          value={
            resolving
              ? "Resolving account name..."
              : accountName
          }
          readOnly
          className="w-full rounded-lg border px-3 py-2 outline-none"
          placeholder="Account name will appear here"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-600">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={saving || resolving || !accountName}
        className="rounded-lg px-4 py-2 disabled:opacity-50 bg-blue-500"
      >
        {saving ? "Saving..." : "Save Bank Details"}
      </button>
    </form>
    </div>

  );
}