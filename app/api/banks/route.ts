/**
 * GET /api/banks
 * 
 * Returns list of banks supported by Paystack for the specified country.
 * Used in the seller onboarding flow to populate bank selection dropdown.
 */

import { NextResponse } from 'next/server';
import { paystack } from '@/lib/paystack';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    // Default to Nigeria ('NG') as Paystack is primarily Nigerian
    // Supported countries: NG (Nigeria), GH (Ghana), ZA (South Africa), KE (Kenya)
    const country = url.searchParams.get('country') || 'south africa';
    console.log("Country: ", country);

    // Get banks for the specified country
    const banks = await paystack.misc.listBanks({
      country: country,
      perPage: 100,
    });
    console.log("Banks: ", banks);

    // Sort banks alphabetically by name
    const sortedBanks = banks.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      success: true,
      banks: sortedBanks.map(bank => ({
        id: bank.id,
        name: bank.name,
        code: bank.code,
        slug: bank.slug,
        country: bank.country,
        currency: bank.currency,
      })),
      country: country,
    });

  } catch (error: any) {
    console.error('Error fetching banks:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch banks',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
