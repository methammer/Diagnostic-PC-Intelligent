import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { processWithAI } from '../services/ai.service';
import { SystemInfo, defaultSystemInfo } from '../types/system.types';
import * as path from 'path';
import * as fs from 'fs';

export const createDiagnosticTask = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { problemDescription, systemInfoJSON, advancedSystemInfo } = req.body;

  let parsedSystemInfo: SystemInfo;
  if (systemInfoJSON && String(systemInfoJSON).trim() !== '') {
    try {
      const parsed = JSON.parse(String(systemInfoJSON));
      if (typeof parsed === 'object' && parsed !== null && 'platform' in parsed && 'timestamp' in parsed) {
        parsedSystemInfo = parsed as SystemInfo;
      } else {
        console.warn('Parsed systemInfoJSON is not a valid SystemInfo object (missing platform or timestamp), using default.');
        parsedSystemInfo = defaultSystemInfo;
      }
    } catch (error) {
      console.error('Failed to parse systemInfoJSON:', error);
      parsedSystemInfo = defaultSystemInfo;
    }
  } else {
    parsedSystemInfo = defaultSystemInfo;
  }

  try {
    const report = await processWithAI(parsedSystemInfo, problemDescription, advancedSystemInfo);
    res.json({ report });
  } catch (error) {
    console.error('Error processing diagnostic task:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to generate diagnostic report.', details: errorMessage });
  }
};

export const downloadWindowsScript = (req: Request, res: Response) => {
  // Assuming the backend process CWD is /home/project/backend
  // This path should resolve to /home/project/scripts/collect_windows_info.bat
  const scriptPath = path.resolve(process.cwd(), '..', 'scripts', 'collect_windows_info.bat');
  const scriptName = 'collect_windows_info.bat';

  console.log(`[Download Script] Attempting to serve script from path: ${scriptPath}`);

  if (fs.existsSync(scriptPath)) {
    console.log(`[Download Script] File found at ${scriptPath}. Initiating download for ${scriptName}.`);
    
    // res.download should set appropriate headers (Content-Type, Content-Disposition)
    res.download(scriptPath, scriptName, (err) => {
      if (err) {
        console.error(`[Download Script] Error during file transmission for ${scriptName}:`, err);
        if (!res.headersSent) {
          // If headers haven't been sent, we can send a custom error response
          res.setHeader('Content-Type', 'text/plain');
          res.status(500).send('Server error: Could not complete file download.');
        } else {
          // If headers were already sent, it's too late to send a new status code/body.
          // The connection might be already closed or corrupted.
          // Express will handle closing the connection.
          console.error('[Download Script] Headers already sent, could not send error response to client.');
        }
      } else {
        console.log(`[Download Script] Successfully sent ${scriptName}.`);
      }
    });
  } else {
    console.error(`[Download Script] File not found at: ${scriptPath}`);
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Error: Script file not found on the server.');
  }
};
