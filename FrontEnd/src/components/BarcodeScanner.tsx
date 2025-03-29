import React, { useEffect, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import axios from 'axios';
import { Button } from './ui/button';
import { Card } from './ui/card';

const BarcodeScanner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = (result: string) => {
    if (result) {
      setBarcode(result);
      setIsModalOpen(false);
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
    
    axios.get(`http://localhost:8000/products/${barcode}`)
      .then(response => {
        console.log('Asset data:', response.data);
      })
      .catch(error => {
        console.error('Error fetching asset:', error);
      })
      .finally(() => {
        setTimeout(() => setIsLoading(false), 1000); // Simulate loading delay
      });
  }, [barcode]);

  return (
    <div style={{ padding: '20px' }}>
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-xl font-bold">Loading...</div>
        </div>
      )}
      
      <Button onClick={() => setIsModalOpen(true)}>Skanuj teraz!</Button>

      {isModalOpen && (
        <Card 
          className='absolute py-10 top-[50%] left-[50%] w-[90%] translate-x-[-50%] translate-y-[-50%] aspect-square flex items-center justify-center flex-col z-10 bg-[#bde67c]'
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
          <Button onClick={() => setIsModalOpen(false)} className='bg-white'>
            Zamknij Skaner
          </Button>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScanner;
