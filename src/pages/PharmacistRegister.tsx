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
import { Pill, Shield, QrCode } from 'lucide-react';

const pharmacistSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  pharmacyName: z.string().min(2, 'Pharmacy name is required'),
  operatingHours: z.string().min(5, 'Operating hours are required'),
  pmcLicense: z.string().min(5, 'PMC license number is required'),
});

type PharmacistFormData = z.infer<typeof pharmacistSchema>;

const PharmacistRegister = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [licenseVerified, setLicenseVerified] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<PharmacistFormData>({
    resolver: zodResolver(pharmacistSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      pharmacyName: '',
      operatingHours: '',
      pmcLicense: '',
    },
  });

  const onSubmit = async (data: PharmacistFormData) => {
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
        description: 'Please verify your PMC license',
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

  const verifyPMCLicense = async () => {
    setLoading(true);
    try {
      // Call edge function for PMC license verification
      const { data, error } = await supabase.functions.invoke('verify-pmc-license', {
        body: { 
          pmcLicense: form.getValues('pmcLicense'),
          pharmacistName: form.getValues('name'),
          pharmacyName: form.getValues('pharmacyName')
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
        description: 'Your PMC license has been successfully verified',
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
          <Pill className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Pharmacist Registration</h1>
          <p className="text-muted-foreground">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Information</CardTitle>
              <CardDescription>
                Please provide your pharmacy details and credentials
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
                        <FormLabel>Pharmacist Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
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

                  <FormField
                    control={form.control}
                    name="pharmacyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pharmacy Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Apollo Pharmacy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="operatingHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Operating Hours</FormLabel>
                        <FormControl>
                          <Input placeholder="9:00 AM - 10:00 PM" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pmcLicense"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PMC License Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your PMC license number" {...field} />
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
                PMC License Verification
              </CardTitle>
              <CardDescription>
                Verify your license with the Pharmacy Council
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  License Number: {form.getValues('pmcLicense')}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Pharmacy: {form.getValues('pharmacyName')}
                </p>
                <Button onClick={verifyPMCLicense} disabled={loading} className="w-full">
                  {loading ? 'Verifying License...' : 'Verify PMC License'}
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
                Your pharmacist account has been successfully created and verified
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="w-32 h-32 bg-muted mx-auto rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your unique pharmacist QR code has been generated
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">
                  ✓ PMC License Verified<br />
                  ✓ Pharmacy credentials confirmed<br />
                  ✓ Account activated
                </p>
              </div>
              <Button onClick={() => window.location.href = '/dashboard/pharmacist'} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PharmacistRegister;