import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AadhaarRequest {
  aadhaarNumber: string;
  otp?: string;
  action: 'send_otp' | 'verify_otp';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aadhaarNumber, otp, action }: AadhaarRequest = await req.json();

    console.log(`Aadhaar ${action} request for: ${aadhaarNumber}`);

    if (action === 'send_otp') {
      // Mock Aadhaar OTP sending
      // In production, this would integrate with UIDAI API
      console.log(`Sending OTP to Aadhaar number: ${aadhaarNumber}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'OTP sent successfully',
          transactionId: `mock-${Date.now()}`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'verify_otp') {
      // Mock OTP verification
      // In production, this would verify with UIDAI API
      console.log(`Verifying OTP: ${otp} for Aadhaar: ${aadhaarNumber}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock verification - in production, integrate with actual UIDAI API
      const isValid = otp === '123456' || otp?.length === 6; // Mock validation
      
      if (isValid) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Aadhaar verified successfully',
            verified: true,
            name: 'John Doe', // Mock data
            gender: 'M',
            dob: '1990-01-01'
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
            message: 'Invalid OTP',
            verified: false
          }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in verify-aadhaar function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});