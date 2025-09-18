import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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
  Brain,
  BarChart3,
  User,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface PharmacistProfile {
  id: string;
  profile: {
    name: string;
    phone: string;
  };
  pharmacy_name: string;
  operating_hours: string;
  pmc_license: string;
  pmc_verified: boolean;
}

interface Prescription {
  id: string;
  prescription_number: string;
  status: string;
  issued_date: string;
  valid_until: string;
  patient_profile: {
    profile: {
      name: string;
    };
  };
  doctor_profile: {
    profile: {
      name: string;
    };
  };
  prescription_items: {
    id: string;
    quantity: number;
    dosage_instructions: string;
    frequency: string;
    status: string;
    dispensed_quantity: number;
    medication: {
      id: string;
      name: string;
      generic_name: string;
      strength: string;
    };
  }[];
}

interface Inventory {
  id: string;
  current_stock: number;
  minimum_stock_level: number;
  maximum_stock_level: number;
  unit_cost: number;
  expiry_date: string;
  batch_number: string;
  supplier: string;
  medication: {
    id: string;
    name: string;
    generic_name: string;
    strength: string;
    dosage_form: string;
  };
}

const PharmacistDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pharmacistProfile, setPharmacistProfile] = useState<PharmacistProfile | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPharmacistData();
    }
  }, [user]);

  const fetchPharmacistData = async () => {
    try {
      // Fetch pharmacist profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          pharmacist_profiles!inner (
            id,
            pharmacy_name,
            operating_hours,
            pmc_license,
            pmc_verified
          )
        `)
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      const profile = {
        id: profileData.pharmacist_profiles[0].id,
        profile: {
          name: profileData.name,
          phone: profileData.phone
        },
        ...profileData.pharmacist_profiles[0]
      };
      setPharmacistProfile(profile);

      // Fetch pending prescriptions
      const { data: prescriptionsData, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patient_profile:patient_profiles!inner (
            profile:profiles!inner (name)
          ),
          doctor_profile:doctor_profiles!inner (
            profile:profiles!inner (name)
          ),
          prescription_items (
            *,
            medication:medications (id, name, generic_name, strength)
          )
        `)
        .in('status', ['pending', 'partially_dispensed'])
        .order('issued_date', { ascending: false })
        .limit(50);

      if (prescriptionsError) throw prescriptionsError;
      setPrescriptions(prescriptionsData || []);

      // Fetch pharmacy inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('pharmacy_inventory')
        .select(`
          *,
          medication:medications (id, name, generic_name, strength, dosage_form)
        `)
        .eq('pharmacist_profile_id', profile.id)
        .order('current_stock', { ascending: true });

      if (inventoryError) throw inventoryError;
      setInventory(inventoryData || []);

  } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const dispenseMedication = async (prescriptionItemId: string, quantityToDispense: number) => {
    try {
      const { error } = await supabase
        .from('prescription_items')
        .update({
          dispensed_quantity: quantityToDispense,
          status: 'dispensed',
          dispensed_at: new Date().toISOString(),
          dispensed_by_pharmacist_id: pharmacistProfile?.id
        })
        .eq('id', prescriptionItemId);

      if (error) throw error;

      toast({
        title: 'Medication Dispensed',
        description: 'Successfully dispensed medication to patient',
      });

      // Refresh prescriptions
      fetchPharmacistData();
  } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const updateInventory = async (inventoryId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('pharmacy_inventory')
        .update({ current_stock: newStock })
        .eq('id', inventoryId);

      if (error) throw error;

      toast({
        title: 'Inventory Updated',
        description: 'Stock level has been updated successfully',
      });

      // Refresh inventory
      fetchPharmacistData();
  } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const getStockStatus = (item: Inventory) => {
    if (item.current_stock === 0) return { status: 'out-of-stock', color: 'destructive' };
    if (item.current_stock <= item.minimum_stock_level) return { status: 'low-stock', color: 'secondary' };
    if (item.current_stock >= item.maximum_stock_level) return { status: 'overstock', color: 'outline' };
    return { status: 'in-stock', color: 'default' };
  };

  const getPrescriptionUrgency = (prescription: Prescription) => {
    const daysUntilExpiry = prescription.valid_until ? 
      Math.ceil((new Date(prescription.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
    
    if (daysUntilExpiry !== null && daysUntilExpiry <= 1) return 'urgent';
    if (daysUntilExpiry !== null && daysUntilExpiry <= 3) return 'soon';
    return 'normal';
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.prescription_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient_profile.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.doctor_profile.profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => 
    item.current_stock <= item.minimum_stock_level && item.current_stock > 0
  );
  const outOfStockItems = inventory.filter(item => item.current_stock === 0);

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

  if (!pharmacistProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              Unable to load your pharmacist profile. Please contact support.
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
                  <AvatarInitials name={pharmacistProfile.profile.name} />
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {pharmacistProfile.profile.name}
                </h1>
                <p className="text-muted-foreground">
                  {pharmacistProfile.pharmacy_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  PMC: {pharmacistProfile.pmc_license} • 
                  {pharmacistProfile.pmc_verified ? ' Verified' : ' Pending Verification'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                {pharmacistProfile.operating_hours}
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Prescriptions</p>
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
                <AlertTriangle className="w-8 h-8 text-secondary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold">{lowStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-destructive" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
                  <p className="text-2xl font-bold">{outOfStockItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-success" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                  <p className="text-2xl font-bold">{inventory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <div className="mb-6 space-y-3">
            {outOfStockItems.length > 0 && (
              <Card className="border-destructive">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-destructive">
                    <XCircle className="w-5 h-5 mr-2" />
                    Out of Stock Items ({outOfStockItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {outOfStockItems.slice(0, 6).map((item) => (
                      <div key={item.id} className="text-sm">
                        {item.medication.name} - {item.medication.strength}
                      </div>
                    ))}
                    {outOfStockItems.length > 6 && (
                      <div className="text-sm text-muted-foreground">
                        +{outOfStockItems.length - 6} more items
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {lowStockItems.length > 0 && (
              <Card className="border-secondary">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-secondary">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Low Stock Items ({lowStockItems.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {lowStockItems.slice(0, 6).map((item) => (
                      <div key={item.id} className="text-sm">
                        {item.medication.name} - {item.current_stock} left
                      </div>
                    ))}
                    {lowStockItems.length > 6 && (
                      <div className="text-sm text-muted-foreground">
                        +{lowStockItems.length - 6} more items
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="prescriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="prescriptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Prescription Management</CardTitle>
                <CardDescription>Process and dispense medications</CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prescriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPrescriptions.map((prescription) => {
                    const urgency = getPrescriptionUrgency(prescription);
                    return (
                      <div 
                        key={prescription.id} 
                        className={`border rounded-lg p-4 ${
                          urgency === 'urgent' ? 'border-destructive bg-destructive/5' :
                          urgency === 'soon' ? 'border-secondary bg-secondary/5' :
                          'border-border'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-semibold">#{prescription.prescription_number}</h3>
                            <p className="text-sm text-muted-foreground">
                              Patient: {prescription.patient_profile.profile.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Doctor: {prescription.doctor_profile.profile.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Issued: {format(new Date(prescription.issued_date), 'MMM dd, yyyy')}
                              {prescription.valid_until && (
                                <> • Valid until: {format(new Date(prescription.valid_until), 'MMM dd, yyyy')}</>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {urgency === 'urgent' && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                            {urgency === 'soon' && (
                              <Badge variant="secondary" className="text-xs">Expires Soon</Badge>
                            )}
                            <Badge variant="outline">{prescription.status}</Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Medications:</h4>
                          {prescription.prescription_items.map((item) => (
                            <div key={item.id} className="bg-muted/50 p-3 rounded-lg">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium">{item.medication.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.medication.generic_name} • {item.medication.strength}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Quantity:</span> {item.quantity} units
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Instructions:</span> {item.dosage_instructions}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">Frequency:</span> {item.frequency}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {item.status === 'pending' && (
                                    <Button 
                                      size="sm"
                                      onClick={() => dispenseMedication(item.id, item.quantity)}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-1" />
                                      Dispense
                                    </Button>
                                  )}
                                  {item.status === 'dispensed' && (
                                    <Badge variant="default" className="text-xs">
                                      Dispensed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {filteredPrescriptions.length === 0 && (
                    <div className="text-center py-12">
                      <Pill className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No prescriptions found' : 'No pending prescriptions'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Management</CardTitle>
                <CardDescription>Monitor and manage your pharmacy stock</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const isExpiringSoon = new Date(item.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{item.medication.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.medication.generic_name} • {item.medication.strength} • {item.medication.dosage_form}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Batch: {item.batch_number} • Supplier: {item.supplier}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {isExpiringSoon && (
                              <Badge variant="secondary" className="text-xs">Expires Soon</Badge>
                            )}
                            <Badge variant={stockStatus.color as any} className="text-xs">
                              {stockStatus.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Current Stock</p>
                            <p className="font-semibold">{item.current_stock}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Min Level</p>
                            <p className="font-semibold">{item.minimum_stock_level}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Unit Cost</p>
                            <p className="font-semibold">₹{item.unit_cost?.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expiry Date</p>
                            <p className={`font-semibold ${isExpiringSoon ? 'text-destructive' : ''}`}>
                              {format(new Date(item.expiry_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`stock-${item.id}`} className="text-xs">Update Stock:</Label>
                              <Input
                                id={`stock-${item.id}`}
                                type="number"
                                min="0"
                                defaultValue={item.current_stock}
                                className="w-20 h-8"
                                onBlur={(e) => {
                                  const newStock = parseInt(e.target.value);
                                  if (newStock !== item.current_stock) {
                                    updateInventory(item.id, newStock);
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <Package className="w-4 h-4 mr-1" />
                            Reorder
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {inventory.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No inventory items found</p>
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
                    AI Inventory Predictions
                  </CardTitle>
                  <CardDescription>Smart inventory management insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <h4 className="font-medium text-primary">Stock Optimization</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on dispensing patterns, consider increasing Paracetamol stock by 20%.
                      </p>
                    </div>
                    <div className="p-4 bg-secondary/10 rounded-lg">
                      <h4 className="font-medium text-secondary">Demand Forecast</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Antibiotic demand expected to increase by 15% in the next month.
                      </p>
                    </div>
                    <div className="p-4 bg-accent/10 rounded-lg">
                      <h4 className="font-medium text-accent">Cost Savings</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Switch to generic alternatives could save ₹5,000 monthly.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Your pharmacy performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Prescription Fulfillment Rate</span>
                      <span className="font-bold">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Processing Time</span>
                      <span className="font-bold">12 mins</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Inventory Turnover</span>
                      <span className="font-bold">8.2x</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="font-bold">4.7/5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Monthly Revenue</span>
                      <span className="font-bold">₹2,45,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Reports</CardTitle>
                  <CardDescription>Generate pharmacy reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Daily Sales Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="w-4 h-4 mr-2" />
                      Inventory Status Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Pill className="w-4 h-4 mr-2" />
                      Prescription Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Expiry Alert Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Financial Summary
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest pharmacy transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm">
                      <p className="font-medium">Paracetamol dispensed</p>
                      <p className="text-muted-foreground text-xs">5 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Inventory updated: Amoxicillin</p>
                      <p className="text-muted-foreground text-xs">15 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">New prescription received</p>
                      <p className="text-muted-foreground text-xs">32 minutes ago</p>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">Stock alert: Low Metformin</p>
                      <p className="text-muted-foreground text-xs">1 hour ago</p>
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

export default PharmacistDashboard;