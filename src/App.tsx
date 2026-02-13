import { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'sonner';
import type { UserData } from '@/types';
import { 
  useMetabolicCalculations, 
  generateRecommendations 
} from '@/hooks/useMetabolicCalculations';
import { useMeasurementHistory } from '@/hooks/useMeasurementHistory';
import { useMacroPlanner } from '@/hooks/useMacroPlanner';
import { UserDataForm } from '@/components/UserDataForm';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { RecommendationsList } from '@/components/RecommendationsList';
import { MeasurementHistory } from '@/components/MeasurementHistory';
import { MacroPlanner } from '@/components/MacroPlanner';
import { 
  Calculator, 
  History, 
  Utensils, 
  Lightbulb, 
  Save,
  Download,
  Moon,
  Sun,
  Heart
} from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import './App.css';

function App() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('calculator');
  const [darkMode, setDarkMode] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const results = useMetabolicCalculations(userData);
  const recommendations = results && userData 
    ? generateRecommendations(results, userData) 
    : [];

  const {
    measurements,
    addMeasurement,
    deleteMeasurement,
    clearHistory,
    getProgress
  } = useMeasurementHistory();

  const {
    meals,
    macroTargets,
    addFoodToMeal,
    removeFoodFromMeal,
    getDailyTotals,
    getRemainingMacros,
    getMacroPercentages,
    generateMealPlan
  } = useMacroPlanner();

  const handleFormSubmit = (data: UserData) => {
    setUserData(data);
    toast.success('Wskaźniki obliczone pomyślnie!');
    
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSaveMeasurement = () => {
    if (userData && results) {
      addMeasurement(userData);
      toast.success('Pomiar zapisany!');
    }
  };

  const handleExportResults = () => {
    if (!results || !userData) return;

    const exportData = {
      date: format(new Date(), 'dd MMMM yyyy', { locale: pl }),
      userData,
      results,
      recommendations
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metabolic-results-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Wyniki wyeksportowane!');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const progress = getProgress(30);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 ${darkMode ? 'dark' : ''}`}>
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  MetabolicAI Pro
                </h1>
                <p className="text-xs text-muted-foreground">Zaawansowany kalkulator zdrowia</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="rounded-full"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Banner */}
        {progress && measurements.length > 1 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm opacity-90">Twój postęp (ostatnie 30 dni)</p>
                <p className="text-2xl font-bold">
                  {progress.weightChange <= 0 ? '' : '+'}{progress.weightChange} kg
                  <span className="text-sm font-normal opacity-75 ml-2">
                    ({progress.bmiChange <= 0 ? '' : '+'}{progress.bmiChange} BMI)
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Liczba pomiarów</p>
                <p className="text-2xl font-bold">{measurements.length}</p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-fit">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Kalkulator</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Rekomendacje</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">Historia</span>
            </TabsTrigger>
            <TabsTrigger value="meals" className="flex items-center gap-2">
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Posiłki</span>
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <UserDataForm onSubmit={handleFormSubmit} initialData={userData || undefined} />
            
            {results && (
              <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-2xl font-bold">Twoje wyniki</h2>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleSaveMeasurement}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Zapisz pomiar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleExportResults}
                      className="flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Eksportuj
                    </Button>
                  </div>
                </div>
                
                <ResultsDashboard results={results} />
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            {recommendations.length > 0 ? (
              <RecommendationsList recommendations={recommendations} />
            ) : (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">
                  Najpierw oblicz swoje wskaźniki w zakładce Kalkulator
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => setActiveTab('calculator')}
                >
                  Przejdź do kalkulatora
                </Button>
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <MeasurementHistory 
              measurements={measurements}
              onDelete={deleteMeasurement}
              onClear={clearHistory}
            />
          </TabsContent>

          {/* Meals Tab */}
          <TabsContent value="meals">
            <MacroPlanner
              meals={meals}
              macroTargets={macroTargets}
              dailyTotals={getDailyTotals()}
              remainingMacros={getRemainingMacros()}
              macroPercentages={getMacroPercentages()}
              onGeneratePlan={generateMealPlan}
              onAddFood={addFoodToMeal}
              onRemoveFood={removeFoodFromMeal}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold">MetabolicAI Pro</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Aplikacja służy wyłącznie do celów informacyjnych. 
              Przed rozpoczęciem jakiejkolwiek diety lub programu treningowego skonsultuj się z lekarzem.
            </p>
            <p className="text-sm text-muted-foreground">
              © 2026 MetabolicAI Pro
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
