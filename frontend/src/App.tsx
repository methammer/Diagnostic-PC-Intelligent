import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Import axios to check for AxiosError
import DiagnosticForm from './components/DiagnosticForm';
import ReportDisplay from './components/ReportDisplay';
import { submitDiagnostic, getDiagnosticReport, DiagnosticReport, SubmitDiagnosticPayload } from './services/apiClient';
import { DiagnosticTaskStatus } from '../../backend/src/models/diagnosticTask.model';

const App: React.FC = () => {
  const [taskId, setTaskId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<DiagnosticReport | null>(null);
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (problemDescription: string) => {
    console.log("[App.tsx handleFormSubmit] Submitting diagnostic with description:", problemDescription);
    setIsLoadingForm(true);
    setError(null);
    setReportData(null);
    setTaskId(null);

    try {
      const payload: SubmitDiagnosticPayload = { problemDescription };
      const response = await submitDiagnostic(payload);
      console.log("[App.tsx handleFormSubmit] Submission successful, taskId:", response.taskId);
      setTaskId(response.taskId);
      setIsLoadingReport(true); // Start loading report
    } catch (err) {
      console.error("[App.tsx handleFormSubmit] Erreur lors de la soumission du diagnostic:", err);
      let detailedError = "Impossible de soumettre la demande de diagnostic. Veuillez réessayer.";
      if (axios.isAxiosError(err)) {
        if (err.response) {
          detailedError += ` (Erreur ${err.response.status}: ${err.response.data?.message || err.message})`;
        } else if (err.request) {
          detailedError += ` (Le serveur n'a pas répondu. Vérifiez la connexion et si le backend est démarré.)`;
        } else {
          detailedError += ` (${err.message})`;
        }
      } else if (err instanceof Error) {
        detailedError += ` (${err.message})`;
      }
      setError(detailedError);
      setReportData(null);
    } finally {
      setIsLoadingForm(false);
    }
  };
  
  const pollReport = useCallback(async (currentTaskId: string) => {
    console.log(`[App.tsx pollReport] Polling for taskId: ${currentTaskId}`);
    try {
      const report = await getDiagnosticReport(currentTaskId);
      console.log(`[App.tsx pollReport] Received report for ${currentTaskId}:`, JSON.parse(JSON.stringify(report))); // Deep copy for logging
      setReportData(report);
      
      if (report.status === DiagnosticTaskStatus.PENDING || report.status === DiagnosticTaskStatus.PROCESSING) {
        console.log(`[App.tsx pollReport] Task ${currentTaskId} is ${report.status}. Continuing polling.`);
        return true; // Continue polling
      } else {
        console.log(`[App.tsx pollReport] Task ${currentTaskId} is ${report.status}. Stopping polling.`);
        setIsLoadingReport(false); // Stop loading indicator
        if (report.status === DiagnosticTaskStatus.FAILED && report.errorDetails) {
          // setError(`Le diagnostic a échoué: ${report.errorDetails}`); // Let ReportDisplay handle it or set a general error
        }
        return false; // Stop polling
      }
    } catch (err) {
      console.error(`[App.tsx pollReport] Error polling for ${currentTaskId}:`, err);
      let pollErrorMsg = `Erreur lors de la récupération du rapport. (ID: ${currentTaskId})`;
       if (axios.isAxiosError(err) && err.response) {
          pollErrorMsg += ` (Status: ${err.response.status} - ${err.response.data?.message || err.message})`;
        } else if (err instanceof Error) {
          pollErrorMsg += ` (${err.message})`;
        }
      setError(pollErrorMsg);
      setIsLoadingReport(false);
      setReportData(prev => {
        const existingData = prev && prev.taskId === currentTaskId ? prev : null;
        return {
          taskId: currentTaskId,
          status: DiagnosticTaskStatus.FAILED,
          submittedAt: existingData?.submittedAt || new Date().toISOString(),
          errorDetails: `Erreur de récupération: ${ (err as any)?.message || 'inconnue'}. ${existingData?.errorDetails || ''}`,
          problemDescription: existingData?.problemDescription,
        };
      });
      return false; // Stop polling due to error
    }
  }, []);


  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    console.log(`[App.tsx useEffect] taskId: ${taskId}, isLoadingReport: ${isLoadingReport}`);

    if (taskId && isLoadingReport) {
      console.log(`[App.tsx useEffect] Initial poll for ${taskId}`);
      pollReport(taskId).then(shouldContinuePolling => {
        if (shouldContinuePolling) {
          console.log(`[App.tsx useEffect] Setting up interval polling for ${taskId}`);
          intervalId = setInterval(async () => {
            if (!taskId) { 
                 console.log(`[App.tsx useEffect interval] taskId became null, clearing interval.`);
                 clearInterval(intervalId);
                 return;
            }
            console.log(`[App.tsx useEffect interval] Polling for ${taskId}`);
            const keepPolling = await pollReport(taskId);
            if (!keepPolling) {
              console.log(`[App.tsx useEffect interval] Stopping polling for ${taskId}, clearing interval.`);
              clearInterval(intervalId);
            }
          }, 3000);
        } else {
          console.log(`[App.tsx useEffect] Initial poll for ${taskId} indicated no further polling needed.`);
        }
      });
    } else {
      console.log(`[App.tsx useEffect] Conditions not met for polling (taskId: ${taskId}, isLoadingReport: ${isLoadingReport}).`);
    }
    
    return () => {
      if (intervalId) {
        console.log(`[App.tsx useEffect cleanup] Clearing interval for taskId: ${taskId}`);
        clearInterval(intervalId);
      }
    };
  }, [taskId, isLoadingReport, pollReport]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-slate-100 to-gray-200 py-8 px-4 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-brand-primary mb-2">
          Diagnostic PC Intelligent
        </h1>
        <p className="text-xl text-brand-secondary">
          Obtenez une analyse IA de l'état de votre PC.
        </p>
      </header>

      <main className="w-full max-w-2xl">
        {!taskId && !reportData && (
          <div className="card">
            <DiagnosticForm onSubmit={handleFormSubmit} isLoading={isLoadingForm} />
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border-red-500 border animate-fade-in my-4">
            <p className="text-red-700 font-semibold text-center p-4">{error}</p>
          </div>
        )}
        
        {(isLoadingReport || reportData) && (
          <div className="mt-8">
            <ReportDisplay reportData={reportData} isLoading={isLoadingReport && (!reportData || reportData.status === DiagnosticTaskStatus.PENDING || reportData.status === DiagnosticTaskStatus.PROCESSING)} />
          </div>
        )}

        {reportData && (reportData.status === DiagnosticTaskStatus.COMPLETED || reportData.status === DiagnosticTaskStatus.FAILED) && (
           <div className="mt-8 text-center animate-fade-in">
            <button 
              onClick={() => {
                console.log("[App.tsx] Clicked 'Effectuer un nouveau diagnostic'");
                setTaskId(null);
                setReportData(null);
                setError(null);
                setIsLoadingReport(false);
              }}
              className="btn btn-secondary"
            >
              Effectuer un nouveau diagnostic
            </button>
          </div>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Diagnostic PC Intelligent. Tous droits réservés.</p>
      </footer>
    </div>
  );
};

export default App;
