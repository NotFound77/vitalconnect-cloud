import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IMRRequest {
  imrLicense: string;
  doctorName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imrLicense, doctorName }: IMRRequest = await req.json();

    console.log(`IMR license verification for: ${doctorName} with license: ${imrLicense}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock IMR license verification
    // In production, this would integrate with Indian Medical Registry API
    const isValidFormat = /^[A-Z0-9]{8,15}$/.test(imrLicense);
    
    if (isValidFormat) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'IMR license verified successfully',
          verified: true,
          licenseDetails: {
            licenseNumber: imrLicense,
            doctorName: doctorName,
            registrationDate: '2020-01-15',
            expiryDate: '2025-01-15',
            status: 'Active',
            medicalCouncil: 'Medical Council of India',
            qualifications: ['MBBS', 'MD'],
            specialization: 'General Medicine'
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
          message: 'Invalid IMR license format',
          verified: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error: any) {
    console.error('Error in verify-imr-license function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});