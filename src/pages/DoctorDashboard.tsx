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
import { useToast } from '@/hooks/use-toast';
import MediDoubt from '@/components/MediDoubt';
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
  User,
  QrCode,
  Clock
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface Appointment {
  id: string;
  patientName: string;
  patientAge: number;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

interface QRVerification {
  patientId: string;
  patientName: string;
  patientAge: number;
  patientSex: string;
  verified: boolean;
  medicalHistory: string[];
}

interface PrescriptionForm {
  patientId: string;
  patientName: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  notes: string;
}

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [qrCode, setQrCode] = useState('');
  const [verifiedPatient, setVerifiedPatient] = useState<QRVerification | null>(null);
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionForm>({
    patientId: '',
    patientName: '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  useEffect(() => {
    fetchMockData();
  }, []);

  const fetchMockData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock appointments data
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        patientName: 'John Doe',
        patientAge: 35,
        appointmentDate: '2024-02-20',
        appointmentTime: '10:30 AM',
        type: 'Regular Checkup',
        status: 'upcoming',
        notes: 'Annual physical examination'
      },
      {
        id: '2',
        patientName: 'Jane Smith',
        patientAge: 28,
        appointmentDate: '2024-02-20',
        appointmentTime: '02:00 PM',
        type: 'Follow-up',
        status: 'upcoming',
        notes: 'Follow-up for blood pressure'
      },
      {
        id: '3',
        patientName: 'Robert Johnson',
        patientAge: 45,
        appointmentDate: '2024-02-19',
        appointmentTime: '11:00 AM',
        type: 'Consultation',
        status: 'completed'
      }
    ];

    setAppointments(mockAppointments);
    setLoading(false);
  };

  const verifyQRCode = async () => {
    if (!qrCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing QR Code',
        description: 'Please enter a QR code to verify',
      });
      return;
    }

    setLoading(true);
    
    // Simulate QR verification process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock verification result
    const mockPatient: QRVerification = {
      patientId: qrCode,
      patientName: 'John Doe',
      patientAge: 35,
      patientSex: 'Male',
      verified: true,
      medicalHistory: [
        'Hypertension (2020)',
        'Diabetes Type 2 (2019)',
        'Allergic to Penicillin'
      ]
    };

    setVerifiedPatient(mockPatient);
    setPrescriptionForm(prev => ({
      ...prev,
      patientId: mockPatient.patientId,
      patientName: mockPatient.patientName
    }));
    setLoading(false);

    toast({
      title: 'Patient Verified',
      description: `Successfully verified ${mockPatient.patientName}`,
    });
  };

  const addMedicine = () => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedicine = (index: number) => {
    setPrescriptionForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const createPrescription = async () => {
    if (!prescriptionForm.patientName || !prescriptionForm.diagnosis) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in patient details and diagnosis',
      });
      return;
    }

    if (prescriptionForm.medicines.some(med => !med.name || !med.dosage)) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Medicines',
        description: 'Please complete all medicine details',
      });
      return;
    }

    setLoading(true);
    
    // Simulate prescription creation
    await new Promise(resolve => setTimeout(resolve, 1500));

    const prescriptionNumber = `RX${Date.now()}`;
    
    toast({
      title: 'Prescription Created',
      description: `Digital prescription ${prescriptionNumber} has been created successfully`,
    });

    // Reset form
    setPrescriptionForm({
      patientId: '',
      patientName: '',
      diagnosis: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: ''
    });
    setVerifiedPatient(null);
    setQrCode('');
    setShowPrescriptionForm(false);
    setLoading(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'upcoming': return 'default';
      case 'completed': return 'secondary';
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

  return (
    <div className="min-h-screen bg-background">
      <MediDoubt />
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback>
                  <AvatarInitials name={user?.email || 'Doctor'} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Dr. {user?.email?.split('@')[0] || 'Doctor'}
                </h1>
                <p className="text-muted-foreground">
                  General Medicine • 10+ years experience
                </p>
                <p className="text-sm text-muted-foreground">
                  IMR: IMR123456 • Verified
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
                <Calendar className="w-8 h-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold">
                    {appointments.filter(a => 
                      new Date(a.appointmentDate).toDateString() === new Date().toDateString() && 
                      a.status === 'upcoming'
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">156</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Prescriptions</p>
                  <p className="text-2xl font-bold">48</p>
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
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="qr-verify">QR Verification</TabsTrigger>
            <TabsTrigger value="prescriptions">Create Prescription</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Appointments</CardTitle>
                <CardDescription>Manage your upcoming and completed appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments
                    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
                    .map((appointment) => (
                    <Card key={appointment.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{appointment.patientName}</h3>
                            <Badge variant={getStatusBadgeVariant(appointment.status)}>
                              {appointment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Age:</strong> {appointment.patientAge} years</p>
                              <p><strong>Type:</strong> {appointment.type}</p>
                            </div>
                            <div>
                              <p><strong>Date:</strong> {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy')}</p>
                              <p><strong>Time:</strong> {appointment.appointmentTime}</p>
                            </div>
                            <div>
                              {appointment.notes && (
                                <p><strong>Notes:</strong> {appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex space-x-2">
                          {appointment.status === 'upcoming' && (
                            <>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm">
                                <Stethoscope className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                            </>
                          )}
                          {appointment.status === 'completed' && (
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              Records
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No appointments scheduled</p>
                      <p className="text-sm text-muted-foreground">Your appointments will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr-verify" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient QR Code Verification</CardTitle>
                <CardDescription>Scan or enter patient QR code to verify and access medical records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="qrCode">Patient QR Code</Label>
                    <Input
                      id="qrCode"
                      value={qrCode}
                      onChange={(e) => setQrCode(e.target.value)}
                      placeholder="Enter or scan patient QR code"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={verifyQRCode} disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Patient'}
                    </Button>
                  </div>
                </div>

                {verifiedPatient && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center">
                        <QrCode className="w-5 h-5 mr-2" />
                        Patient Verified Successfully
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><strong>Name:</strong> {verifiedPatient.patientName}</p>
                          <p><strong>Age:</strong> {verifiedPatient.patientAge} years</p>
                          <p><strong>Sex:</strong> {verifiedPatient.patientSex}</p>
                          <p><strong>Patient ID:</strong> {verifiedPatient.patientId}</p>
                        </div>
                        <div>
                          <p><strong>Medical History:</strong></p>
                          <ul className="list-disc list-inside text-sm">
                            {verifiedPatient.medicalHistory.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <Button onClick={() => setShowPrescriptionForm(true)}>
                          <Pill className="w-4 h-4 mr-2" />
                          Create Prescription
                        </Button>
                        <Button variant="outline">
                          <FileText className="w-4 h-4 mr-2" />
                          View Records
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Digital Prescription</CardTitle>
                <CardDescription>Create a new prescription for verified patients</CardDescription>
              </CardHeader>
              <CardContent>
                {!verifiedPatient ? (
                  <div className="text-center py-8">
                    <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Please verify a patient first</p>
                    <p className="text-sm text-muted-foreground">Use the QR Verification tab to verify a patient before creating a prescription</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Patient Info */}
                    <Card className="bg-muted">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">Patient Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <p><strong>Name:</strong> {verifiedPatient.patientName}</p>
                          <p><strong>Age:</strong> {verifiedPatient.patientAge} years</p>
                          <p><strong>Sex:</strong> {verifiedPatient.patientSex}</p>
                          <p><strong>Patient ID:</strong> {verifiedPatient.patientId}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Prescription Form */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Input
                          id="diagnosis"
                          value={prescriptionForm.diagnosis}
                          onChange={(e) => setPrescriptionForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                          placeholder="Enter diagnosis"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <Label>Medicines</Label>
                          <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Medicine
                          </Button>
                        </div>
                        
                        {prescriptionForm.medicines.map((medicine, index) => (
                          <Card key={index} className="mb-4 p-4">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Medicine {index + 1}</h4>
                              {prescriptionForm.medicines.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeMedicine(index)}
                                  className="text-destructive"
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label>Medicine Name</Label>
                                <Input
                                  value={medicine.name}
                                  onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                                  placeholder="e.g., Paracetamol"
                                />
                              </div>
                              <div>
                                <Label>Dosage</Label>
                                <Input
                                  value={medicine.dosage}
                                  onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                                  placeholder="e.g., 500mg"
                                />
                              </div>
                              <div>
                                <Label>Frequency</Label>
                                <Input
                                  value={medicine.frequency}
                                  onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                                  placeholder="e.g., Twice daily"
                                />
                              </div>
                              <div>
                                <Label>Duration</Label>
                                <Input
                                  value={medicine.duration}
                                  onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                                  placeholder="e.g., 5 days"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Label>Instructions</Label>
                              <Input
                                value={medicine.instructions}
                                onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                                placeholder="e.g., Take after meals"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>

                      <div>
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={prescriptionForm.notes}
                          onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Additional instructions or notes for the patient"
                          rows={3}
                        />
                      </div>

                      <div className="flex space-x-4">
                        <Button onClick={createPrescription} disabled={loading}>
                          {loading ? 'Creating...' : 'Create Prescription'}
                        </Button>
                        <Button variant="outline" onClick={() => {
                          setPrescriptionForm({
                            patientId: '',
                            patientName: '',
                            diagnosis: '',
                            medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
                            notes: ''
                          });
                          setVerifiedPatient(null);
                          setQrCode('');
                        }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;