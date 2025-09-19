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
  Pill, 
  Package, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  User,
  QrCode,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

interface MedicineOrder {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  doctorName: string;
  issuedDate: string;
  status: 'pending' | 'verified' | 'dispensed' | 'completed';
  medicines: {
    name: string;
    dosage: string;
    quantity: number;
    dispensed: number;
  }[];
  qrVerified: boolean;
}

interface QRVerification {
  patientId: string;
  patientName: string;
  prescriptionNumber: string;
  verified: boolean;
  medicines: {
    name: string;
    dosage: string;
    quantity: number;
  }[];
}

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [medicineOrders, setMedicineOrders] = useState<MedicineOrder[]>([]);
  const [qrCode, setQrCode] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState<QRVerification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMockData();
  }, []);

  const fetchMockData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock medicine orders data
    const mockOrders: MedicineOrder[] = [
      {
        id: '1',
        prescriptionNumber: 'RX001234',
        patientName: 'John Doe',
        doctorName: 'Dr. Rajesh Sharma',
        issuedDate: '2024-01-15',
        status: 'pending',
        medicines: [
          { name: 'Paracetamol 500mg', dosage: '500mg', quantity: 20, dispensed: 0 },
          { name: 'Vitamin D3', dosage: '1000 IU', quantity: 30, dispensed: 0 }
        ],
        qrVerified: false
      },
      {
        id: '2',
        prescriptionNumber: 'RX001235',
        patientName: 'Jane Smith',
        doctorName: 'Dr. Priya Patel',
        issuedDate: '2024-01-10',
        status: 'verified',
        medicines: [
          { name: 'Aspirin 75mg', dosage: '75mg', quantity: 30, dispensed: 0 }
        ],
        qrVerified: true
      },
      {
        id: '3',
        prescriptionNumber: 'RX001236',
        patientName: 'Robert Johnson',
        doctorName: 'Dr. Singh',
        issuedDate: '2024-01-08',
        status: 'dispensed',
        medicines: [
          { name: 'Amoxicillin 250mg', dosage: '250mg', quantity: 21, dispensed: 21 }
        ],
        qrVerified: true
      }
    ];

    setMedicineOrders(mockOrders);
    setLoading(false);
  };

  const verifyPatientQR = async () => {
    if (!qrCode.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing QR Code',
        description: 'Please enter a patient QR code to verify',
      });
      return;
    }

    setLoading(true);
    
    // Simulate QR verification process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock verification result based on existing orders
    const order = medicineOrders.find(o => o.prescriptionNumber.includes(qrCode.slice(-4)));
    
    if (order) {
      const mockVerification: QRVerification = {
        patientId: qrCode,
        patientName: order.patientName,
        prescriptionNumber: order.prescriptionNumber,
        verified: true,
        medicines: order.medicines
      };

      setVerifiedOrder(mockVerification);
      
      // Update order status to verified
      setMedicineOrders(prev => 
        prev.map(o => 
          o.prescriptionNumber === order.prescriptionNumber 
            ? { ...o, qrVerified: true, status: 'verified' }
            : o
        )
      );

      toast({
        title: 'Patient Verified',
        description: `Successfully verified ${mockVerification.patientName}`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'Invalid QR code or prescription not found',
      });
    }
    
    setLoading(false);
  };

  const dispenseMedicine = async (orderId: string, medicineIndex: number, quantity: number) => {
    setLoading(true);
    
    // Simulate dispensing process
    await new Promise(resolve => setTimeout(resolve, 1000));

    setMedicineOrders(prev => 
      prev.map(order => {
        if (order.id === orderId) {
          const updatedMedicines = [...order.medicines];
          updatedMedicines[medicineIndex] = {
            ...updatedMedicines[medicineIndex],
            dispensed: quantity
          };
          
          const allDispensed = updatedMedicines.every(med => med.dispensed >= med.quantity);
          
          return {
            ...order,
            medicines: updatedMedicines,
            status: allDispensed ? 'completed' : 'dispensed'
          };
        }
        return order;
      })
    );

    toast({
      title: 'Medicine Dispensed',
      description: 'Successfully dispensed medicine to patient',
    });
    
    setLoading(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'verified': return 'default';
      case 'dispensed': return 'outline';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'verified': return <CheckCircle className="w-4 h-4" />;
      case 'dispensed': return <Package className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = medicineOrders.filter(order =>
    order.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
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
                  <AvatarInitials name={user?.email || 'Pharmacist'} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {user?.email?.split('@')[0] || 'Pharmacist'}
                </h1>
                <p className="text-muted-foreground">
                  MedCare Pharmacy
                </p>
                <p className="text-sm text-muted-foreground">
                  PMC: PMC123456 • Verified
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                9:00 AM - 9:00 PM
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
                <Clock className="w-8 h-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">
                    {medicineOrders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Verified Orders</p>
                  <p className="text-2xl font-bold">
                    {medicineOrders.filter(o => o.status === 'verified').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-accent" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Dispensed Today</p>
                  <p className="text-2xl font-bold">
                    {medicineOrders.filter(o => o.status === 'dispensed' || o.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{medicineOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Medicine Orders</TabsTrigger>
            <TabsTrigger value="qr-verify">QR Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medicine Orders</CardTitle>
                <CardDescription>Process prescription orders and dispense medications</CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <Card key={order.id} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold">#{order.prescriptionNumber}</h3>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center space-x-1">
                              {getStatusIcon(order.status)}
                              <span>{order.status}</span>
                            </Badge>
                            {order.qrVerified && (
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                QR Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Patient: {order.patientName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Doctor: {order.doctorName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Issued: {format(new Date(order.issuedDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium">Medicines:</h4>
                        {order.medicines.map((medicine, medicineIndex) => (
                          <div key={medicineIndex} className="bg-muted p-3 rounded">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{medicine.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Dosage: {medicine.dosage} • Quantity: {medicine.quantity}
                                </p>
                                <p className="text-sm">
                                  Dispensed: {medicine.dispensed} / {medicine.quantity}
                                </p>
                              </div>
                              
                              {order.status === 'verified' && medicine.dispensed < medicine.quantity && (
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max={medicine.quantity - medicine.dispensed}
                                    placeholder="Qty"
                                    className="w-20"
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter') {
                                        const qty = parseInt((e.target as HTMLInputElement).value);
                                        if (qty > 0) {
                                          dispenseMedicine(order.id, medicineIndex, medicine.dispensed + qty);
                                          (e.target as HTMLInputElement).value = '';
                                        }
                                      }
                                    }}
                                  />
                                  <Button 
                                    size="sm"
                                    onClick={() => {
                                      const input = document.querySelector(`input[type="number"]`) as HTMLInputElement;
                                      const qty = parseInt(input?.value || '0');
                                      if (qty > 0) {
                                        dispenseMedicine(order.id, medicineIndex, medicine.dispensed + qty);
                                        if (input) input.value = '';
                                      }
                                    }}
                                  >
                                    Dispense
                                  </Button>
                                </div>
                              )}
                              
                              {medicine.dispensed >= medicine.quantity && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Complete
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No medicine orders found</p>
                      <p className="text-sm text-muted-foreground">Orders will appear here when patients bring prescriptions</p>
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
                <CardDescription>Verify patient identity and prescription authenticity using QR codes</CardDescription>
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
                    <Button onClick={verifyPatientQR} disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Patient'}
                    </Button>
                  </div>
                </div>

                {verifiedOrder && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center">
                        <QrCode className="w-5 h-5 mr-2" />
                        Patient Verified Successfully
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p><strong>Patient:</strong> {verifiedOrder.patientName}</p>
                          <p><strong>Patient ID:</strong> {verifiedOrder.patientId}</p>
                        </div>
                        <div>
                          <p><strong>Prescription:</strong> #{verifiedOrder.prescriptionNumber}</p>
                          <p><strong>Status:</strong> Verified</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Prescribed Medicines:</h4>
                        <div className="space-y-2">
                          {verifiedOrder.medicines.map((medicine, index) => (
                            <div key={index} className="bg-white p-2 rounded border">
                              <p className="font-medium">{medicine.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {medicine.dosage} • Quantity: {medicine.quantity}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button onClick={() => {
                          setQrCode('');
                          setVerifiedOrder(null);
                        }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Process Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* QR Verification Tips */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">QR Verification Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Each patient has a unique QR code for identity verification</p>
                      <p>• QR codes link patients to their valid prescriptions</p>
                      <p>• Verify patient identity before dispensing any medication</p>
                      <p>• Report any suspicious or invalid QR codes immediately</p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PharmacistDashboard;