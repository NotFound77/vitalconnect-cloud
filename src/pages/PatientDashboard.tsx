import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Pill, 
  Calendar, 
  Clock, 
  FileText, 
  QrCode, 
  Bell, 
  Activity,
  TrendingUp,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface PatientProfile {
  id: string;
  profile: {
    name: string;
    phone: string;
    qr_code: string;
  };
  age: number;
  sex: string;
  address: string;
  date_of_birth: string;
  aadhaar_verified: boolean;
}

interface MedicalRecord {
  id: string;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  visit_date: string;
  follow_up_date: string;
  vital_signs: any;
  doctor_profile: {
    profile: {
      name: string;
    };
    specialization: string;
  };
}

interface Prescription {
  id: string;
  prescription_number: string;
  status: string;
  issued_date: string;
  valid_until: string;
  prescription_items: {
    id: string;
    quantity: number;
    dosage_instructions: string;
    frequency: string;
    status: string;
    medication: {
      name: string;
      generic_name: string;
      strength: string;
    };
  }[];
  doctor_profile: {
    profile: {
      name: string;
    };
  };
}

interface Notification {
  id: string;
  notification_time: string;
  status: string;
  message: string;
  prescription_item: {
    medication: {
      name: string;
    };
  };
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      fetchPatientData();
    }
  }, [user]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          patient_profiles!inner (
            id,
            age,
            sex,
            address,
            date_of_birth,
            aadhaar_verified
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      const profile = {
        id: profileData.patient_profiles[0].id,
        profile: {
          name: profileData.name,
          phone: profileData.phone,
          qr_code: profileData.qr_code
        },
        ...profileData.patient_profiles[0]
      };
      setPatientProfile(profile);

      // Fetch medical records
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
          *,
          doctor_profile:doctor_profiles!inner (
            profile:profiles!inner (name),
            specialization
          )
        `)
        .eq('patient_profile_id', profile.id)
        .order('visit_date', { ascending: false });

      if (recordsError) throw recordsError;
      setMedicalRecords(recordsData || []);

      // Fetch prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          prescription_items (
            *,
            medication:medications (name, generic_name, strength)
          ),
          doctor_profile:doctor_profiles!inner (
            profile:profiles!inner (name)
          )
        `)
        .eq('patient_profile_id', profile.id)
        .order('issued_date', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('medication_notifications')
        .select(`
          *,
          prescription_item:prescription_items!inner (
            medication:medications!inner (name)
          )
        `)
        .eq('patient_profile_id', profile.id)
        .eq('status', 'pending')
        .order('notification_time', { ascending: true })
        .limit(5);

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('medication_notifications')
        .update({ status: 'acknowledged' })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: 'Notification acknowledged',
        description: 'Medication reminder has been marked as seen',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'dispensed': return 'default';
      case 'partially_dispensed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!patientProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your patient profile. Please contact support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback>
                  <AvatarInitials name={patientProfile.profile.name} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome, {patientProfile.profile.name}
                </h1>
                <p className="text-muted-foreground">
                  Patient ID: {patientProfile.id.slice(0, 8)}... • 
                  {patientProfile.aadhaar_verified ? ' Verified' : ' Pending Verification'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <QrCode className="w-4 h-4 mr-2" />
                My QR Code
              </Button>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Medical Records</p>
                  <p className="text-2xl font-bold">{medicalRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Pill className="w-8 h-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Active Prescriptions</p>
                  <p className="text-2xl font-bold">
                    {prescriptions.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bell className="w-8 h-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending Reminders</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                  <p className="text-2xl font-bold">Good</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medication Reminders */}
        {notifications.length > 0 && (
          <Card className="mb-6 border-accent">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2 text-accent" />
                Medication Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-3 text-accent" />
                      <div>
                        <p className="font-medium">{notification.prescription_item.medication.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(notification.notification_time), 'MMM dd, yyyy at h:mm a')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => acknowledgeNotification(notification.id)}
                    >
                      Taken
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="records">Medical Records</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="health">Health Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Medical Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Medical Records</CardTitle>
                  <CardDescription>Your latest consultations and diagnoses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicalRecords.slice(0, 3).map((record) => (
                      <div key={record.id} className="border-l-4 border-primary pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{record.diagnosis}</p>
                            <p className="text-sm text-muted-foreground">
                              Dr. {record.doctor_profile.profile.name} • {record.doctor_profile.specialization}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(record.visit_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {medicalRecords.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No medical records yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Prescriptions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                  <CardDescription>Your current and recent medications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.slice(0, 3).map((prescription) => (
                      <div key={prescription.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">#{prescription.prescription_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Dr. {prescription.doctor_profile.profile.name}
                            </p>
                          </div>
                          <Badge variant={getStatusBadgeVariant(prescription.status)}>
                            {prescription.status}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {prescription.prescription_items.slice(0, 2).map((item) => (
                            <p key={item.id} className="text-sm">
                              {item.medication.name} - {item.frequency}
                            </p>
                          ))}
                          {prescription.prescription_items.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{prescription.prescription_items.length - 2} more medications
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {prescriptions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No prescriptions yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Medical History</CardTitle>
                <CardDescription>All your medical records and consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{record.diagnosis}</h3>
                          <p className="text-muted-foreground">
                            Dr. {record.doctor_profile.profile.name} • {record.doctor_profile.specialization}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(record.visit_date), 'MMM dd, yyyy')}
                          </p>
                          {record.follow_up_date && (
                            <p className="text-xs text-muted-foreground">
                              Follow-up: {format(new Date(record.follow_up_date), 'MMM dd, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {record.symptoms && record.symptoms.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {record.symptoms.map((symptom, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Notes:</p>
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        </div>
                      )}
                      
                      {record.vital_signs && (
                        <div>
                          <p className="text-sm font-medium mb-1">Vital Signs:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            {Object.entries(record.vital_signs).map(([key, value]) => (
                              <div key={key} className="bg-muted/50 p-2 rounded">
                                <p className="font-medium capitalize">{key.replace('_', ' ')}</p>
                                <p>{value as string}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {medicalRecords.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No medical records available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Prescriptions</CardTitle>
                <CardDescription>Complete list of your prescriptions and medications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Prescription #{prescription.prescription_number}</h3>
                          <p className="text-muted-foreground">
                            Dr. {prescription.doctor_profile.profile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Issued: {format(new Date(prescription.issued_date), 'MMM dd, yyyy')}
                            {prescription.valid_until && (
                              <> • Valid until: {format(new Date(prescription.valid_until), 'MMM dd, yyyy')}</>
                            )}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Medications:</h4>
                        {prescription.prescription_items.map((item) => (
                          <div key={item.id} className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{item.medication.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.medication.generic_name} • {item.medication.strength}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Dosage:</span> {item.dosage_instructions}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Frequency:</span> {item.frequency}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Quantity:</span> {item.quantity} units
                                </p>
                              </div>
                              <Badge variant={getStatusBadgeVariant(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {prescriptions.length === 0 && (
                    <div className="text-center py-12">
                      <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No prescriptions available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Health Overview</CardTitle>
                  <CardDescription>Your basic health information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Age</p>
                        <p className="text-lg font-semibold">{patientProfile.age} years</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Gender</p>
                        <p className="text-lg font-semibold">{patientProfile.sex}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-lg font-semibold">
                          {format(new Date(patientProfile.date_of_birth), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Aadhaar Status</p>
                        <p className="text-lg font-semibold">
                          {patientProfile.aadhaar_verified ? 'Verified' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Manage your health data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <QrCode className="w-4 h-4 mr-2" />
                      Show QR Code to Provider
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Appointment
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Download Medical Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="w-4 h-4 mr-2" />
                      Update Health Information
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;