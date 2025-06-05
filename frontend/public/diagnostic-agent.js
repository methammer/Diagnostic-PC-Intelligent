// Agent Version: 1.0.2 (Forced JS content by Bolt)
import os from 'os';

async function collectSystemInfo() {
  const cpus = os.cpus();
  const networkInterfaces = os.networkInterfaces();

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

  let totalMemoryMB = "N/A";
  let freeMemoryMB = "N/A";

  if (typeof rawTotalMem === 'number' && rawTotalMem > 0) {
    totalMemoryMB = (rawTotalMem / (1024 * 1024)).toFixed(2);
  } else {
    // console.warn("WARN: os.totalmem() did not return a valid positive number.");
  }

  if (typeof rawFreeMem === 'number' && rawFreeMem >= 0) {
    freeMemoryMB = (rawFreeMem / (1024 * 1024)).toFixed(2);
  } else {
    // console.warn("WARN: os.freemem() did not return a valid number.");
  }
  
  let userInfoData = { username: 'N/A', homedir: 'N/A (os.userInfo not available or failed)' };
  try {
    // Attempt to get userInfo, but handle potential errors gracefully
    const info = os.userInfo();
    userInfoData.username = info.username;
    userInfoData.homedir = info.homedir;
  } catch (e) {
    console.warn("WARN: os.userInfo() failed. This can happen in restricted environments or older Node.js versions. User info will be marked N/A.", e.message);
  }

  return {
    timestamp: new Date().toISOString(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    userInfo: userInfoData,
    uptime: os.uptime(),
    totalMemoryMB: totalMemoryMB,
    freeMemoryMB: freeMemoryMB,
    cpuCount: simplifiedCpus.length,
    cpus: simplifiedCpus,
    networkInterfaces: simplifiedNetwork,
    diskInfo: "Les informations détaillées sur l'espace disque (total, libre, utilisation) ne sont pas accessibles de manière fiable via les modules Node.js standards dans cet environnement. Pour un diagnostic complet, veuillez vérifier manuellement l'état des disques avec les outils système (ex: 'Gestion des disques' ou 'Get-Volume' sur Windows, 'df -h' sur Linux/macOS).",
  };
}

async function main() {
  console.log('Démarrage de l\'agent de diagnostic PC pour la collecte d\'informations...');

  try {
    const systemInfo = await collectSystemInfo();
    console.log('\nInformations système collectées (copiez le JSON ci-dessous) :\n');
    console.log(JSON.stringify(systemInfo, null, 2));
    console.log('\n\nCopiez le bloc JSON ci-dessus et collez-le dans le formulaire de diagnostic sur la page web.');
    console.log('\nAgent de collecte d\'informations terminé.');

  } catch (error) {
    console.error('L\'agent de collecte a rencontré une erreur critique:', error.message);
    // Specific check for os.userInfo issues was moved into collectSystemInfo for better encapsulation
    // The generic error is caught here.
    // We don't call process.exit(1) to allow users to see any partial info or error messages in the console.
  }
}

main();
