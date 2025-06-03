import os from 'os';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001/api/collecte';

async function collectSystemInfo() {
  const cpus = os.cpus();
  const networkInterfaces = os.networkInterfaces();

  // Simplifier les informations CPU et réseau pour la lisibilité
  const simplifiedCpus = cpus.map(cpu => ({
    model: cpu.model,
    speed: cpu.speed,
  }));
  const simplifiedNetwork = {};
  for (const [key, value] of Object.entries(networkInterfaces)) {
    if (value) {
      simplifiedNetwork[key] = value.map(iface => ({
        address: iface.address,
        netmask: iface.netmask,
        family: iface.family,
        mac: iface.mac,
        internal: iface.internal,
      }));
    }
  }

  const rawTotalMem = os.totalmem();
  const rawFreeMem = os.freemem();

  // Debugging memory values
  console.log(`DEBUG: Raw os.totalmem(): ${rawTotalMem}, type: ${typeof rawTotalMem}`);
  console.log(`DEBUG: Raw os.freemem(): ${rawFreeMem}, type: ${typeof rawFreeMem}`);

  let totalMemoryMB = "N/A";
  let freeMemoryMB = "N/A";

  if (typeof rawTotalMem === 'number' && rawTotalMem > 0) {
    totalMemoryMB = (rawTotalMem / (1024 * 1024)).toFixed(2);
  } else {
    console.warn("WARN: os.totalmem() did not return a valid positive number.");
  }

  if (typeof rawFreeMem === 'number' && rawFreeMem >= 0) { // freeMem can be 0
    freeMemoryMB = (rawFreeMem / (1024 * 1024)).toFixed(2);
  } else {
    console.warn("WARN: os.freemem() did not return a valid number.");
  }

  return {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    userInfo: {
      username: os.userInfo().username,
      homedir: os.userInfo().homedir,
    },
    uptime: os.uptime(), // en secondes
    totalMemoryMB: totalMemoryMB,
    freeMemoryMB: freeMemoryMB,
    cpuCount: simplifiedCpus.length,
    cpus: simplifiedCpus, // Informations détaillées sur chaque cœur
    // loadavg: os.loadavg(), // Charge moyenne système (Unix uniquement)
    networkInterfaces: simplifiedNetwork,
    // Note: Disk space info is complex to get reliably with pure Node.js stdlib
    // without platform-specific commands or external libraries.
    // This will be added in a future iteration if feasible.
    diskInfo: "Non collecté dans cette version",
  };
}

async function sendDiagnosticData(systemInfo, problemDescription) {
  try {
    console.log(`Envoi des données de diagnostic à ${BACKEND_URL}...`);
    const payload = {
      systemInfo: systemInfo
    };
    if (problemDescription) {
      payload.problemDescription = problemDescription;
    }

    const response = await axios.post(BACKEND_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Données envoyées avec succès. Réponse du serveur:');
    console.log(JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi des données de diagnostic:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Pas de réponse reçue:', error.request);
    } else {
      console.error('Erreur de configuration:', error.message);
    }
    throw error; // Rethrow pour que l'appelant puisse gérer
  }
}

async function main() {
  console.log('Démarrage de l\'agent de diagnostic PC...');

  // Récupérer la description du problème depuis les arguments de la ligne de commande
  // Exemple: node main.js "Mon PC est très lent après le démarrage"
  const problemDescriptionFromArgs = process.argv.slice(2).join(' ');

  if (!problemDescriptionFromArgs) {
    console.warn('Aucune description de problème fournie en argument.');
    console.warn('Exemple d\'utilisation: node main.js "Mon PC est très lent"');
    // Optionnel: demander à l'utilisateur de saisir une description ici
  } else {
    console.log(`Description du problème: ${problemDescriptionFromArgs}`);
  }

  try {
    const systemInfo = await collectSystemInfo();
    console.log('\nInformations système collectées:');
    // Afficher un résumé des informations collectées
    console.log(`  Plateforme: ${systemInfo.platform} ${systemInfo.release} (${systemInfo.arch})`);
    console.log(`  Hostname: ${systemInfo.hostname}`);
    console.log(`  Utilisateur: ${systemInfo.userInfo.username}`);
    console.log(`  Mémoire: ${systemInfo.freeMemoryMB} Mo libres / ${systemInfo.totalMemoryMB} Mo total`);
    console.log(`  CPUs: ${systemInfo.cpuCount} x ${systemInfo.cpus[0]?.model || 'N/A'}`);
    console.log('--- Début des informations système détaillées ---');
    console.log(JSON.stringify(systemInfo, null, 2));
    console.log('--- Fin des informations système détaillées ---\n');

    await sendDiagnosticData(systemInfo, problemDescriptionFromArgs || undefined);
    console.log('\nAgent de diagnostic terminé.');

  } catch (error) {
    console.error('L\'agent de diagnostic a rencontré une erreur critique:', error.message);
    process.exit(1); // Quitter avec un code d'erreur
  }
}

main();
