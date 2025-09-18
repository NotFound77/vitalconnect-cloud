import { useState } from 'react';
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Stethoscope, Pill } from 'lucide-react';

const Onboarding = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<'patient' | 'doctor' | 'pharmacist' | null>(null);
  const [selectedType, setSelectedType] = useState<'patient' | 'doctor' | 'pharmacist' | null>(null);

  const userTypes = [
    {
      type: 'patient' as const,
      title: 'Patient Registration',
      description: 'Register as a patient to access healthcare services',
      icon: UserPlus,
      color: 'from-primary to-primary-glow',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      type: 'doctor' as const,
      title: 'Doctor Registration',
      description: 'Register as a healthcare professional',
      icon: Stethoscope,
      color: 'from-secondary to-green-400',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
    {
      type: 'pharmacist' as const,
      title: 'Pharmacist Registration',
      description: 'Register as a licensed pharmacist',
      icon: Pill,
      color: 'from -purple to-purple-400',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
    },
  ];

  const handleUserTypeSelect = (type: 'patient' | 'doctor' | 'pharmacist') => {
    setSelectedType(type);
    // Navigate to respective registration form
    window.location.href = `/register/${type}`;
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };
  if (showAuth && !selectedUserType) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <Button 
            variant="ghost"
            onClick={() => setShowAuth(false)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </div>
      </div>
    )
  }

  
  return (
    <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Registration Options
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose your user type to get started with secure onboarding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {userTypes.map((userType) => {
              const IconComponent = userType.icon;
              return (
                <Card
                  key={userType.type}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${userType.bgColor} border-2 hover:border-primary`}
                  onClick={() => handleUserTypeSelect(userType.type)}
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                      <IconComponent className={`w-8 h-8 ${userType.color}`} />
                    </div>
                    <CardTitle className="text-xl">{userType.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {userType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline">
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href="/login" className="text-primary hover:underline">
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
  );
};

export default Onboarding;