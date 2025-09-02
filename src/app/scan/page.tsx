'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useScanStore } from '@/lib/store'
import { dbHelpers } from '@/lib/database'
import { QrCode, Nfc, Search, Camera, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Volk, Standort } from '@/lib/schemas'

export default function ScanPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { scanMode, setScanMode, isScanning, setScanning } = useScanStore()
  const [manualInput, setManualInput] = useState('')
  const [scanResult, setScanResult] = useState<{
    type: 'volk' | 'standort'
    entity: Volk | Standort
  } | null>(null)
  const [hasNFC, setHasNFC] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Check for NFC support
    if ('NDEFReader' in window) {
      setHasNFC(true)
    }
  }, [])

  useEffect(() => {
    if (scanMode === 'qr' && !cameraError) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => stopCamera()
  }, [scanMode, cameraError])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        setCameraError(null)
        
        // Start QR detection
        detectQRCode()
      }
    } catch (error) {
      console.error('Camera access failed:', error)
      setCameraError('Kamera-Zugriff fehlgeschlagen. Bitte verwenden Sie die manuelle Eingabe.')
      setScanMode('manual')
      toast({
        title: "Kamera-Fehler",
        description: "Kamera-Zugriff nicht möglich. Verwenden Sie die manuelle Eingabe.",
        variant: "destructive"
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  const detectQRCode = () => {
    // This is a simplified QR detection - in production, use a proper QR library like jsQR
    const canvas = canvasRef.current
    const video = videoRef.current
    
    if (!canvas || !video) return

    const context = canvas.getContext('2d')
    if (!context) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Here you would use a QR code detection library
        // For now, we'll simulate detection after a delay
        // In production, integrate with jsQR or similar
      }
      
      if (isScanning && scanMode === 'qr') {
        requestAnimationFrame(scan)
      }
    }
    
    scan()
  }

  const handleNFCScan = async () => {
    if (!('NDEFReader' in window)) {
      toast({
        title: "NFC nicht unterstützt",
        description: "Ihr Gerät unterstützt kein NFC.",
        variant: "destructive"
      })
      return
    }

    try {
      const ndef = new (window as any).NDEFReader()
      await ndef.scan()
      
      ndef.addEventListener('reading', ({ message }: any) => {
        for (const record of message.records) {
          if (record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding)
            const nfcData = textDecoder.decode(record.data)
            handleScanResult(nfcData)
          }
        }
      })

      toast({
        title: "NFC bereit",
        description: "Halten Sie Ihr Gerät an den NFC-Tag."
      })
    } catch (error) {
      console.error('NFC scan failed:', error)
      toast({
        title: "NFC-Fehler",
        description: "NFC-Scan fehlgeschlagen. Verwenden Sie QR-Code oder manuelle Eingabe.",
        variant: "destructive"
      })
      setScanMode('qr')
    }
  }

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return
    await handleScanResult(manualInput.trim())
  }

  const handleScanResult = async (data: string) => {
    try {
      // Try to find by QR key first
      let volk = await dbHelpers.getVolkByQRKey(data)
      if (volk) {
        setScanResult({ type: 'volk', entity: volk })
        return
      }

      let standort = await dbHelpers.getStandortByQRKey(data)
      if (standort) {
        setScanResult({ type: 'standort', entity: standort })
        return
      }

      // Try to find by stock number
      const allVoelker = await dbHelpers.getActiveVoelker('') // We'd need workspace context
      volk = allVoelker.find(v => v.stocknr === data)
      if (volk) {
        setScanResult({ type: 'volk', entity: volk })
        return
      }

      toast({
        title: "Nicht gefunden",
        description: `Kein Volk oder Standort mit "${data}" gefunden.`,
        variant: "destructive"
      })
    } catch (error) {
      console.error('Scan result handling failed:', error)
      toast({
        title: "Fehler",
        description: "Fehler beim Verarbeiten des Scan-Ergebnisses.",
        variant: "destructive"
      })
    }
  }

  const navigateToEntity = () => {
    if (!scanResult) return

    if (scanResult.type === 'volk') {
      router.push(`/voelker/${scanResult.entity.id}`)
    } else {
      router.push(`/standorte/${scanResult.entity.id}`)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scannen</h1>
        <p className="text-gray-600">
          QR-Code scannen, NFC lesen oder manuell suchen
        </p>
      </div>

      <Tabs value={scanMode} onValueChange={(value) => setScanMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="qr" className="flex items-center space-x-2">
            <QrCode className="h-4 w-4" />
            <span>QR-Code</span>
          </TabsTrigger>
          {hasNFC && (
            <TabsTrigger value="nfc" className="flex items-center space-x-2">
              <Nfc className="h-4 w-4" />
              <span>NFC</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>Manuell</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>QR-Code Scanner</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cameraError ? (
                <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{cameraError}</span>
                </div>
              ) : (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto rounded-lg"
                    playsInline
                    muted
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  {isScanning && (
                    <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {hasNFC && (
          <TabsContent value="nfc" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Nfc className="h-5 w-5" />
                  <span>NFC Scanner</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-gray-600">
                  Tippen Sie auf "NFC starten" und halten Sie Ihr Gerät an den NFC-Tag.
                </p>
                <Button onClick={handleNFCScan} size="lg">
                  NFC starten
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>Manuelle Suche</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="manual-input">Stock-Nr. oder QR-Key</Label>
                <Input
                  id="manual-input"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="z.B. 001 oder abc123def"
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
              </div>
              <Button onClick={handleManualSearch} className="w-full">
                Suchen
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scan Result */}
      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Gefunden</span>
              <Badge variant={scanResult.type === 'volk' ? 'default' : 'secondary'}>
                {scanResult.type === 'volk' ? 'Volk' : 'Standort'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {scanResult.type === 'volk' ? (
              <div>
                <h3 className="font-semibold">Stock-Nr. {(scanResult.entity as Volk).stocknr}</h3>
                <p className="text-gray-600">
                  Beute: {(scanResult.entity as Volk).beute} • 
                  Rahmen: {(scanResult.entity as Volk).rahmenmass}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold">{(scanResult.entity as Standort).name}</h3>
                <p className="text-gray-600">
                  {(scanResult.entity as Standort).address.ort}
                </p>
              </div>
            )}
            <Button onClick={navigateToEntity} className="w-full">
              Öffnen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}