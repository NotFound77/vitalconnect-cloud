import { Card } from "@/components/ui/card";
import { Shield, Smartphone, Clock, Database, Bell, QrCode, FileText, Users } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Shield,
      title: "Government Verification",
      description: "Secure authentication with Aadhaar, IMR, and PMC license validation",
      color: "text-primary"
    },
    {
      icon: QrCode,
      title: "QR Code Access",
      description: "Quick and secure access to medical records through QR codes",
      color: "text-secondary"
    },
    {
      icon: Bell,
      title: "Smart Notifications", 
      description: "Medication reminders and low-stock alerts with AI predictions",
      color: "text-orange-500"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Streamlined prescription management and tracking system",
      color: "text-green-500"
    },
    {
      icon: Clock,
      title: "Real-time Sync",
      description: "Instant data synchronization across all healthcare providers",
      color: "text-red-500"
    },
    {
      icon: Users,
      title: "Multi-user Platform",
      description: "Seamless collaboration between patients, doctors, and pharmacists",
      color: "text-indigo-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Comprehensive Healthcare
            </span> Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage healthcare digitally with security, efficiency, and ease
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-card transition-all duration-300 group border-0 bg-card/50 backdrop-blur-sm"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-background to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;