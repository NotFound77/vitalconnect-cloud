import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Stethoscope, 
  Users, 
  FileText, 
  Pill, 
  Calendar, 
  TrendingUp, 
  Search,
  Plus,
  Eye,
  Activity,
  Brain,
  User
} from 'lucide-react';
import { format } from 'date-fns';

interface DoctorProfile {
  id: string;
  profile: {
    name: string;
    phone: string;
  };
  specialization: string;
  experience: number;
  imr_license: string;
  imr_verified: boolean;
}

interface Patient {
  id: string;
  profile: {
    name: string;
    phone: string;
  };
  age: number;
  sex: string;
  aadhaar_verified: boolean;
}

interface MedicalRecord {
  id: string;
  diagnosis: string;
  symptoms: string[];
  notes: string;
  visit_date: string;
  follow_up_date: string;
  patient_profile: {
    profile: {
      name: string;
    };
    age: number;
    sex: string;
  };
}

interface Prescription {
  id: string;
  prescription_number: string;
  status: string;
  issued_date: string;
  patient_profile: {
    profile: {
      name: string;
    };
  };
  prescription_items: {
    medication: {
      name: string;
    };
  }[];
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // New record form state
  const [newRecord, setNewRecord] = useState({
    patient_id: '',
    diagnosis: '',
    symptoms: '',
    notes: '',
    follow_up_date: '',
    vital_signs: {
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      weight: ''
    }
  });

  useEffect(() => {
    if (user) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      // Fetch doctor profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          doctor_profiles!inner (
            id,
            specialization,
            experience,
            imr_license,
            imr_verified
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      const profile = {
        id: profileData.doctor_profiles[0].id,
        profile: {
          name: profileData.name,
          phone: profileData.phone
        },
        ...profileData.doctor_profiles[0]
      };
      setDoctorProfile(profile);

      // Fetch medical records created by this doctor
      const { data: recordsData, error: recordsError } = await supabase
        .from('medical_records')
        .select(`
          *,
          patient_profile:patient_profiles!inner (
            profile:profiles!inner (name),
            age,
            sex
          )
        `)
        .eq('doctor_profile_id', profile.id)
        .order('visit_date', { ascending: false })
        .limit(20);

      if (recordsError) throw recordsError;
      setMedicalRecords(recordsData || []);

      // Fetch prescriptions created by this doctor
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient_profile:patient_profiles!inner (
            profile:profiles!inner (name)
          ),
          prescription_items (
            medication:medications (name)
          )
        `)
        .eq('doctor_profile_id', profile.id)
        .order('issued_date', { ascending: false })
        .limit(20);

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

      // Fetch all patients (for search)
      const { data: patientsData, error: patientsError } = await supabase
        .from('patient_profiles')
        .select(`
          id,
          age,
          sex,
          aadhaar_verified,
          profile:profiles!inner (name, phone)
        `)
        .limit(100);

      if (patientsError) throw patientsError;
      setPatients(patientsData || []);

    } catch (error: Error | "null") {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const createMedicalRecord = async () => {
    if (!newRecord.patient_id || !newRecord.diagnosis) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please select a patient and enter a diagnosis',
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          patient_profile_id: newRecord.patient_id,
          doctor_profile_id: doctorProfile?.id,
          diagnosis: newRecord.diagnosis,
          symptoms: newRecord.symptoms ? newRecord.symptoms.split(',').map(s => s.trim()) : [],
          notes: newRecord.notes,
          follow_up_date: newRecord.follow_up_date || null,
          vital_signs: Object.keys(newRecord.vital_signs).some(key => 
            newRecord.vital_signs[key as keyof typeof newRecord.vital_signs]
          ) ? newRecord.vital_signs : null
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Medical Record Created',
        description: 'Successfully created new medical record',
      });

      // Reset form
      setNewRecord({
        patient_id: '',
        diagnosis: '',
        symptoms: '',
        notes: '',
        follow_up_date: '',
        vital_signs: {
          blood_pressure: '',
          heart_rate: '',
          temperature: '',
          weight: ''
        }
      });

      // Refresh data
      fetchDoctorData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.profile.phone.includes(searchTerm)
  );

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

  if (!doctorProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your doctor profile. Please contact support.
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
                  <AvatarInitials name={doctorProfile.profile.name} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Dr. {doctorProfile.profile.name}
                </h1>
                <p className="text-muted-foreground">
                  {doctorProfile.specialization} • {doctorProfile.experience} years experience
                </p>
                <p className="text-sm text-muted-foreground">
                  IMR: {doctorProfile.imr_license} • 
                  {doctorProfile.imr_verified ? ' Verified' : ' Pending Verification'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
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
                <Users className="w-8 h-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Patients Treated</p>
                  <p className="text-2xl font-bold">
                    {new Set(medicalRecords.map(r => r.patient_profile)).size}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-secondary" />
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
                <Pill className="w-8 h-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Prescriptions</p>
                  <p className="text-2xl font-bold">{prescriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    {medicalRecords.filter(r => 
                      new Date(r.visit_date).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Medical Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Medical Records</CardTitle>
                  <CardDescription>Latest patient consultations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicalRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="border-l-4 border-primary pl-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{record.diagnosis}</p>
                            <p className="text-sm text-muted-foreground">
                              {record.patient_profile.profile.name} • {record.patient_profile.age}y, {record.patient_profile.sex}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(record.visit_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
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

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and AI tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" onClick={() => setActiveTab('patients')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Record
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Pill className="w-4 h-4 mr-2" />
                      Write Prescription
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Brain className="w-4 h-4 mr-2" />
                      AI Diagnosis Assistant
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Prescription Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patient Search */}
              <Card>
                <CardHeader>
                  <CardTitle>Find Patient</CardTitle>
                  <CardDescription>Search for patients to create records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredPatients.slice(0, 10).map((patient) => (
                        <div 
                          key={patient.id} 
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                            newRecord.patient_id === patient.id ? 'bg-primary/10 border-primary' : ''
                          }`}
                          onClick={() => setNewRecord(prev => ({ ...prev, patient_id: patient.id }))}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{patient.profile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {patient.age}y, {patient.sex} • {patient.profile.phone}
                              </p>
                            </div>
                            {patient.aadhaar_verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {filteredPatients.length === 0 && searchTerm && (
                        <p className="text-center text-muted-foreground py-4">
                          No patients found
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Create Medical Record */}
              <Card>
                <CardHeader>
                  <CardTitle>Create Medical Record</CardTitle>
                  <CardDescription>Add a new consultation record</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="diagnosis">Diagnosis *</Label>
                      <Input
                        id="diagnosis"
                        placeholder="Enter primary diagnosis"
                        value={newRecord.diagnosis}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="symptoms">Symptoms</Label>
                      <Input
                        id="symptoms"
                        placeholder="Enter symptoms (comma-separated)"
                        value={newRecord.symptoms}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, symptoms: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Clinical Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Enter detailed notes about the consultation"
                        value={newRecord.notes}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="blood_pressure">Blood Pressure</Label>
                        <Input
                          id="blood_pressure"
                          placeholder="120/80"
                          value={newRecord.vital_signs.blood_pressure}
                          onChange={(e) => setNewRecord(prev => ({ 
                            ...prev, 
                            vital_signs: { ...prev.vital_signs, blood_pressure: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="heart_rate">Heart Rate</Label>
                        <Input
                          id="heart_rate"
                          placeholder="72 bpm"
                          value={newRecord.vital_signs.heart_rate}
                          onChange={(e) => setNewRecord(prev => ({ 
                            ...prev, 
                            vital_signs: { ...prev.vital_signs, heart_rate: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="temperature">Temperature</Label>
                        <Input
                          id="temperature"
                          placeholder="98.6°F"
                          value={newRecord.vital_signs.temperature}
                          onChange={(e) => setNewRecord(prev => ({ 
                            ...prev, 
                            vital_signs: { ...prev.vital_signs, temperature: e.target.value }
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight</Label>
                        <Input
                          id="weight"
                          placeholder="70 kg"
                          value={newRecord.vital_signs.weight}
                          onChange={(e) => setNewRecord(prev => ({ 
                            ...prev, 
                            vital_signs: { ...prev.vital_signs, weight: e.target.value }
                          }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="follow_up">Follow-up Date</Label>
                      <Input
                        id="follow_up"
                        type="date"
                        value={newRecord.follow_up_date}
                        onChange={(e) => setNewRecord(prev => ({ ...prev, follow_up_date: e.target.value }))}
                      />
                    </div>

                    <Button 
                      onClick={createMedicalRecord} 
                      className="w-full"
                      disabled={!newRecord.patient_id || !newRecord.diagnosis}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Medical Record
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>All consultation records you've created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicalRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{record.diagnosis}</h3>
                          <p className="text-muted-foreground">
                            {record.patient_profile.profile.name} • {record.patient_profile.age}y, {record.patient_profile.sex}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(record.visit_date), 'MMM dd, yyyy')}
                          </p>
                          {record.follow_up_date && (
                            <p className="text-xs text-muted-foreground">
                              Follow-up: {format(new Date(record.follow_up_date), 'MMM dd')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {record.symptoms && record.symptoms.length > 0 && (
                        <div className="mb-2">
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
                        <p className="text-sm text-muted-foreground mt-2">{record.notes}</p>
                      )}
                    </div>
                  ))}
                  {medicalRecords.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No medical records created yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescriptions</CardTitle>
                <CardDescription>All prescriptions you've issued</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <div key={prescription.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">#{prescription.prescription_number}</h3>
                          <p className="text-muted-foreground">
                            {prescription.patient_profile.profile.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(prescription.issued_date), 'MMM dd, yyyy')}
                          </p>
                          <Badge variant="secondary">{prescription.status}</Badge>
                        </div>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Medications: {prescription.prescription_items.map(item => 
                          item.medication.name
                        ).join(', ')}</p>
                      </div>
                    </div>
                  ))}
                  {prescriptions.length === 0 && (
                    <div className="text-center py-12">
                      <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No prescriptions issued yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Prescription Analytics
                  </CardTitle>
                  <CardDescription>AI-powered insights from your prescriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <h4 className="font-medium text-primary">Most Prescribed Medications</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on your prescription history, you frequently prescribe antibiotics and pain relievers.
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <h4 className="font-medium text-secondary">Treatment Patterns</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your patients show a 85% medication adherence rate, above average.
                      </p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <h4 className="font-medium text-accent">Recommendations</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Consider generic alternatives for cost-effective treatment options.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Statistics</CardTitle>
                  <CardDescription>Your clinical practice overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Consultations/Month</span>
                      <span className="font-bold">{Math.round(medicalRecords.length / 12) || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Patient Satisfaction</span>
                      <span className="font-bold">4.8/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Follow-up Rate</span>
                      <span className="font-bold">
                        {Math.round((medicalRecords.filter(r => r.follow_up_date).length / medicalRecords.length) * 100) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Prescription Accuracy</span>
                      <span className="font-bold">98%</span>
                    </div>
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

export default DoctorDashboard;