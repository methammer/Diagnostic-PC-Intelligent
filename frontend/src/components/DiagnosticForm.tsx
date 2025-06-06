import React, { useState } from 'react';

interface DiagnosticFormProps {
  onSubmit: (problemDescription: string, systemInfoJSON: string) => void;
  isLoading: boolean;
}

const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ onSubmit, isLoading }) => {
  const [problemDescription, setProblemDescription] = useState('');
  const [systemInfoJSON, setSystemInfoJSON] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      setDescriptionError('La description du problème ne peut pas être vide.');
      return;
    }
    setDescriptionError('');
    onSubmit(problemDescription, systemInfoJSON);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white shadow-xl rounded-lg">
      <div>
        <label htmlFor="problemDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Décrivez le problème que vous rencontrez :
        </label>
        <textarea
          id="problemDescription"
          name="problemDescription"
          rows={4}
          className={`input-field ${descriptionError ? 'border-red-500' : 'border-gray-300'}`}
          value={problemDescription}
          onChange={(e) => {
            setProblemDescription(e.target.value);
            if (e.target.value.trim()) setDescriptionError('');
          }}
          placeholder="Ex: Mon ordinateur est très lent au démarrage, les applications se bloquent souvent..."
        />
        {descriptionError && <p className="text-xs text-red-600 mt-1">{descriptionError}</p>}
      </div>

      <div className="space-y-4 p-4 border border-blue-200 rounded-md bg-blue-50">
        <h3 className="text-md font-semibold text-blue-700">Collecte des Informations Système</h3>
        <p className="text-xs text-gray-600">
          Pour nous aider à diagnostiquer le problème, veuillez télécharger et exécuter notre agent de collecte d'informations.
          <strong>Node.js doit être installé sur votre ordinateur pour exécuter l'agent.</strong> Si vous ne l'avez pas, vous pouvez le télécharger depuis <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">nodejs.org</a>.
        </p>
        <a
          href="/diagnostic-agent.js"
          download="diagnostic-agent.js"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Télécharger l'Agent de Diagnostic
        </a>
        <p className="text-xs text-gray-600 mt-2">
          <strong>Instructions après téléchargement :</strong>
          <ol className="list-decimal list-inside pl-4 space-y-1 mt-1">
            <li>Ouvrez un terminal (Command Prompt, PowerShell, ou Terminal).</li>
            <li>Naviguez jusqu'au dossier où vous avez téléchargé <code>diagnostic-agent.js</code>. (Ex: <code>cd Downloads</code>)</li>
            <li>Exécutez la commande : <code>node diagnostic-agent.js</code></li>
            <li>Copiez la sortie JSON complète affichée dans le terminal.</li>
            <li>Collez-la dans le champ ci-dessous.</li>
          </ol>
        </p>
      </div>

      <div>
        <label htmlFor="systemInfoJSON" className="block text-sm font-medium text-gray-700 mb-1">
          Collez ici les Informations Système (JSON) :
        </label>
        <textarea
          id="systemInfoJSON"
          name="systemInfoJSON"
          rows={8}
          className="input-field font-mono text-xs"
          value={systemInfoJSON}
          onChange={(e) => setSystemInfoJSON(e.target.value)}
          placeholder="Collez ici le JSON fourni par l'agent de diagnostic..."
        />
         <p className="text-xs text-gray-500 mt-1">
          Laissez vide si vous ne pouvez pas exécuter l'agent ou si vous n'avez pas ces informations.
        </p>
      </div>

      <div>
        <button
          type="submit"
          className="btn btn-primary w-full flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Soumission en cours...
            </>
          ) : (
            'Soumettre le Diagnostic'
          )}
        </button>
      </div>
    </form>
  );
};

export default DiagnosticForm;
