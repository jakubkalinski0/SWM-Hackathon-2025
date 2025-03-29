import '@/styles/App.css'

import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import Typewriter from "@/fancy/components/text/typewriter"
import BarcodeScanner from '@/components/BarcodeScanner'

function Home() {
  return (
    <div className="min-h-screen p-4 bg-gray-50">
      <Alert 
        variant="default" 
        className="relative overflow-visible pt-6 pb-6 bg-main"
      >
        <Card className="absolute -bottom-3 left-3 border-2 border-border bg-blank px-5 py-2">
          <h1 className="text-4xl font-heading text-black">
            EcoScan
          </h1>
        </Card>
        <p className="text-right text-lg -mt-0 mr-4">
          Lorem ipsum dolor sit amet
        </p>
      </Alert>

      <main className="max-w-3xl mx-auto mt-8">
        <div className="p-4 bg-gray-50 flex flex-col items-center justify-center text-center">
        
          <Card className="bg-main p-4 bg-bank mt-8">
            <Typewriter text={"Dbaj o ekologię! 🍃"} className="text-3xl font-bold text-black mt-4"/>
          </Card>

          <div className="relative mt-20">
            {/* Card z nagłówkiem wychodzącym ponad */}
            <Card className="absolute -top-8 left-8 border-2 border-black bg-white px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
              <h1 className="text-3xl font-extrabold">Skanuj produkty!</h1>
            </Card>

            {/* Główny Card z treścią */}
            <Card className="mt mb-6 bg-main p-6 pt-14 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="max-w-2x text-lg text-gray-700">
                Skanując produkty dbasz o ekologię i środowisko. Wykorzystaj przycisk poniżej, zeskanuj kod kreskowy, poznaj szczegóły produktu i znajdź najbliższy kosz, gdzie możesz go wyrzucić!
              </p>
            </Card>
          </div>
          
          <div className="mt-6 mb-6 mt-8">
            <BarcodeScanner></BarcodeScanner>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;