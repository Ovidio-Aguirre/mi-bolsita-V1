// src/pages/InventoryPage/components/BarcodeScanner.tsx
import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button, Box } from '@mui/material';

interface BarcodeScannerProps {
  onScanSuccess: (text: string) => void;
  onClose: () => void;
}

export const BarcodeScanner = ({ onScanSuccess, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reader = new BrowserMultiFormatReader();

  useEffect(() => {
    reader.decodeFromInputVideoDevice(undefined, videoRef.current!)
      .then(result => {
        onScanSuccess(result.getText());
      })
      .catch(err => {
        if (!(err instanceof NotFoundException)) {
          console.error(err);
          alert("Error al iniciar la cámara. Asegúrate de dar los permisos necesarios.");
        }
      });

    return () => {
      reader.reset();
    };
  }, []);

  return (
    <Box>
      <video ref={videoRef} style={{ width: '100%', border: '1px solid #ddd' }} />
      <Button onClick={onClose} sx={{ mt: 1 }}>Cancelar</Button>
    </Box>
  );
};