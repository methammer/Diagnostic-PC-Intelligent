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

      <div>
        <label htmlFor="systemInfoJSON" className="block text-sm font-medium text-gray-700 mb-1">
          Informations Système (JSON) :
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Exécutez l'agent de diagnostic (<code>node agent/main.js</code>), copiez la sortie JSON et collez-la ici.
          Laissez vide si vous n'avez pas ces informations.
        </p>
        <textarea
          id="systemInfoJSON"
          name="systemInfoJSON"
          rows={8}
          className="input-field font-mono text-xs"
          value={systemInfoJSON}
          onChange={(e) => setSystemInfoJSON(e.target.value)}
          placeholder='Collez ici le JSON fourni par "agent/main.js"...'
        />
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
