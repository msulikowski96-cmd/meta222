import { useMemo } from 'react';
import type { 
  UserData, 
  MetabolicResults, 
  BMIZone, 
  Recommendation
} from '@/types';

export interface ActivityLevelOption {
  value: 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
  label: string;
  description: string;
  multiplier: number;
}

export const activityLevels: ActivityLevelOption[] = [
  {
    value: 'sedentary',
    label: 'Siedzący',
    description: 'Brak aktywności fizycznej',
    multiplier: 1.2
  },
  {
    value: 'light',
    label: 'Lekka aktywność',
    description: '1-2 razy w tygodniu',
    multiplier: 1.375
  },
  {
    value: 'moderate',
    label: 'Umiarkowana aktywność',
    description: '3-4 razy w tygodniu',
    multiplier: 1.55
  },
  {
    value: 'active',
    label: 'Aktywny',
    description: '5-6 razy w tygodniu',
    multiplier: 1.725
  },
  {
    value: 'very-active',
    label: 'Bardzo aktywny',
    description: 'Codziennie + praca fizyczna',
    multiplier: 1.9
  }
];

export const getBMIZone = (bmi: number): BMIZone => {
  if (bmi < 16) {
    return {
      label: 'Wygłodzenie',
      color: '#8B0000',
      range: '< 16',
      description: 'Poważne niedożywienie - skonsultuj się z lekarzem'
    };
  } else if (bmi < 17) {
    return {
      label: 'Wychudzenie',
      color: '#CD5C5C',
      range: '16 - 16.9',
      description: 'Znaczna niedowaga - wymaga interwencji'
    };
  } else if (bmi < 18.5) {
    return {
      label: 'Niedowaga',
      color: '#E8A87C',
      range: '17 - 18.4',
      description: 'Niedowaga - rozważ zwiększenie masy ciała'
    };
  } else if (bmi < 25) {
    return {
      label: 'Prawidłowa waga',
      color: '#27AE60',
      range: '18.5 - 24.9',
      description: 'Twoja waga jest w normie - utrzymuj zdrowe nawyki'
    };
  } else if (bmi < 30) {
    return {
      label: 'Nadwaga',
      color: '#F39C12',
      range: '25 - 29.9',
      description: 'Nadwaga - rozważ zwiększenie aktywności fizycznej'
    };
  } else if (bmi < 35) {
    return {
      label: 'Otyłość I stopnia',
      color: '#E67E22',
      range: '30 - 34.9',
      description: 'Otyłość - skonsultuj się z lekarzem lub dietetykiem'
    };
  } else if (bmi < 40) {
    return {
      label: 'Otyłość II stopnia',
      color: '#E74C3C',
      range: '35 - 39.9',
      description: 'Znaczna otyłość - wymaga interwencji medycznej'
    };
  } else {
    return {
      label: 'Otyłość III stopnia',
      color: '#8B0000',
      range: '≥ 40',
      description: 'Poważna otyłość - natychmiastowa konsultacja lekarska'
    };
  }
};

export const getWHtRZone = (whtr: number, gender: 'male' | 'female'): BMIZone => {
  const thresholds = gender === 'male' 
    ? { low: 0.35, healthy: 0.43, overweight: 0.53, obese: 0.58 }
    : { low: 0.35, healthy: 0.42, overweight: 0.49, obese: 0.54 };
  
  if (whtr < thresholds.low) {
    return {
      label: 'Niedowaga',
      color: '#E8A87C',
      range: `< ${thresholds.low}`,
      description: 'Zbyt niski stosunek talii do wzrostu'
    };
  } else if (whtr < thresholds.healthy) {
    return {
      label: 'Zdrowy',
      color: '#27AE60',
      range: `${thresholds.low} - ${thresholds.healthy}`,
      description: 'Prawidłowy stosunek talii do wzrostu'
    };
  } else if (whtr < thresholds.overweight) {
    return {
      label: 'Nadwaga',
      color: '#F39C12',
      range: `${thresholds.healthy} - ${thresholds.overweight}`,
      description: 'Zwiększone ryzyko zdrowotne'
    };
  } else if (whtr < thresholds.obese) {
    return {
      label: 'Otyłość',
      color: '#E74C3C',
      range: `${thresholds.overweight} - ${thresholds.obese}`,
      description: 'Wysokie ryzyko zdrowotne'
    };
  } else {
    return {
      label: 'Poważna otyłość',
      color: '#8B0000',
      range: `≥ ${thresholds.obese}`,
      description: 'Bardzo wysokie ryzyko zdrowotne'
    };
  }
};

export const getBAIZone = (bai: number, gender: 'male' | 'female'): BMIZone => {
  const thresholds = gender === 'male'
    ? { low: 8, healthy: 16, overweight: 20, obese: 25 }
    : { low: 18, healthy: 26, overweight: 31, obese: 36 };
    
  if (bai < thresholds.low) {
    return {
      label: 'Niedowaga',
      color: '#E8A87C',
      range: `< ${thresholds.low}%`,
      description: 'Zbyt niski poziom tkanki tłuszczowej'
    };
  } else if (bai < thresholds.healthy) {
    return {
      label: 'Zdrowy',
      color: '#27AE60',
      range: `${thresholds.low}% - ${thresholds.healthy}%`,
      description: 'Prawidłowy poziom tkanki tłuszczowej'
    };
  } else if (bai < thresholds.overweight) {
    return {
      label: 'Nadwaga',
      color: '#F39C12',
      range: `${thresholds.healthy}% - ${thresholds.overweight}%`,
      description: 'Zwiększony poziom tkanki tłuszczowej'
    };
  } else if (bai < thresholds.obese) {
    return {
      label: 'Otyłość',
      color: '#E74C3C',
      range: `${thresholds.overweight}% - ${thresholds.obese}%`,
      description: 'Wysoki poziom tkanki tłuszczowej'
    };
  } else {
    return {
      label: 'Poważna otyłość',
      color: '#8B0000',
      range: `≥ ${thresholds.obese}%`,
      description: 'Bardzo wysoki poziom tkanki tłuszczowej'
    };
  }
};

export const getBodyFatCategory = (bodyFat: number, gender: 'male' | 'female'): string => {
  const categories = gender === 'male'
    ? [
        { max: 6, label: 'Niezbędny tłuszcz', color: '#3498DB' },
        { max: 14, label: 'Sportowiec', color: '#27AE60' },
        { max: 18, label: 'Fitness', color: '#2ECC71' },
        { max: 25, label: 'Przeciętny', color: '#F39C12' },
        { max: 100, label: 'Otyły', color: '#E74C3C' }
      ]
    : [
        { max: 14, label: 'Niezbędny tłuszcz', color: '#3498DB' },
        { max: 21, label: 'Sportowiec', color: '#27AE60' },
        { max: 25, label: 'Fitness', color: '#2ECC71' },
        { max: 32, label: 'Przeciętny', color: '#F39C12' },
        { max: 100, label: 'Otyły', color: '#E74C3C' }
      ];
      
  const category = categories.find(c => bodyFat <= c.max);
  return category?.label || 'Nieznany';
};

export const useMetabolicCalculations = (userData: UserData | null): MetabolicResults | null => {
  return useMemo(() => {
    if (!userData) return null;
    
    const { height, weight, age, gender, activityLevel, waist, hip, neck } = userData;
    const heightM = height / 100;
    const isMale = gender === 'male';
    
    // BMI calculation
    const bmi = weight / (heightM * heightM);
    const bmiZone = getBMIZone(bmi);
    
    // BMR calculation (Mifflin-St Jeor Equation)
    let bmr = 10 * weight + 6.25 * height - 5 * age;
    bmr = isMale ? bmr + 5 : bmr - 161;
    
    // TDEE calculation
    const activity = activityLevels.find(a => a.value === activityLevel);
    const tdee = bmr * (activity?.multiplier || 1.2);
    
    // WHtR (Waist-to-Height Ratio)
    let whtr: number | undefined;
    let whtrZone: BMIZone | undefined;
    if (waist && waist > 0) {
      whtr = waist / height;
      whtrZone = getWHtRZone(whtr, gender);
    }
    
    // BAI (Body Adiposity Index)
    let bai: number | undefined;
    let baiZone: BMIZone | undefined;
    if (hip && hip > 0) {
      bai = (hip / Math.pow(heightM, 1.5)) - 18;
      baiZone = getBAIZone(bai, gender);
    }
    
    // Body Fat % (US Navy Method)
    let bodyFat: number | undefined;
    let bodyFatCategory: string | undefined;
    if (waist && neck && waist > 0 && neck > 0) {
      if (isMale) {
        bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
      } else {
        if (hip && hip > 0) {
          bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
        }
      }
      if (bodyFat && bodyFat > 0 && bodyFat < 60) {
        bodyFatCategory = getBodyFatCategory(bodyFat, gender);
      }
    }
    
    // Lean Body Mass
    const lbm = bodyFat ? weight * (1 - bodyFat / 100) : undefined;
    
    // Ideal Weight (Devine Formula)
    let idealWeightMin: number;
    let idealWeightMax: number;
    if (isMale) {
      idealWeightMin = 50 + 0.9 * (height - 152);
      idealWeightMax = 52 + 0.9 * (height - 152);
    } else {
      idealWeightMin = 45.5 + 0.9 * (height - 152);
      idealWeightMax = 47.5 + 0.9 * (height - 152);
    }
    
    // Water intake (ml per kg)
    const waterIntake = weight * 35;
    
    // BMI Prime
    const bmiPrime = bmi / 25;
    
    // Ponderal Index
    const ponderalIndex = weight / (heightM * heightM * heightM);
    
    return {
      bmi: Math.round(bmi * 10) / 10,
      bmiZone,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      whtr: whtr ? Math.round(whtr * 100) / 100 : undefined,
      whtrZone,
      bai: bai ? Math.round(bai * 10) / 10 : undefined,
      baiZone,
      bodyFat: bodyFat ? Math.round(bodyFat * 10) / 10 : undefined,
      bodyFatCategory,
      lbm: lbm ? Math.round(lbm * 10) / 10 : undefined,
      idealWeight: { min: Math.round(idealWeightMin), max: Math.round(idealWeightMax) },
      waterIntake: Math.round(waterIntake),
      bmiPrime: Math.round(bmiPrime * 100) / 100,
      ponderalIndex: Math.round(ponderalIndex * 10) / 10
    };
  }, [userData]);
};

export const generateRecommendations = (
  results: MetabolicResults, 
  userData: UserData
): Recommendation[] => {
  const recs: Recommendation[] = [];
  const { bmiZone, tdee, bodyFat, whtrZone } = results;
  
  // BMI-based recommendations
  if (bmiZone.label.includes('Niedowaga') || bmiZone.label.includes('Wychudzenie')) {
    recs.push({
      icon: 'utensils',
      title: 'Zwiększ kaloryczność',
      description: `Twoje zapotrzebowanie to około ${tdee} kcal. Rozważ zwiększenie spożycia o 300-500 kcal dziennie, aby bezpiecznie przytyć. Skonsultuj się z dietetykiem.`,
      accentColor: '#E8A87C',
      category: 'nutrition'
    });
  } else if (bmiZone.label.includes('Nadwaga') || bmiZone.label.includes('Otyłość')) {
    recs.push({
      icon: 'target',
      title: 'Deficyt kaloryczny',
      description: `Przy TDEE ${tdee} kcal, rozważ redukcję o 300-500 kcal dziennie. To pozwoli na zdrową utratę 0.5-1 kg tygodniowo.`,
      accentColor: '#E74C3C',
      category: 'nutrition'
    });
  } else {
    recs.push({
      icon: 'check-circle',
      title: 'Utrzymuj balans',
      description: `Twoje BMI jest w normie! Utrzymuj spożycie około ${tdee} kcal dziennie, aby zachować zdrową wagę.`,
      accentColor: '#27AE60',
      category: 'nutrition'
    });
  }
  
  // Body fat recommendation
  if (bodyFat) {
    recs.push({
      icon: 'percent',
      title: 'Skład ciała',
      description: `Twój poziom tkanki tłuszczowej to ${bodyFat}%. ${results.bodyFatCategory}. Regularnie monitoruj zmiany w składzie ciała.`,
      accentColor: '#9B59B6',
      category: 'general'
    });
  }
  
  // WHtR recommendation
  if (whtrZone) {
    recs.push({
      icon: 'ruler',
      title: 'Obwód talii',
      description: `Stosunek talii do wzrostu: ${results.whtr}. ${whtrZone.description}. Pamiętaj, że obwód talii jest ważniejszym wskaźnikiem ryzyka niż sama waga.`,
      accentColor: '#3498DB',
      category: 'general'
    });
  }
  
  // Exercise recommendation
  recs.push({
    icon: 'dumbbell',
    title: 'Aktywność fizyczna',
    description: 'Zalecane jest co najmniej 150 minut umiarkowanej aktywności fizycznej tygodniowo lub 75 minut intensywnych ćwiczeń. Dodaj trening siłowy 2x w tygodniu.',
    accentColor: '#E67E22',
    category: 'exercise'
  });
  
  // Hydration
  recs.push({
    icon: 'droplets',
    title: 'Nawodnienie',
    description: `Pij co najmniej ${Math.round(results.waterIntake / 1000 * 10) / 10} litra wody dziennie. Nawodnienie wpływa na metabolizm, termogenezę i ogólne samopoczucie.`,
    accentColor: '#3498DB',
    category: 'hydration'
  });
  
  // Sleep
  recs.push({
    icon: 'moon',
    title: 'Regeneracja',
    description: 'Sen 7-9 godzin dziennie wspomaga metabolizm, regenerację mięśni i regulację hormonów odpowiedzialnych za apetyt (leptyna i grelinę).',
    accentColor: '#9B59B6',
    category: 'sleep'
  });
  
  // Protein
  const proteinTarget = Math.round(userData.weight * 1.6);
  recs.push({
    icon: 'beef',
    title: 'Białko',
    description: `Spożywaj około ${proteinTarget}g białka dziennie (1.6g/kg masy ciała). Białko wspomaga sytość, budowę mięśni i termogenezę.`,
    accentColor: '#27AE60',
    category: 'nutrition'
  });
  
  return recs;
};

export default useMetabolicCalculations;
