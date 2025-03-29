import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const BarcodeScanner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: string) => {
    if (result) {
      setBarcode(result);
      setIsModalOpen(false);
    }
  };

  const handleError = (err: Error) => {
    setError(err?.message || 'Failed to access camera');
  };

  return (
    <div style={{ padding: '20px' }}>
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Scan Barcode
      </button>
      
      {barcode && (
        <div style={{ marginTop: '20px', fontSize: '18px' }}>
          Scanned Barcode: <strong>{barcode}</strong>
        </div>
      )}

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
      )}

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            width: '90%',
            maxWidth: '500px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <BarcodeScannerComponent
              
              width="100%"
              height="300px"
              onUpdate={(err, result) => {
                if (err) handleError(err as Error);
                if (result) handleScan(result.getText());
              }}
            />
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;