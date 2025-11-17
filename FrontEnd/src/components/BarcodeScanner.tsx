import React, { useEffect, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useNavigate } from 'react-router';

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleScan = (result: string) => {
    if (result) {
      setBarcode(result);
    }
  };

  const handleError = (err: Error) => {
    console.log(err);
  };

  useEffect(() => {
    if (!barcode || isNaN(Number(barcode))) {
      console.log('Barcode is not a valid number');
      return;
    }
    
    setIsLoading(true);
    navigate('/product/' + barcode);

  }, [barcode]);

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl font-bold">Loading...</div>
        </div>
      )}
      
      <Card 
        className='w-[90%] max-w-md py-10 flex items-center justify-center flex-col bg-main-lighter'
      >
        <Card className='mb-5 w-[90%]'>
          <BarcodeScannerComponent
            width="100%"
            height="300px"
            onUpdate={(err, result) => {
              if (err) handleError(err as Error);
              if (result) handleScan(result.getText());
            }}
          />
        </Card>
        <Button onClick={() => window.history.back()} className='bg-white text-black border-black'>
          Zamknij Skaner
        </Button>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
