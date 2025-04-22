// app/api/calculateEarnings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { multiply, subtract } from "lodash";
import { z } from "zod";

// Zod schema for validating the earnings parameter
const earningsSchema = z.object({
  earnings: z
    .string()
    .transform((val) => val.replace(/,/g, ""))
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Invalid earnings value",
    }),
});

// Function to subtract 20% from total earnings
function subtractTwentyPercent(totalEarnings: number): number {
  const percentage = 0.2;
  const deduction = multiply(totalEarnings, percentage);
  const finalEarnings = subtract(totalEarnings, deduction);
  return finalEarnings;
}

// API route handler
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const earningsParam = searchParams.get("earnings");

  // Validate earnings parameter using zod schema
  const result = earningsSchema.safeParse({ earnings: earningsParam });

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.errors[0].message },
      { status: 400 }
    );
  }

  const totalEarnings = result.data.earnings;

  // Calculate the final earnings after subtracting 20%
  const finalEarnings = subtractTwentyPercent(totalEarnings);

  // Define constant wages and cap for dividends
  const wages = 417.0;
  const dividendsCap = 3813.0;

  // Check if earnings are too low to use the calculator
  if (finalEarnings < wages) {
    return NextResponse.json(
      { error: "Earnings after deduction are too low to use this calculator." },
      { status: 400 }
    );
  }

  // Determine message and breakdown based on final earnings
  let message;
  let dividends;
  if (finalEarnings >= dividendsCap) {
    message = "The earnings after deduction are above 4000.";
    dividends = dividendsCap - wages; // Dividends are capped at 4000 - wages
  } else {
    message = "The earnings after deduction are below 4000.";
    dividends = finalEarnings - wages; // Remaining amount after wages
  }

  // Ensure dividends are not negative
  dividends = Math.max(dividends, 0);

  return NextResponse.json({
    totalEarnings,
    finalEarnings,
    message,
    wages,
    dividends,
  });
}
