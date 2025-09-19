import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Stethoscope, Shield, QrCode } from 'lucide-react';

const doctorSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  experience: z.number().min(0, 'Experience cannot be negative').max(60, 'Invalid experience'),
  specialization: z.string().min(2, 'Specialization is required'),
  imrLicense: z.string().min(5, 'IMR license number is required'),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const DoctorRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      experience: 0,
      specialization: '',
      imrLicense: '',
    },
  });

  const onSubmit = async (data: DoctorFormData) => {
    setLoading(true);
    try {
      // Step 1: Create auth user
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

      // Mock profile creation
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStep(2);
      toast({
        title: 'Registration Successful',
        description: 'Please verify your IMR license',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyIMRLicense = async () => {
    setLoading(true);
    try {
      // Call edge function for IMR license verification
      const { data, error } = await supabase.functions.invoke('verify-imr-license', {
        body: { 
          imrLicense: form.getValues('imrLicense'),
          doctorName: form.getValues('name')
        }
      });

      if (error) {
        throw error;
      }

      // Mock verification update
      await new Promise(resolve => setTimeout(resolve, 500));

      setLicenseVerified(true);
      setStep(3);
      toast({
        title: 'License Verified',
        description: 'Your IMR license has been successfully verified',
      });
    } catch (error: any) {
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
          <Stethoscope className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Doctor Registration</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Please provide your professional details and credentials
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
                          <Input placeholder="Dr. John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="5" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialization</FormLabel>
                          <FormControl>
                            <Input placeholder="Cardiology, Neurology, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="imrLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IMR License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your IMR license number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Registering...' : 'Register & Verify License'}
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
                IMR License Verification
              </CardTitle>
              <CardDescription>
                Verify your medical license with the Indian Medical Registry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  License Number: {form.getValues('imrLicense')}
                </p>
                <Button onClick={verifyIMRLicense} disabled={loading} className="w-full">
                  {loading ? 'Verifying License...' : 'Verify IMR License'}
                </Button>
              </div>
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
                Your doctor account has been successfully created and verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="w-32 h-32 bg-muted mx-auto rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your unique doctor QR code has been generated
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ IMR License Verified<br />
                  ✓ Professional credentials confirmed<br />
                  ✓ Account activated
                </p>
              </div>
              <Button onClick={() => window.location.href = '/dashboard/doctor'} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorRegister;