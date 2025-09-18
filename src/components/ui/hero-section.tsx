import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, UserCheck, Stethoscope, Pill, Clock, QrCode } from "lucide-react";
import heroImage from "@/assets/healthcare-hero.jpg";

const HeroSection = ({ onGetStarted }: { onGetStarted?: () => void }) => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background to-accent overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(64,165,221,0.1),transparent_70%)]" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Digital Healthcare
                </span>
                <br />
                <span className="text-foreground">Reimagined</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Secure, streamlined medical interactions between patients, doctors, and pharmacists 
                through our comprehensive biotechnical platform.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Shield, text: "Secure Authentication" },
                { icon: UserCheck, text: "Government Verified" },
                { icon: QrCode, text: "QR Code Access" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-full px-4 py-2 border">
                  <feature.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={() => window.location.href = '/onboarding'}
                className="bg-gradient-to-r from-primary to-primary-glow hover:shadow-glow transition-all duration-300"
              >
                Get Started Today
              </Button>
              <Button variant="outline" size="lg" className="border-primary/20 hover:bg-primary/5">
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="Healthcare professionals using digital technology" 
                className="w-full h-auto rounded-2xl shadow-medical"
              />
            </div>
            {/* Floating Cards */}
            <Card className="absolute -top-6 -left-6 p-4 bg-card/90 backdrop-blur-sm border-primary/20 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Doctors</p>
                  <p className="text-xs text-muted-foreground">IMR Verified</p>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-6 -right-6 p-4 bg-card/90 backdrop-blur-sm border-secondary/20 shadow-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-secondary to-green-400 rounded-full flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Pharmacists</p>
                  <p className="text-xs text-muted-foreground">PMC Licensed</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;