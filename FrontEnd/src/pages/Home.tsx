import '@/styles/App.css'
import { useState } from 'react'
import BarcodeScanner from '@/components/BarcodeScanner'
import { Button } from '@/components/ui/button'
import globeImage from '@/assets/globe.png'
import { Camera, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router'

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-main-lighter gradient relative overflow-hidden">
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center w-full justify-center px-6">
        {/* Brand Header */}
        

        <div className="w-[90%] max-w-md">
          <img src={globeImage} alt="Globe" className="w-full h-auto object-contain" />
        </div>

        <h1 className="text-7xl mt-[-0.5em] md:text-7xl font-heading text-center mb-4 leading-tight"
            style={{
              textShadow: '3px 3px 0px rgba(0, 0, 0, 1), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}>
          <span className="text-white">Eco</span><span className="text-main">Scan</span>
        </h1>
        
        {/* Header with text shadow */}
        {/* <h1 className="text-4xl text-main md:text-5xl font-heading text-center mb-8 leading-tight"
           style={{
              textShadow: '3px 3px 0px rgba(0, 0, 0, 1), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}
            >
          Zadbaj o nasze środowisko już dziś! */}
        {/* </h1> */}
        
        {/* Lorem ipsum paragraph */}
        <p className="text-center w-full  mb-8 px-1 text-xl">
          Skanuj kody kreskowe produktów, wyświetlaj najbliższe punkty recyklingu i ratuj nasze środowisku już dziś!
        </p>
        
        {/* Icon/Graphic */}
        
      </div>

      {/* Bottom bar */}
      <div className=" bottom-0 left-0 right-0 bg-main border-2 border-border border-b-0 rounded-t-[3rem] mx-[-1rem] overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-8 py-12 px-4">
          {/* Camera button with text */}
          <Button
            className="bg-white border-2 border-border rounded-full px-6 py-6 shadow-[4px_4px_0px_0px_#2b2c27] hover:bg-gray-100 transition-colors flex items-center justify-start gap-3 w-[70%] max-w-xs"
            onClick={() => setIsModalOpen(true)}
          >
            <Camera style={{width: "25px", height: "25px"}}/>
            <span className="font-medium text-xl w-full">Zeskanuj produkt</span>
          </Button>
          
          {/* Map button with text */}
          <Button
            className="bg-white border-2 border-border rounded-full px-6 py-6 shadow-[4px_4px_0px_0px_#2b2c27] hover:bg-gray-100 transition-colors flex items-center justify-start gap-3 w-[70%] max-w-xs"
            onClick={() => navigate('/map')}
          >
            <MapPin style={{width: "25px", height: "25px"}}/>
            <span className="font-medium text-xl text-center w-full">Zobacz mapę</span>
          </Button>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      {isModalOpen && (
        <BarcodeScanner />
      )}
    </div>
  );
}

export default Home;