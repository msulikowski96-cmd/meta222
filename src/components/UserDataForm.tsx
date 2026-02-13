import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserData } from '@/types';
import { activityLevels } from '@/hooks/useMetabolicCalculations';
import { Calculator, ChevronRight, Ruler, Weight, User, Activity } from 'lucide-react';

interface UserDataFormProps {
  onSubmit: (data: UserData) => void;
  initialData?: Partial<UserData>;
}

interface FormState {
  height: string;
  weight: string;
  age: string;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  waist: string;
  hip: string;
  neck: string;
}

export const UserDataForm = ({ onSubmit, initialData }: UserDataFormProps) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<FormState>({
    height: initialData?.height?.toString() || '',
    weight: initialData?.weight?.toString() || '',
    age: initialData?.age?.toString() || '',
    gender: initialData?.gender || 'male',
    activityLevel: initialData?.activityLevel || 'moderate',
    waist: initialData?.waist?.toString() || '',
    hip: initialData?.hip?.toString() || '',
    neck: initialData?.neck?.toString() || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.height || Number(formData.height) < 50 || Number(formData.height) > 300) {
      newErrors.height = 'Wprowadź prawidłowy wzrost (50-300 cm)';
    }
    if (!formData.weight || Number(formData.weight) < 20 || Number(formData.weight) > 500) {
      newErrors.weight = 'Wprowadź prawidłową wagę (20-500 kg)';
    }
    if (!formData.age || Number(formData.age) < 10 || Number(formData.age) > 120) {
      newErrors.age = 'Wprowadź prawidłowy wiek (10-120 lat)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        height: Number(formData.height),
        weight: Number(formData.weight),
        age: Number(formData.age),
        gender: formData.gender,
        activityLevel: formData.activityLevel,
        waist: formData.waist ? Number(formData.waist) : undefined,
        hip: formData.hip ? Number(formData.hip) : undefined,
        neck: formData.neck ? Number(formData.neck) : undefined
      });
    }
  };

  const updateField = (field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calculator className="w-6 h-6" />
          Kalkulator Metaboliczny
        </CardTitle>
        <p className="text-emerald-100 mt-1">
          Wprowadź swoje dane, aby obliczyć wskaźniki zdrowia
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Podstawowe
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Zaawansowane
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    Wzrost (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="np. 175"
                    value={formData.height}
                    onChange={(e) => updateField('height', e.target.value)}
                    className={errors.height ? 'border-red-500' : ''}
                  />
                  {errors.height && <p className="text-sm text-red-500">{errors.height}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2">
                    <Weight className="w-4 h-4 text-emerald-600" />
                    Waga (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="np. 70"
                    value={formData.weight}
                    onChange={(e) => updateField('weight', e.target.value)}
                    className={errors.weight ? 'border-red-500' : ''}
                  />
                  {errors.weight && <p className="text-sm text-red-500">{errors.weight}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    Wiek (lat)
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="np. 30"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    className={errors.age ? 'border-red-500' : ''}
                  />
                  {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    Płeć
                  </Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => updateField('gender', value as 'male' | 'female')}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="cursor-pointer">Mężczyzna</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="cursor-pointer">Kobieta</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity" className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Poziom aktywności
                </Label>
                <Select
                  value={formData.activityLevel}
                  onValueChange={(value) => updateField('activityLevel', value as FormState['activityLevel'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz poziom aktywności" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div>
                          <span className="font-medium">{level.label}</span>
                          <span className="text-muted-foreground ml-2">- {level.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Dodatkowe pomiary pozwalają na dokładniejszą analizę składu ciała.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="waist" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    Obwód talii (cm)
                  </Label>
                  <Input
                    id="waist"
                    type="number"
                    placeholder="np. 80"
                    value={formData.waist}
                    onChange={(e) => updateField('waist', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Wymagane dla WHtR i % tłuszczu</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hip" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    Obwód bioder (cm)
                  </Label>
                  <Input
                    id="hip"
                    type="number"
                    placeholder="np. 95"
                    value={formData.hip}
                    onChange={(e) => updateField('hip', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Wymagane dla BAI (kobiety)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neck" className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    Obwód szyi (cm)
                  </Label>
                  <Input
                    id="neck"
                    type="number"
                    placeholder="np. 38"
                    value={formData.neck}
                    onChange={(e) => updateField('neck', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Wymagane dla % tłuszczu</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-amber-800 mb-2">Co możesz obliczyć?</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• <strong>WHtR</strong> (Waist-to-Height Ratio) - lepszy wskaźnik ryzyka niż BMI</li>
                  <li>• <strong>BAI</strong> (Body Adiposity Index) - szacunek % tkanki tłuszczowej</li>
                  <li>• <strong>% tłuszczu ciała</strong> - metoda US Navy</li>
                  <li>• <strong>LBM</strong> (Lean Body Mass) - masa beztłuszczowa</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          <Button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
            size="lg"
          >
            Oblicz wskaźniki
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserDataForm;
