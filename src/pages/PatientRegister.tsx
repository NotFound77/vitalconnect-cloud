import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Shield, QrCode } from 'lucide-react';

const patientSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  age: z.number().min(1).max(120, 'Invalid age'),
  sex: z.enum(['male', 'female', 'other']),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
});

type PatientFormData = z.infer<typeof patientSchema>;

const PatientRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      dateOfBirth: '',
      age: 0,
      sex: 'male',
      address: '',
      aadhaarNumber: '',
    },
  });

  const onSubmit = async (data: PatientFormData) => {
     setLoading(true);
    try {
      /* // Step 1: Create auth user
      const { error: authError } = await signUp(data.email, data.password);
      if (authError) {
        toast({
          variant: 'destructive',
          title: 'Registration Error',
          description: authError.message,
        });
        return;
      }

      // Wait briefly for auth state to update
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Failed to get user after signup');
      }

      // Step 2: Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          user_type: 'patient',
          name: data.name,
          phone: data.phone,
          qr_code: `patient-${Date.now()}`, // Temporary QR code
        })
        .select()
        .single();

      if (profileError) {
        toast({
          variant: 'destructive',
          title: 'Profile Creation Error',
          description: profileError.message,
        });
        return;
      }

      // Step 3: Create patient profile
      const { error: patientError } = await supabase
        .from('patient_profiles')
        .insert({
          profile_id: profile.id,
          date_of_birth: data.dateOfBirth,
          age: data.age,
          sex: data.sex,
          address: data.address,
          aadhaar_number: data.aadhaarNumber,
        });

      if (patientError) {
        toast({
          variant: 'destructive',
          title: 'Patient Profile Error',
          description: patientError.message,
        });
        return;
       }*/

      setStep(2);
      toast({
        title: 'Registration Successful',
        description: 'Please verify your Aadhaar number with OTP',
      });
  } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendAadhaarOTP = async () => {
    setLoading(true);
    try {
      // Call edge function for Aadhaar OTP
      const { error } = await supabase.functions.invoke('verify-aadhaar', {
        body: { 
          aadhaarNumber: form.getValues('aadhaarNumber'),
          action: 'send_otp'
        }
      });

      if (error) {
        throw error;
      }

      setOtpSent(true);
      toast({
        title: 'OTP Sent',
        description: 'Please check your registered mobile number for OTP',
      });
  } catch (error) {
      toast({
        variant: 'destructive',
        title: 'OTP Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAadhaarOTP = async () => {
    setLoading(true);
    try {
      // Call edge function for OTP verification
      const { data, error } = await supabase.functions.invoke('verify-aadhaar', {
        body: { 
          aadhaarNumber: form.getValues('aadhaarNumber'),
          otp: otp,
          action: 'verify_otp'
        }
      });

      if (error) {
        throw error;
      }

      // Update profile as verified
      const aadhaarNumber = form.getValues('aadhaarNumber');
      const { error: updateError } = await supabase
        .from('patient_profiles')
        .update({ aadhaar_verified: true })
        .eq('aadhaar_number', aadhaarNumber);

      if (updateError) {
        console.error('Update error:', updateError);
      }

      setStep(3);
      toast({
        title: 'Verification Successful',
        description: 'Your Aadhaar has been verified successfully',
      });
  } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Patient Registration</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Please provide your personal details for registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter your age" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sex</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={field.value}
                              onChange={field.onChange}
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter your complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhaar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 12-digit Aadhaar number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Registering...' : 'Register & Verify'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Aadhaar Verification
              </CardTitle>
              <CardDescription>
                Verify your identity using Aadhaar OTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <Button onClick={sendAadhaarOTP} disabled={loading} className="w-full">
                  {loading ? 'Sending OTP...' : 'Send Aadhaar OTP'}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Enter OTP</label>
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                    />
                  </div>
                  <Button onClick={verifyAadhaarOTP} disabled={loading || otp.length !== 6} className="w-full">
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Registration Complete
              </CardTitle>
              <CardDescription>
                Your patient account has been successfully created and verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="w-32 h-32 bg-muted mx-auto rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your unique QR code has been generated for quick access
              </p>
              <Button onClick={() => window.location.href = '/dashboard/patient'} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PatientRegister;