'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera, Keyboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { log } from '@/utils/log';

export default function ScanPage() {
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const router = useRouter();

  const handleScanSuccess = (decodedText: string) => {
    log('scan', 'QR-Code erkannt:', decodedText);
    
    // QR-Code Format: volk-001, standort-heimstand, etc.
    if (decodedText.startsWith('volk-')) {
      const stocknr = decodedText.replace('volk-', '');
      router.push(`/mod/volk/${stocknr}`);
    } else if (decodedText.startsWith('standort-')) {
      // Später: Standort-Übersicht
      log('scan', 'Standort-QR erkannt, noch nicht implementiert');
    } else {
      log('scan', 'Unbekanntes QR-Format:', decodedText);
    }
  };

  const handleScanError = (error: string) => {
    // Normale Scanner-Fehler nicht loggen (zu viele)
    if (!error.includes('NotFoundException')) {
      log('scan', 'Scanner-Fehler:', error);
    }
  };

  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(handleScanSuccess, handleScanError);
    scannerRef.current = scanner;
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      handleScanSuccess(manualInput.trim());
    }
  };

  useEffect(() => {
    if (scanMode === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [scanMode]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          QR-Scanner
        </h2>
        <p className="text-gray-600">
          Scannen Sie den QR-Code am Bienenstock oder geben Sie die Stock-Nr. manuell ein
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={scanMode === 'camera' ? 'default' : 'outline'}
          onClick={() => setScanMode('camera')}
          className="flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          Kamera
        </Button>
        <Button
          variant={scanMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setScanMode('manual')}
          className="flex items-center gap-2"
        >
          <Keyboard className="w-4 h-4" />
          Manuell
        </Button>
      </div>

      {scanMode === 'camera' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR-Code Scanner
            </CardTitle>
            <CardDescription>
              Halten Sie die Kamera über den QR-Code am Bienenstock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div id="qr-reader" className="w-full"></div>
            {isScanning && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Scanner aktiv - QR-Code vor die Kamera halten
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Manuelle Eingabe
            </CardTitle>
            <CardDescription>
              Geben Sie die Stock-Nummer oder den QR-Code ein
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="z.B. 001 oder volk-001"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <Button 
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
              className="w-full"
            >
              Stockkarte öffnen
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h3 className="font-medium text-amber-900 mb-2">
          Demo QR-Codes
        </h3>
        <p className="text-sm text-amber-700 mb-3">
          Für Tests können Sie diese Codes manuell eingeben:
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <code className="bg-white px-2 py-1 rounded border">volk-001</code>
          <code className="bg-white px-2 py-1 rounded border">volk-002</code>
          <code className="bg-white px-2 py-1 rounded border">volk-003</code>
          <code className="bg-white px-2 py-1 rounded border">volk-101</code>
        </div>
      </div>
    </div>
  );
}