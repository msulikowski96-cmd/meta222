import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recommendation } from '@/types';
import { 
  Utensils, 
  Dumbbell, 
  Droplets, 
  Moon, 
  Heart, 
  CheckCircle, 
  Target, 
  Ruler, 
  Percent,
  Beef,
  Lightbulb
} from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

const iconMap: Record<string, React.ElementType> = {
  'utensils': Utensils,
  'dumbbell': Dumbbell,
  'droplets': Droplets,
  'moon': Moon,
  'heart': Heart,
  'check-circle': CheckCircle,
  'target': Target,
  'ruler': Ruler,
  'percent': Percent,
  'beef': Beef,
  'activity': Dumbbell
};

const categoryLabels: Record<string, string> = {
  'nutrition': 'Żywienie',
  'exercise': 'Aktywność',
  'hydration': 'Nawodnienie',
  'sleep': 'Sen',
  'general': 'Ogólne'
};

const categoryColors: Record<string, string> = {
  'nutrition': 'bg-green-100 text-green-800 border-green-200',
  'exercise': 'bg-orange-100 text-orange-800 border-orange-200',
  'hydration': 'bg-blue-100 text-blue-800 border-blue-200',
  'sleep': 'bg-purple-100 text-purple-800 border-purple-200',
  'general': 'bg-gray-100 text-gray-800 border-gray-200'
};

export const RecommendationsList = ({ recommendations }: RecommendationsListProps) => {
  // Group recommendations by category
  const groupedRecs = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const categoryOrder = ['nutrition', 'exercise', 'hydration', 'sleep', 'general'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6 text-amber-500" />
        <h2 className="text-2xl font-bold">Spersonalizowane rekomendacje</h2>
      </div>

      {categoryOrder.map(category => {
        const recs = groupedRecs[category];
        if (!recs || recs.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <Badge variant="outline" className={`${categoryColors[category]} px-3 py-1`}>
              {categoryLabels[category]}
            </Badge>
            
            <div className="grid grid-cols-1 gap-3">
              {recs.map((rec, index) => {
                const IconComponent = iconMap[rec.icon] || Lightbulb;
                
                return (
                  <Card 
                    key={index} 
                    className="overflow-hidden transition-all duration-300 hover:shadow-md"
                    style={{ borderLeftWidth: '4px', borderLeftColor: rec.accentColor }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className="p-3 rounded-lg flex-shrink-0"
                          style={{ backgroundColor: `${rec.accentColor}20` }}
                        >
                          <IconComponent 
                            className="w-5 h-5" 
                            style={{ color: rec.accentColor }} 
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Quick Tips */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Szybkie wskazówki
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Jedz regularnie, co 3-4 godziny, aby utrzymać stabilny metabolizm</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Spożywaj błonnik (25-35g dziennie) dla lepszej sytości i zdrowia jelit</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Unikaj napojów słodzonych - są "pustymi" kaloriami</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Planuj posiłki z wyprzedzeniem, aby uniknąć podjadania</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Monitoruj postępy regularnie, ale nie codziennie - waga waha się naturalnie</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationsList;
