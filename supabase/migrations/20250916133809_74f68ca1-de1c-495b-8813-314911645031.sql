-- Create enum for user types
CREATE TYPE public.user_type AS ENUM ('patient', 'doctor', 'pharmacist');

-- Create profiles table for all users
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  user_type user_type NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  qr_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patient profiles table
CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  age INTEGER NOT NULL,
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  address TEXT NOT NULL,
  aadhaar_number TEXT UNIQUE,
  aadhaar_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create doctor profiles table
CREATE TABLE public.doctor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  experience INTEGER NOT NULL,
  specialization TEXT NOT NULL,
  imr_license TEXT UNIQUE NOT NULL,
  imr_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pharmacist profiles table
CREATE TABLE public.pharmacist_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  pharmacy_name TEXT NOT NULL,
  operating_hours TEXT NOT NULL,
  pmc_license TEXT UNIQUE NOT NULL,
  pmc_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacist_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for patient profiles
CREATE POLICY "Patients can view their own profile" ON public.patient_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = patient_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can create their own profile" ON public.patient_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = patient_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update their own profile" ON public.patient_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = patient_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Create RLS policies for doctor profiles
CREATE POLICY "Doctors can view their own profile" ON public.doctor_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = doctor_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can create their own profile" ON public.doctor_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = doctor_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Doctors can update their own profile" ON public.doctor_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = doctor_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Create RLS policies for pharmacist profiles
CREATE POLICY "Pharmacists can view their own profile" ON public.pharmacist_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = pharmacist_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacists can create their own profile" ON public.pharmacist_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = pharmacist_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Pharmacists can update their own profile" ON public.pharmacist_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = pharmacist_profiles.profile_id 
      AND profiles.user_id = auth.uid()
    )
  );

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
  BEFORE UPDATE ON public.patient_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_profiles_updated_at
  BEFORE UPDATE ON public.doctor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacist_profiles_updated_at
  BEFORE UPDATE ON public.pharmacist_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();