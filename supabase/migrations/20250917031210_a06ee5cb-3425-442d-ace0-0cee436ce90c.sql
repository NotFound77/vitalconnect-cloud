-- Create medical records and prescription management tables

-- Medications table for drug information
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage_form TEXT NOT NULL, -- tablet, capsule, syrup, injection, etc.
  strength TEXT NOT NULL, -- mg, ml, etc.
  manufacturer TEXT,
  description TEXT,
  side_effects TEXT[],
  contraindications TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Medical records for patients
CREATE TABLE public.medical_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_profile_id UUID NOT NULL,
  doctor_profile_id UUID NOT NULL,
  diagnosis TEXT NOT NULL,
  symptoms TEXT[],
  notes TEXT,
  visit_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  vital_signs JSONB, -- blood pressure, heart rate, temperature, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescriptions issued by doctors
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medical_record_id UUID NOT NULL,
  patient_profile_id UUID NOT NULL,
  doctor_profile_id UUID NOT NULL,
  prescription_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'partially_dispensed', 'cancelled')),
  issued_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescription items (individual medications in a prescription)
CREATE TABLE public.prescription_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prescription_id UUID NOT NULL,
  medication_id UUID NOT NULL,
  quantity INTEGER NOT NULL,
  dosage_instructions TEXT NOT NULL,
  frequency TEXT NOT NULL, -- twice daily, once daily, etc.
  duration_days INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dispensed', 'cancelled')),
  dispensed_quantity INTEGER DEFAULT 0,
  dispensed_at TIMESTAMP WITH TIME ZONE,
  dispensed_by_pharmacist_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pharmacy inventory
CREATE TABLE public.pharmacy_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pharmacist_profile_id UUID NOT NULL,
  medication_id UUID NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  minimum_stock_level INTEGER NOT NULL DEFAULT 10,
  maximum_stock_level INTEGER NOT NULL DEFAULT 1000,
  unit_cost DECIMAL(10,2),
  expiry_date DATE,
  batch_number TEXT,
  supplier TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pharmacist_profile_id, medication_id, batch_number)
);

-- Medication notifications for patients
CREATE TABLE public.medication_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_profile_id UUID NOT NULL,
  prescription_item_id UUID NOT NULL,
  notification_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'acknowledged')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.medical_records 
  ADD CONSTRAINT fk_medical_records_patient 
  FOREIGN KEY (patient_profile_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_medical_records_doctor 
  FOREIGN KEY (doctor_profile_id) REFERENCES public.doctor_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.prescriptions 
  ADD CONSTRAINT fk_prescriptions_medical_record 
  FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_prescriptions_patient 
  FOREIGN KEY (patient_profile_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_prescriptions_doctor 
  FOREIGN KEY (doctor_profile_id) REFERENCES public.doctor_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.prescription_items 
  ADD CONSTRAINT fk_prescription_items_prescription 
  FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_prescription_items_medication 
  FOREIGN KEY (medication_id) REFERENCES public.medications(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_prescription_items_pharmacist 
  FOREIGN KEY (dispensed_by_pharmacist_id) REFERENCES public.pharmacist_profiles(id) ON DELETE SET NULL;

ALTER TABLE public.pharmacy_inventory 
  ADD CONSTRAINT fk_pharmacy_inventory_pharmacist 
  FOREIGN KEY (pharmacist_profile_id) REFERENCES public.pharmacist_profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_pharmacy_inventory_medication 
  FOREIGN KEY (medication_id) REFERENCES public.medications(id) ON DELETE CASCADE;

ALTER TABLE public.medication_notifications 
  ADD CONSTRAINT fk_medication_notifications_patient 
  FOREIGN KEY (patient_profile_id) REFERENCES public.patient_profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT fk_medication_notifications_prescription_item 
  FOREIGN KEY (prescription_item_id) REFERENCES public.prescription_items(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medications (public read access for all healthcare providers)
CREATE POLICY "Healthcare providers can view medications" 
ON public.medications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type IN ('doctor', 'pharmacist')
  )
);

-- RLS Policies for medical records
CREATE POLICY "Patients can view their own medical records" 
ON public.medical_records FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_profiles pp 
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = medical_records.patient_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view medical records they created" 
ON public.medical_records FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp 
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = medical_records.doctor_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can create medical records" 
ON public.medical_records FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp 
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = medical_records.doctor_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their own medical records" 
ON public.medical_records FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp 
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = medical_records.doctor_profile_id 
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for prescriptions
CREATE POLICY "Patients can view their own prescriptions" 
ON public.prescriptions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_profiles pp 
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = prescriptions.patient_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can view prescriptions they created" 
ON public.prescriptions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp 
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = prescriptions.doctor_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Pharmacists can view all prescriptions" 
ON public.prescriptions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'pharmacist'
  )
);

CREATE POLICY "Doctors can create prescriptions" 
ON public.prescriptions FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp 
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = prescriptions.doctor_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their own prescriptions" 
ON public.prescriptions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.doctor_profiles dp 
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE dp.id = prescriptions.doctor_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Pharmacists can update prescription status" 
ON public.prescriptions FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'pharmacist'
  )
);

-- RLS Policies for prescription items
CREATE POLICY "Users can view prescription items for accessible prescriptions" 
ON public.prescription_items FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions 
    WHERE prescriptions.id = prescription_items.prescription_id
  )
);

CREATE POLICY "Doctors can create prescription items" 
ON public.prescription_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.prescriptions pr
    JOIN public.doctor_profiles dp ON dp.id = pr.doctor_profile_id
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE pr.id = prescription_items.prescription_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Doctors can update their prescription items" 
ON public.prescription_items FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.prescriptions pr
    JOIN public.doctor_profiles dp ON dp.id = pr.doctor_profile_id
    JOIN public.profiles p ON p.id = dp.profile_id
    WHERE pr.id = prescription_items.prescription_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Pharmacists can update prescription items" 
ON public.prescription_items FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'pharmacist'
  )
);

-- RLS Policies for pharmacy inventory
CREATE POLICY "Pharmacists can manage their own inventory" 
ON public.pharmacy_inventory FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.pharmacist_profiles pp 
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = pharmacy_inventory.pharmacist_profile_id 
    AND p.user_id = auth.uid()
  )
);

-- RLS Policies for medication notifications
CREATE POLICY "Patients can view their own notifications" 
ON public.medication_notifications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_profiles pp 
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = medication_notifications.patient_profile_id 
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update their own notifications" 
ON public.medication_notifications FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.patient_profiles pp 
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = medication_notifications.patient_profile_id 
    AND p.user_id = auth.uid()
  )
);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescription_items_updated_at
  BEFORE UPDATE ON public.prescription_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacy_inventory_updated_at
  BEFORE UPDATE ON public.pharmacy_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medication_notifications_updated_at
  BEFORE UPDATE ON public.medication_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_medical_records_patient_id ON public.medical_records(patient_profile_id);
CREATE INDEX idx_medical_records_doctor_id ON public.medical_records(doctor_profile_id);
CREATE INDEX idx_medical_records_visit_date ON public.medical_records(visit_date);

CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_profile_id);
CREATE INDEX idx_prescriptions_doctor_id ON public.prescriptions(doctor_profile_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);
CREATE INDEX idx_prescriptions_number ON public.prescriptions(prescription_number);

CREATE INDEX idx_prescription_items_prescription_id ON public.prescription_items(prescription_id);
CREATE INDEX idx_prescription_items_medication_id ON public.prescription_items(medication_id);
CREATE INDEX idx_prescription_items_status ON public.prescription_items(status);

CREATE INDEX idx_pharmacy_inventory_pharmacist_id ON public.pharmacy_inventory(pharmacist_profile_id);
CREATE INDEX idx_pharmacy_inventory_medication_id ON public.pharmacy_inventory(medication_id);
CREATE INDEX idx_pharmacy_inventory_stock_level ON public.pharmacy_inventory(current_stock);

CREATE INDEX idx_medication_notifications_patient_id ON public.medication_notifications(patient_profile_id);
CREATE INDEX idx_medication_notifications_time ON public.medication_notifications(notification_time);
CREATE INDEX idx_medication_notifications_status ON public.medication_notifications(status);

-- Insert sample medications
INSERT INTO public.medications (name, generic_name, dosage_form, strength, manufacturer, description) VALUES
('Paracetamol 500mg', 'Paracetamol', 'Tablet', '500mg', 'Generic Pharma', 'Pain reliever and fever reducer'),
('Amoxicillin 250mg', 'Amoxicillin', 'Capsule', '250mg', 'Antibiotic Co.', 'Broad-spectrum antibiotic'),
('Omeprazole 20mg', 'Omeprazole', 'Capsule', '20mg', 'Gastro Meds', 'Proton pump inhibitor for acid reflux'),
('Metformin 500mg', 'Metformin', 'Tablet', '500mg', 'Diabetes Care', 'Blood sugar control medication'),
('Amlodipine 5mg', 'Amlodipine', 'Tablet', '5mg', 'Cardio Pharma', 'Calcium channel blocker for hypertension'),
('Cetirizine 10mg', 'Cetirizine', 'Tablet', '10mg', 'Allergy Relief', 'Antihistamine for allergies'),
('Ibuprofen 400mg', 'Ibuprofen', 'Tablet', '400mg', 'Pain Management', 'Anti-inflammatory pain reliever'),
('Salbutamol Inhaler', 'Salbutamol', 'Inhaler', '100mcg/dose', 'Respiratory Care', 'Bronchodilator for asthma');