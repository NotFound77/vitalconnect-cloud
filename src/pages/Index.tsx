import HeroSection from "@/components/ui/hero-section";
import FeaturesSection from "@/components/features/features-section";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection/>
      <FeaturesSection />
      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of healthcare professionals and patients already using our secure platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center"></div>
          <p className="text-lg text-muted-foreground mb-8">
            Select your role and complete the secure onboarding process
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/onboarding'}
          >
            Start Registration
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
