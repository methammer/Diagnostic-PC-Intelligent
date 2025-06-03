import { useState } from 'react';
import axios from 'axios';
import './App.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Ajouté pour afficher taskId
import { Label } from "@/components/ui/label"; // Ajouté pour les labels
import { Terminal, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface DiagnosticReport {
  taskId: string;
  status: string;
  results: {
    cpuUsage?: string;
    memoryUsage?: string;
    diskSpace?: string;
    osVersion?: string;
    runningProcesses?: number;
    [key: string]: any; // Pour d'autres données de diagnostic
  };
  timestamp: string;
  summary?: string;
  analysis?: Array<{ component: string; status: string; details: string; recommendation: string }>;
  potentialCauses?: string[];
  suggestedSolutions?: string[];
}

function App() {
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitDiagnostic = async () => {
    if (!problemDescription.trim()) {
      setError("Veuillez décrire votre problème.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setReport(null);
    setTaskId(null);

    try {
      const response = await axios.post<{ message: string; taskId: string }>('/api/collecte', {
        problemDescription: problemDescription,
        // Vous pouvez ajouter d'autres informations système collectées par le frontend ici si nécessaire
        systemInfo: { // Exemple de données système que l'agent pourrait envoyer
          os: navigator.platform,
          browser: navigator.userAgent,
          language: navigator.language,
        }
      });
      setTaskId(response.data.taskId);
    } catch (err) {
      console.error("Erreur lors de la soumission du diagnostic:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Erreur du serveur: ${err.response.status} - ${err.response.data.message || 'Problème lors de la soumission.'}`);
      } else {
        setError('Impossible de soumettre les données de diagnostic. Vérifiez votre connexion ou la console pour plus de détails.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetReport = async () => {
    if (!taskId) return;
    setIsLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await axios.get<DiagnosticReport>(`/api/diagnostic/${taskId}`);
      setReport(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération du rapport:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Erreur du serveur: ${err.response.status} - ${err.response.data.message || 'Problème lors de la récupération du rapport.'}`);
      } else {
        setError('Impossible de récupérer le rapport de diagnostic. Vérifiez votre connexion ou la console pour plus de détails.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center min-h-screen p-4 bg-slate-50">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-slate-800">Diagnostic PC Intelligent</h1>
        <p className="text-slate-600">Soumettez les informations de votre PC pour obtenir un diagnostic.</p>
      </header>

      <Card className="w-full max-w-2xl mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Soumettre un Diagnostic</CardTitle>
          <CardDescription>Décrivez le problème que vous rencontrez avec votre PC. Plus vous donnez de détails, meilleur sera le diagnostic.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="problemDescription" className="text-slate-700">Description du Problème</Label>
            <Textarea
              id="problemDescription"
              placeholder="Ex: Mon ordinateur est très lent au démarrage, les applications se bloquent souvent..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSubmitDiagnostic} disabled={isLoading || !problemDescription.trim()}>
            {isLoading && !report && !error ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Soumettre pour Diagnostic
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive" className="w-full max-w-2xl mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {taskId && !error && (
        <Card className="w-full max-w-2xl mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
              Diagnostic Soumis
            </CardTitle>
            <CardDescription>Votre demande de diagnostic a été reçue. Utilisez l'ID de tâche ci-dessous pour récupérer votre rapport.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor="taskId">ID de Tâche</Label>
              <Input id="taskId" type="text" value={taskId} readOnly className="mt-1" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleGetReport} disabled={isLoading}>
              {isLoading && report === null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Obtenir le Rapport
            </Button>
          </CardFooter>
        </Card>
      )}

      {isLoading && report === null && taskId && (
        <div className="w-full max-w-2xl mb-8 flex items-center justify-center p-6 bg-white rounded-lg shadow-md">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-blue-600" />
          <p className="text-slate-700">Chargement du rapport...</p>
        </div>
      )}
      
      {report && (
        <Card className="w-full max-w-2xl mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Rapport de Diagnostic</CardTitle>
            <CardDescription>Tâche ID: {report.taskId} - Statut: <span className={`font-semibold ${report.status === 'Terminé' ? 'text-green-600' : 'text-orange-500'}`}>{report.status}</span></CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.summary && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Terminal className="h-4 w-4 text-blue-700" />
                  <AlertTitle className="text-blue-800">Résumé du Diagnostic IA</AlertTitle>
                  <AlertDescription className="text-blue-700">{report.summary}</AlertDescription>
                </Alert>
            )}

            {report.analysis && report.analysis.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-700">Analyse Détaillée:</h3>
                <div className="space-y-3">
                {report.analysis.map((item, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-md">{item.component}</CardTitle>
                      <CardDescription>Statut: <span className={`font-medium ${item.status === 'Normal' ? 'text-green-600' : item.status === 'Faible' || item.status === 'Surchargé' || item.status === 'Latence élevée' ? 'text-red-600' : 'text-orange-500'}`}>{item.status}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-1 pb-3">
                      <p><strong>Détails:</strong> {item.details}</p>
                      <p><strong>Recommandation:</strong> {item.recommendation}</p>
                    </CardContent>
                  </Card>
                ))}
                </div>
              </div>
            )}
            
            {report.potentialCauses && report.potentialCauses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-700">Causes Potentielles:</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  {report.potentialCauses.map((cause, index) => <li key={index}>{cause}</li>)}
                </ul>
              </div>
            )}

            {report.suggestedSolutions && report.suggestedSolutions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-700">Solutions Suggérées:</h3>
                 <ul className="list-disc list-inside space-y-1 text-slate-600 bg-green-50 p-3 rounded-md border border-green-200">
                  {report.suggestedSolutions.map((solution, index) => <li key={index}>{solution}</li>)}
                </ul>
              </div>
            )}

            <div className="text-xs text-slate-500 pt-2 border-t mt-4">
              Rapport généré le: {new Date(report.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      <footer className="mt-auto pt-8 pb-4 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Diagnostic PC Intelligent. Tous droits réservés.</p>
        <p className="mt-1">
          Construit avec Vite, React, Shadcn UI, et beaucoup de <span role="img" aria-label="coffee">☕</span>.
        </p>
      </footer>
    </div>
  );
}

export default App;
