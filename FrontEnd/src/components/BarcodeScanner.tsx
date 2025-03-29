import React, { useEffect, useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import { Button } from './ui/button';
import { Card } from './ui/card';

const BarcodeScanner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  // const [error, setError] = useState<string | null>(null);

  const handleScan = (result: string) => {
    if (result) {
      setBarcode(result);
      setIsModalOpen(false);
    }
  };

  const handleError = (err: Error) => {
    console.log(err)
  };

  useEffect(() => {
    console.log(barcode)
    console.log(typeof barcode)
    if (!barcode || isNaN(Number(barcode))) {
      console.log('Barcode is not a valid number');
      return;
    }

    console.log('Barcode is a valid number:', barcode);


  }, [barcode])

  return (
    <div style={{ padding: '20px' }}>
      <Button 
        onClick={() => setIsModalOpen(true)}
      >
        Skanuj teraz!
      </Button>
      
      {/* {barcode && (
        <div style={{ marginTop: '20px', fontSize: '18px' }}>
          Scanned Barcode: <strong>{barcode}</strong>
        </div>
      )} */}

      {/* {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>
      )} */}

      {isModalOpen && (
        <Card 
        className='absolute py-10 top-[50%] left-[50%] right-0 bottom-0 w-[90%] translate-x-[-50%] translate-y-[-50%] aspect-square flex items-center justify-center flex-col z-10 bg-[#bde67c]'

          
          >
          <Card 
          className='mb-5 w-[90%]'
        >
            <BarcodeScannerComponent
              
              width="100%"
              height="300px"
              onUpdate={(err, result) => {
                if (err) handleError(err as Error);
                if (result) handleScan(result.getText());
              }}
            />
            
          </Card>
          <Button 
              onClick={() => setIsModalOpen(false)}
              // variant='reverse'
              className='bg-white'
              // style={{
              //   marginTop: '20px',
              //   padding: '10px 20px',
              //   backgroundColor: '#dc3545',
              //   color: 'white',
              //   border: 'none',
              //   borderRadius: '4px',
              //   cursor: 'pointer'
              // }}
            >
              Zamknij Skaner
            </Button>
        </Card>
      )}
    </div>
  );
};

export default BarcodeScanner;