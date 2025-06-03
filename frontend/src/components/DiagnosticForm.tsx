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

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Collecte des Informations Système :
        </p>
        <a
          href="/diagnostic-agent.js"
          download="diagnostic-agent.js"
          className="btn btn-outline w-full flex items-center justify-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          <span>Télécharger l'Agent de Diagnostic</span>
        </a>
        <p className="text-xs text-gray-500">
          1. Téléchargez l'agent ci-dessus.
          <br />
          2. Exécutez-le sur votre PC avec Node.js: <code>node diagnostic-agent.js</code>
          <br />
          3. Copiez la sortie JSON complète générée par l'agent.
          <br />
          4. Collez-la dans le champ ci-dessous.
        </p>
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
            placeholder='Collez ici le JSON fourni par "diagnostic-agent.js"...'
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="btn btn-primary w-full flex justify-center items-center"
          disabled={isLoading || !problemDescription.trim()}
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
