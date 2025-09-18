import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PMCRequest {
  pmcLicense: string;
  pharmacistName: string;
  pharmacyName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pmcLicense, pharmacistName, pharmacyName }: PMCRequest = await req.json();

    console.log(`PMC license verification for: ${pharmacistName} at ${pharmacyName} with license: ${pmcLicense}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock PMC license verification
    // In production, this would integrate with Pharmacy Council API
    const isValidFormat = /^[A-Z0-9]{8,15}$/.test(pmcLicense);
    
    if (isValidFormat) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'PMC license verified successfully',
          verified: true,
          licenseDetails: {
            licenseNumber: pmcLicense,
            pharmacistName: pharmacistName,
            pharmacyName: pharmacyName,
            registrationDate: '2019-03-10',
            expiryDate: '2024-03-10',
            status: 'Active',
            pharmacyCouncil: 'Pharmacy Council of India',
            qualifications: ['D.Pharm', 'B.Pharm'],
            licenseType: 'Retail Pharmacy License'
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid PMC license format',
          verified: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error: any) {
    console.error('Error in verify-pmc-license function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});