import React, { useState } from 'react';

interface DiagnosticFormProps {
  onSubmit: (problemDescription: string) => void;
  isLoading: boolean;
}

const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ onSubmit, isLoading }) => {
  const [problemDescription, setProblemDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      alert('Veuillez décrire votre problème.');
      return;
    }
    onSubmit(problemDescription);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div>
        <label htmlFor="problemDescription" className="block text-lg font-medium text-brand-dark mb-2">
          Décrivez le problème de votre PC :
        </label>
        <textarea
          id="problemDescription"
          name="problemDescription"
          rows={6}
          className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-shadow"
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
          placeholder="Ex: Mon ordinateur est très lent au démarrage, les applications se bloquent souvent..."
          disabled={isLoading}
        />
      </div>
      <div>
        <button
          type="submit"
          className="w-full btn btn-primary flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner mr-3"></div>
              Analyse en cours...
            </>
          ) : (
            'Soumettre pour diagnostic'
          )}
        </button>
      </div>
    </form>
  );
};

export default DiagnosticForm;
