/**
 * Composant BookScanner - Scanner de codes-barres ISBN
 * Utilise html5-qrcode pour accéder à la caméra
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { Camera, X, Loader2, AlertCircle, SwitchCamera } from 'lucide-react'
import { Modal, Button } from '../../../components/common'

const BookScanner = ({ isOpen, onClose, onScan, isLoading = false }) => {
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)
  const [error, setError] = useState(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [cameras, setCameras] = useState([])
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0)
  const [hasScanned, setHasScanned] = useState(false)

  // Nettoyer le scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState()
        if (state === 2) { // SCANNING
          await html5QrCodeRef.current.stop()
        }
        html5QrCodeRef.current.clear()
      } catch (err) {
        console.warn('Erreur lors de l\'arrêt du scanner:', err)
      }
      html5QrCodeRef.current = null
    }
  }, [])

  // Initialiser le scanner
  const startScanner = useCallback(async (cameraId = null) => {
    if (!scannerRef.current || !isOpen) return
    
    setIsInitializing(true)
    setError(null)
    setHasScanned(false)

    try {
      // Import dynamique de html5-qrcode
      const { Html5Qrcode } = await import('html5-qrcode')

      // Arrêter le scanner existant si présent
      await stopScanner()

      // Obtenir la liste des caméras
      const devices = await Html5Qrcode.getCameras()
      
      if (devices && devices.length > 0) {
        setCameras(devices)
        
        // Créer une nouvelle instance
        html5QrCodeRef.current = new Html5Qrcode('book-scanner-container')

        // Préférer la caméra arrière sur mobile
        let selectedCamera = devices[0].id
        if (cameraId) {
          selectedCamera = cameraId
        } else {
          const backCamera = devices.find(
            d => d.label.toLowerCase().includes('back') || 
                 d.label.toLowerCase().includes('arrière') ||
                 d.label.toLowerCase().includes('rear')
          )
          if (backCamera) {
            selectedCamera = backCamera.id
            setCurrentCameraIndex(devices.indexOf(backCamera))
          }
        }

        // Configuration du scanner
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778,
        }

        // Démarrer le scanner
        await html5QrCodeRef.current.start(
          selectedCamera,
          config,
          (decodedText) => {
            if (hasScanned) return
            
            // Vérifier si c'est un ISBN valide
            const cleanCode = decodedText.replace(/[-\s]/g, '')
            
            if (isValidISBN(cleanCode)) {
              setHasScanned(true)
              // Vibration feedback sur mobile
              if (navigator.vibrate) {
                navigator.vibrate(100)
              }
              onScan(cleanCode)
            }
          },
          () => {
            // Erreur de scan silencieuse (normal pendant le scan)
          }
        )
      } else {
        setError('Aucune caméra détectée')
      }
    } catch (err) {
      console.error('Erreur d\'initialisation du scanner:', err)
      if (err.name === 'NotAllowedError') {
        setError('Accès à la caméra refusé. Veuillez autoriser l\'accès.')
      } else if (err.name === 'NotFoundError') {
        setError('Aucune caméra trouvée.')
      } else {
        setError('Impossible d\'initialiser la caméra.')
      }
    } finally {
      setIsInitializing(false)
    }
  }, [isOpen, onScan, stopScanner, hasScanned])

  // Changer de caméra
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return
    
    const nextIndex = (currentCameraIndex + 1) % cameras.length
    setCurrentCameraIndex(nextIndex)
    await startScanner(cameras[nextIndex].id)
  }, [cameras, currentCameraIndex, startScanner])

  // Valider un ISBN
  const isValidISBN = (code) => {
    if (code.length === 13 && (code.startsWith('978') || code.startsWith('979'))) {
      return true
    }
    if (code.length === 10) {
      return true
    }
    if (code.length === 13) {
      return true
    }
    return false
  }

  // Initialiser quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startScanner()
      }, 300)
      return () => clearTimeout(timer)
    } else {
      stopScanner()
    }
  }, [isOpen, startScanner, stopScanner])

  // Nettoyer à la fermeture
  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [stopScanner])

  // Reset après scan
  useEffect(() => {
    if (!isLoading && hasScanned) {
      const timer = setTimeout(() => {
        setHasScanned(false)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [isLoading, hasScanned])

  const handleClose = () => {
    stopScanner()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Scanner un livre"
      description="Placez le code-barres ISBN dans le cadre"
      size="md"
      showClose={!isLoading}
      closeOnOverlay={!isLoading}
    >
      <div className="space-y-4">
        {/* Zone de scan */}
        <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
          <div
            id="book-scanner-container"
            ref={scannerRef}
            className="w-full h-full"
          />

          {/* Overlay de chargement */}
          {(isInitializing || isLoading) && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
              <Loader2 className="w-10 h-10 animate-spin mb-3" />
              <p className="text-sm">
                {isLoading ? 'Recherche du livre...' : 'Initialisation de la caméra...'}
              </p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && !isInitializing && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center">
              <AlertCircle className="w-12 h-12 text-danger mb-3" />
              <p className="text-sm">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => startScanner()}
              >
                Réessayer
              </Button>
            </div>
          )}

          {/* Cadre de scan */}
          {!error && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-24 border-2 border-primary-500 rounded-lg">
                <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-primary-400 rounded-tl" />
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-primary-400 rounded-tr" />
                <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-primary-400 rounded-bl" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-primary-400 rounded-br" />
              </div>
            </div>
          )}

          {/* Bouton changer de caméra */}
          {cameras.length > 1 && !error && !isInitializing && (
            <button
              onClick={switchCamera}
              className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              aria-label="Changer de caméra"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-surface-500 dark:text-surface-400">
          <p>Pointez la caméra vers le code-barres au dos du livre</p>
          <p className="text-xs mt-1">(ISBN-13 commençant par 978 ou 979)</p>
        </div>

        {/* Bouton annuler */}
        <div className="flex justify-center">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
        </div>
      </div>

      <style>{`
        #book-scanner-container video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        #book-scanner-container img[alt="Info icon"] {
          display: none !important;
        }
        #book-scanner-container > div:last-child {
          display: none !important;
        }
      `}</style>
    </Modal>
  )
}

export default BookScanner