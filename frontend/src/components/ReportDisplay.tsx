import React from 'react';
import { DiagnosticReport } from '../services/apiClient';
import { DiagnosticTaskStatus } from '../types/diagnosticTaskStatus'; // Updated import path

interface ReportDisplayProps {
  reportData: DiagnosticReport | null;
  isLoading: boolean;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ reportData, isLoading }) => {
  if (isLoading && !reportData) {
    return (
      <div className="card text-center animate-fade-in">
        <div className="flex justify-center items-center mb-4">
          <div className="loading-spinner"></div>
        </div>
        <p className="text-brand-primary font-semibold text-lg">Chargement du rapport...</p>
      </div>
    );
  }

  if (!reportData) {
    return null; // Ne rien afficher si pas de données et pas en chargement initial
  }

  const getStatusClass = (status: DiagnosticTaskStatus) => {
    switch (status) {
      case DiagnosticTaskStatus.PENDING: return 'status-pending';
      case DiagnosticTaskStatus.PROCESSING: return 'status-processing';
      case DiagnosticTaskStatus.COMPLETED: return 'status-completed';
      case DiagnosticTaskStatus.FAILED: return 'status-failed';
      default: return 'text-gray-700';
    }
  };
  
  const renderAnalysis = (analysis: any[]) => {
    return analysis.map((item, index) => (
      <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <h4 className="font-semibold text-brand-dark text-md">{item.component} - <span className={item.status === 'Normal' ? 'text-green-600' : 'text-red-600'}>{item.status}</span></h4>
        <p className="text-sm text-gray-600 mt-1">{item.details}</p>
        <p className="text-sm text-brand-primary mt-1"><em>Recommandation: {item.recommendation}</em></p>
      </div>
    ));
  };

  const renderList = (title: string, items: string[]) => {
    return (
      <>
        <h4 className="font-semibold text-brand-dark text-md mt-4 mb-2">{title}</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {items.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </>
    );
  };


  return (
    <div className="card animate-slide-in-bottom">
      <h2 className="text-2xl font-bold text-brand-dark mb-2">Rapport de Diagnostic</h2>
      <p className="text-sm text-gray-500 mb-1">ID de la tâche: <span className="font-mono">{reportData.taskId}</span></p>
      <p className="text-md font-semibold mb-4">
        Statut: <span className={`${getStatusClass(reportData.status)} font-bold`}>{reportData.status}</span>
      </p>

      {reportData.problemDescription && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-brand-dark mb-1">Problème soumis :</h3>
          <p className="text-gray-700 italic bg-gray-100 p-3 rounded-md">{reportData.problemDescription}</p>
        </div>
      )}
      
      {(reportData.status === DiagnosticTaskStatus.PENDING || reportData.status === DiagnosticTaskStatus.PROCESSING) && reportData.message && (
         <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
            <div className="flex justify-center items-center mb-2">
              <div className="loading-spinner"></div>
            </div>
            <p className="text-brand-info">{reportData.message}</p>
        </div>
      )}

      {reportData.status === DiagnosticTaskStatus.FAILED && (
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-semibold text-red-600 mb-1">Échec du Diagnostic</h3>
          <p className="text-red-700">{reportData.errorDetails || 'Une erreur est survenue.'}</p>
          {reportData.diagnosticReport?.error && <p className="text-sm text-red-700 mt-1">Détails IA: {reportData.diagnosticReport.error}</p>}
        </div>
      )}

      {reportData.status === DiagnosticTaskStatus.COMPLETED && reportData.diagnosticReport && (
        <div>
          <h3 className="text-xl font-semibold text-brand-dark mt-6 mb-3">Détails de l'Analyse IA :</h3>
          
          <div className="mb-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
             <h4 className="font-semibold text-brand-dark text-md">Résumé IA</h4>
             <p className="text-sm text-gray-700 mt-1">{reportData.diagnosticReport.summary}</p>
             <p className="text-xs text-gray-500 mt-2">Score de confiance: { (reportData.diagnosticReport.confidenceScore * 100).toFixed(1) }%</p>
          </div>

          {reportData.diagnosticReport.analysis && renderAnalysis(reportData.diagnosticReport.analysis)}
          {reportData.diagnosticReport.potentialCauses && renderList("Causes Potentielles", reportData.diagnosticReport.potentialCauses)}
          {reportData.diagnosticReport.suggestedSolutions && renderList("Solutions Suggérées", reportData.diagnosticReport.suggestedSolutions)}
          
          <p className="text-xs text-gray-400 mt-6 text-right">Rapport généré le: {new Date(reportData.diagnosticReport.generatedAt).toLocaleString('fr-FR')}</p>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500">
        <p>Soumis le: {new Date(reportData.submittedAt).toLocaleString('fr-FR')}</p>
        {reportData.completedAt && <p>Terminé le: {new Date(reportData.completedAt).toLocaleString('fr-FR')}</p>}
      </div>
    </div>
  );
};

export default ReportDisplay;
