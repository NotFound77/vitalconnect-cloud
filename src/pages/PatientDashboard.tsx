import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MediDoubt from '@/components/MediDoubt';
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
  User,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { format, addDays } from 'date-fns';

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timings: string[];
  expiryDate: string;
  remainingDays: number;
  instructions: string;
  prescribedBy: string;
}

interface DigitalPrescription {
  id: string;
  prescriptionNumber: string;
  doctorName: string;
  doctorSpecialization: string;
  issuedDate: string;
  validUntil: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  status: 'active' | 'expired' | 'completed';
}

interface CheckupDate {
  id: string;
  doctorName: string;
  specialization: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<DigitalPrescription[]>([]);
  const [checkupDates, setCheckupDates] = useState<CheckupDate[]>([]);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    dosage: '',
    frequency: '',
    timings: [''],
    expiryDate: '',
    instructions: '',
    prescribedBy: ''
  });
  const [showAddMedicine, setShowAddMedicine] = useState(false);

  useEffect(() => {
    fetchMockData();
  }, []);

  const fetchMockData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock medicines data
    const mockMedicines: Medicine[] = [
      {
        id: '1',
        name: 'Paracetamol 500mg',
        dosage: '500mg',
        frequency: 'Twice daily',
        timings: ['08:00', '20:00'],
        expiryDate: '2024-12-15',
        remainingDays: 45,
        instructions: 'Take after meals',
        prescribedBy: 'Dr. Sharma'
      },
      {
        id: '2',
        name: 'Amoxicillin 250mg',
        dosage: '250mg',
        frequency: 'Three times daily',
        timings: ['08:00', '14:00', '20:00'],
        expiryDate: '2024-11-30',
        remainingDays: 30,
        instructions: 'Complete full course',
        prescribedBy: 'Dr. Patel'
      }
    ];

    // Mock digital prescriptions
    const mockPrescriptions: DigitalPrescription[] = [
      {
        id: '1',
        prescriptionNumber: 'RX001234',
        doctorName: 'Dr. Rajesh Sharma',
        doctorSpecialization: 'General Medicine',
        issuedDate: '2024-01-15',
        validUntil: '2024-02-15',
        medicines: [
          { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '5 days' },
          { name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once daily', duration: '30 days' }
        ],
        status: 'active'
      },
      {
        id: '2',
        prescriptionNumber: 'RX001235',
        doctorName: 'Dr. Priya Patel',
        doctorSpecialization: 'Cardiology',
        issuedDate: '2024-01-10',
        validUntil: '2024-02-10',
        medicines: [
          { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days' }
        ],
        status: 'active'
      }
    ];

    // Mock checkup dates
    const mockCheckupDates: CheckupDate[] = [
      {
        id: '1',
        doctorName: 'Dr. Rajesh Sharma',
        specialization: 'General Medicine',
        appointmentDate: '2024-02-20',
        appointmentTime: '10:30 AM',
        type: 'Follow-up Consultation',
        status: 'upcoming',
        notes: 'Bring previous reports'
      },
      {
        id: '2',
        doctorName: 'Dr. Priya Patel',
        specialization: 'Cardiology',
        appointmentDate: '2024-02-25',
        appointmentTime: '02:00 PM',
        type: 'Regular Checkup',
        status: 'upcoming'
      },
      {
        id: '3',
        doctorName: 'Dr. Singh',
        specialization: 'Orthopedics',
        appointmentDate: '2024-01-05',
        appointmentTime: '11:00 AM',
        type: 'Post-surgery Review',
        status: 'completed',
        notes: 'Recovery progressing well'
      }
    ];

    setMedicines(mockMedicines);
    setPrescriptions(mockPrescriptions);
    setCheckupDates(mockCheckupDates);
    setLoading(false);
  };

  const addMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please fill in medicine name and dosage',
      });
      return;
    }

    const medicine: Medicine = {
      id: Date.now().toString(),
      ...newMedicine,
      timings: newMedicine.timings.filter(t => t.trim() !== ''),
      remainingDays: newMedicine.expiryDate ? 
        Math.ceil((new Date(newMedicine.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
    };

    setMedicines(prev => [...prev, medicine]);
    setNewMedicine({
      name: '',
      dosage: '',
      frequency: '',
      timings: [''],
      expiryDate: '',
      instructions: '',
      prescribedBy: ''
    });
    setShowAddMedicine(false);

    toast({
      title: 'Medicine Added',
      description: 'Medicine has been added to your list',
    });
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
    toast({
      title: 'Medicine Removed',
      description: 'Medicine has been removed from your list',
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expired': return 'destructive';
      case 'completed': return 'secondary';
      case 'upcoming': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const addTimingField = () => {
    setNewMedicine(prev => ({
      ...prev,
      timings: [...prev.timings, '']
    }));
  };

  const updateTiming = (index: number, value: string) => {
    setNewMedicine(prev => ({
      ...prev,
      timings: prev.timings.map((t, i) => i === index ? value : t)
    }));
  };

  const removeTiming = (index: number) => {
    setNewMedicine(prev => ({
      ...prev,
      timings: prev.timings.filter((_, i) => i !== index)
    }));
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
                  <AvatarInitials name={user?.email || 'Patient'} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome, {user?.email?.split('@')[0] || 'Patient'}
                </h1>
                <p className="text-muted-foreground">
                  Patient Dashboard • Verified Account
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
                <Pill className="w-8 h-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">My Medicines</p>
                  <p className="text-2xl font-bold">{medicines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Digital Prescriptions</p>
                  <p className="text-2xl font-bold">{prescriptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Checkups</p>
                  <p className="text-2xl font-bold">
                    {checkupDates.filter(c => c.status === 'upcoming').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Heart className="w-8 h-8 text-destructive" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Health Score</p>
                  <p className="text-2xl font-bold">Good</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="medicines" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="medicines">My Medicines</TabsTrigger>
            <TabsTrigger value="prescriptions">Digital Prescriptions</TabsTrigger>
            <TabsTrigger value="checkups">Checkup Dates</TabsTrigger>
            <TabsTrigger value="health">Health Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="medicines" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Medicines</CardTitle>
                    <CardDescription>Track your medications with timings and expiry dates</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddMedicine(!showAddMedicine)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddMedicine && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Add New Medicine</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Medicine Name</Label>
                          <Input
                            id="name"
                            value={newMedicine.name}
                            onChange={(e) => setNewMedicine(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Paracetamol 500mg"
                          />
                        </div>
                        <div>
                          <Label htmlFor="dosage">Dosage</Label>
                          <Input
                            id="dosage"
                            value={newMedicine.dosage}
                            onChange={(e) => setNewMedicine(prev => ({ ...prev, dosage: e.target.value }))}
                            placeholder="e.g., 500mg"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="frequency">Frequency</Label>
                          <Input
                            id="frequency"
                            value={newMedicine.frequency}
                            onChange={(e) => setNewMedicine(prev => ({ ...prev, frequency: e.target.value }))}
                            placeholder="e.g., Twice daily"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            type="date"
                            value={newMedicine.expiryDate}
                            onChange={(e) => setNewMedicine(prev => ({ ...prev, expiryDate: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Medicine Timings</Label>
                        {newMedicine.timings.map((timing, index) => (
                          <div key={index} className="flex items-center space-x-2 mt-2">
                            <Input
                              type="time"
                              value={timing}
                              onChange={(e) => updateTiming(index, e.target.value)}
                              className="flex-1"
                            />
                            {newMedicine.timings.length > 1 && (
                              <Button 
                                type="button" 
                                variant="outline" 
                                size="sm"
                                onClick={() => removeTiming(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm" 
                          onClick={addTimingField}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Timing
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="instructions">Instructions</Label>
                          <Input
                            id="instructions"
                            value={newMedicine.instructions}
                            onChange={(e) => setNewMedicine(prev => ({ ...prev, instructions: e.target.value }))}
                            placeholder="e.g., Take after meals"
                          />
                        </div>
                        <div>
                          <Label htmlFor="prescribedBy">Prescribed By</Label>
                          <Input
                            id="prescribedBy"
                            value={newMedicine.prescribedBy}
                            onChange={(e) => setNewMedicine(prev => ({ ...prev, prescribedBy: e.target.value }))}
                            placeholder="e.g., Dr. Smith"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button onClick={addMedicine}>Add Medicine</Button>
                        <Button variant="outline" onClick={() => setShowAddMedicine(false)}>Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {medicines.map((medicine) => (
                    <Card key={medicine.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{medicine.name}</h3>
                            <Badge variant={medicine.remainingDays < 7 ? 'destructive' : 'secondary'}>
                              {medicine.remainingDays} days left
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Dosage:</strong> {medicine.dosage}</p>
                              <p><strong>Frequency:</strong> {medicine.frequency}</p>
                            </div>
                            <div>
                              <p><strong>Timings:</strong> {medicine.timings.join(', ')}</p>
                              <p><strong>Expiry:</strong> {format(new Date(medicine.expiryDate), 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                              <p><strong>Instructions:</strong> {medicine.instructions || 'None'}</p>
                              <p><strong>Prescribed by:</strong> {medicine.prescribedBy || 'Self-added'}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteMedicine(medicine.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {medicines.length === 0 && (
                    <div className="text-center py-8">
                      <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No medicines added yet</p>
                      <p className="text-sm text-muted-foreground">Click "Add Medicine" to track your medications</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Digital Prescriptions</CardTitle>
                <CardDescription>View all your digital prescriptions from doctors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {prescriptions.map((prescription) => (
                    <Card key={prescription.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">#{prescription.prescriptionNumber}</h3>
                          <p className="text-muted-foreground">
                            {prescription.doctorName} • {prescription.doctorSpecialization}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Issued: {format(new Date(prescription.issuedDate), 'MMM dd, yyyy')} • 
                            Valid until: {format(new Date(prescription.validUntil), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge variant={getStatusBadgeVariant(prescription.status)}>
                          {prescription.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Prescribed Medicines:</h4>
                        {prescription.medicines.map((medicine, index) => (
                          <div key={index} className="bg-muted p-3 rounded">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{medicine.name}</span>
                              <span className="text-sm text-muted-foreground">{medicine.duration}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {medicine.dosage} • {medicine.frequency}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  {prescriptions.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No digital prescriptions yet</p>
                      <p className="text-sm text-muted-foreground">Your doctor-issued prescriptions will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkups" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Checkup Dates</CardTitle>
                <CardDescription>Track your upcoming and past medical appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {checkupDates
                    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
                    .map((checkup) => (
                    <Card key={checkup.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{checkup.doctorName}</h3>
                            <Badge variant={getStatusBadgeVariant(checkup.status)}>
                              {checkup.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p><strong>Specialization:</strong> {checkup.specialization}</p>
                              <p><strong>Type:</strong> {checkup.type}</p>
                            </div>
                            <div>
                              <p><strong>Date:</strong> {format(new Date(checkup.appointmentDate), 'MMM dd, yyyy')}</p>
                              <p><strong>Time:</strong> {checkup.appointmentTime}</p>
                            </div>
                          </div>
                          
                          {checkup.notes && (
                            <div className="mt-3 p-3 bg-muted rounded">
                              <p className="text-sm"><strong>Notes:</strong> {checkup.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4">
                          {checkup.status === 'upcoming' && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-1" />
                              {Math.ceil((new Date(checkup.appointmentDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  {checkupDates.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No checkup appointments scheduled</p>
                      <p className="text-sm text-muted-foreground">Your upcoming appointments will appear here</p>
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
                  <CardTitle>Health Metrics</CardTitle>
                  <CardDescription>Track your vital signs and health indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>Blood Pressure</span>
                      <span className="font-medium">120/80 mmHg</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>Heart Rate</span>
                      <span className="font-medium">72 bpm</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>Weight</span>
                      <span className="font-medium">70 kg</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>Blood Sugar</span>
                      <span className="font-medium">95 mg/dL</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Tips</CardTitle>
                  <CardDescription>Personalized recommendations for better health</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <p className="text-sm">🏃‍♂️ Take a 30-minute walk daily for better cardiovascular health</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <p className="text-sm">💧 Drink at least 8 glasses of water throughout the day</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                      <p className="text-sm">🥗 Include more fruits and vegetables in your diet</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                      <p className="text-sm">😴 Aim for 7-8 hours of quality sleep each night</p>
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

export default PatientDashboard;