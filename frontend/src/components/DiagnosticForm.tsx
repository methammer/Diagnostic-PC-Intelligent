import React, { useState } from 'react';

interface DiagnosticFormProps {
  onSubmit: (problemDescription: string, systemInfoJSON: string, advancedSystemInfo?: string) => void;
  isLoading: boolean;
}

const DiagnosticForm: React.FC<DiagnosticFormProps> = ({ onSubmit, isLoading }) => {
  const [problemDescription, setProblemDescription] = useState('');
  const [systemInfoJSON, setSystemInfoJSON] = useState('');
  const [advancedSystemInfo, setAdvancedSystemInfo] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) {
      setDescriptionError('La description du problème ne peut pas être vide.');
      return;
    }
    setDescriptionError('');
    onSubmit(problemDescription, systemInfoJSON, advancedSystemInfo);
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
        <h3 className="text-md font-semibold text-blue-700">Collecte des Informations Système de Base (Méthode Manuelle)</h3>
        <p className="text-xs text-gray-600">
          Exécutez l'agent <code>diagnostic-agent.js</code> (Node.js) comme précédemment et collez sa sortie JSON ci-dessous.
        </p>
         <ol className="list-decimal list-inside pl-4 space-y-1 mt-1 text-xs text-gray-600">
            <li>Créez <code>diagnostic-agent.js</code>, copiez-y le code fourni par l'assistant (si vous ne l'avez pas déjà).</li>
            <li>Exécutez <code>node diagnostic-agent.js</code> dans un terminal sur votre machine.</li>
            <li>Copiez la sortie JSON complète.</li>
          </ol>
      </div>
      
      <div>
        <label htmlFor="systemInfoJSON" className="block text-sm font-medium text-gray-700 mb-1">
          Collez ici les Informations Système de Base (JSON de <code>diagnostic-agent.js</code>) :
        </label>
        <textarea
          id="systemInfoJSON"
          name="systemInfoJSON"
          rows={8}
          className="input-field font-mono text-xs"
          value={systemInfoJSON}
          onChange={(e) => setSystemInfoJSON(e.target.value)}
          placeholder="Collez ici le JSON fourni par l'agent de diagnostic Node.js..."
        />
         <p className="text-xs text-gray-500 mt-1">
          Laissez vide si vous ne pouvez pas exécuter l'agent Node.js.
        </p>
      </div>

      <div className="space-y-4 p-4 border border-green-200 rounded-md bg-green-50">
        <h3 className="text-md font-semibold text-green-700">Collecte d'Informations Système Avancées (Optionnel - pour Windows)</h3>
        <p className="text-xs text-gray-600">
          Pour un diagnostic plus approfondi sur Windows, vous pouvez télécharger et exécuter un script <code>.bat</code>.
        </p>
        <div className="my-3">
          <a
            href="/api/diagnostics/download-script"
            download="collect_windows_info.bat"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-2">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            Télécharger <code>collect_windows_info.bat</code>
          </a>
        </div>
        <ol className="list-decimal list-inside pl-4 space-y-1 mt-1 text-xs text-gray-600">
          <li>Téléchargez le script <code>collect_windows_info.bat</code> en utilisant le bouton ci-dessus.</li>
          <li>Sauvegardez-le sur votre ordinateur.</li>
          <li>Exécutez <code>collect_windows_info.bat</code> (double-cliquez dessus ou exécutez-le depuis un terminal).</li>
          <li>
            Une fois le script terminé, copiez TOUT le texte affiché dans la fenêtre de commande.
          </li>
          <li>Collez ce texte dans le champ ci-dessous.</li>
        </ol>
         <p className="text-xs text-gray-500 mt-2">
          Ce script utilise des commandes Windows comme <code>driverquery</code>, <code>wmic</code>, et <code>tasklist</code>.
        </p>
      </div>

      <div>
        <label htmlFor="advancedSystemInfo" className="block text-sm font-medium text-gray-700 mb-1">
          Collez ici les Informations Système Avancées (sortie du script <code>.bat</code> - Optionnel) :
        </label>
        <textarea
          id="advancedSystemInfo"
          name="advancedSystemInfo"
          rows={10}
          className="input-field font-mono text-xs"
          value={advancedSystemInfo}
          onChange={(e) => setAdvancedSystemInfo(e.target.value)}
          placeholder="Collez ici la sortie complète du script collect_windows_info.bat si vous l'avez exécuté..."
        />
         <p className="text-xs text-gray-500 mt-1">
          Laissez vide si vous n'êtes pas sur Windows ou si vous n'exécutez pas ce script.
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
