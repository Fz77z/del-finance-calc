"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [earnings, setEarnings] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wages, setWages] = useState<number | null>(null);
  const [dividends, setDividends] = useState<number | null>(null);

  const handleCalculate = async () => {
    if (!earnings) {
      setError("Please enter earnings.");
      resetResults();
      return;
    }

    const totalEarnings = parseFloat(earnings);
    if (isNaN(totalEarnings)) {
      setError("Invalid earnings value.");
      resetResults();
      return;
    }

    try {
      const response = await fetch(
        `/api/calculateEarnings?earnings=${totalEarnings}`
      );
      const data = await response.json();

      if (response.ok) {
        setResult(data.finalEarnings);
        setMessage(data.message);
        setError(null);

        if (data.finalEarnings < 758) {
          setMessage(
            "Earnings after deduction are too low to use this calculator."
          );
          setWages(null);
          setDividends(null);
        } else if (data.wages !== undefined && data.dividends !== undefined) {
          setWages(data.wages);
          setDividends(data.dividends);
        } else {
          resetResults();
        }
      } else {
        setError(data.error || "An error occurred");
        resetResults();
      }
    } catch (error) {
      setError("An error occurred while fetching the data.");
      resetResults();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEarnings(value.replace(/,/g, ""));
  };

  const resetResults = () => {
    setResult(null);
    setMessage(null);
    setWages(null);
    setDividends(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl mb-8 text-center">Hello Adele,</h1>
      <div className="w-full max-w-md mx-auto">
        <input
          type="text"
          value={earnings}
          onChange={handleChange}
          placeholder="Enter total earnings"
          className="w-full px-4 py-2 mb-4 bg-gray-800 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleCalculate}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded"
        >
          Calculate
        </button>
      </div>
      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      {result !== null && (
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-md">
            Final Earnings after 20% deduction: {result.toFixed(2)}
          </p>
          <p className="text-gray-400">{message}</p>
          {wages !== null && dividends !== null && (
            <div className="mt-4">
              <p className="text-green-400 text-lg">
                Wages: {wages.toFixed(2)}
              </p>
              <p className="text-green-400 text-lg">
                Dividends: {dividends.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
