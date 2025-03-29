import '@/styles/App.css'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'

function App() {
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
          <h2 className="text-3xl font-bold text-main mt-4">Dbaj o ekologię</h2>
          
          <div className="relative">
            {/* Card z nagłówkiem wychodzącym ponad */}
            <Card className="absolute -top-6 left-6 border-2 border-black bg-white px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
              <h1 className="text-4xl font-extrabold">Skanuj produkty!</h1>
            </Card>

            {/* Główny Card z treścią */}
            <Card className="mt-6 mb-6 bg-main p-6 pt-14 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="max-w-2xl mt-4 text-lg text-gray-700">
                Skanując produkty dbasz o ekologię i środowisko. Wykorzystaj przycisk poniżej, zeskanuj kod kreskowy, poznaj szczegóły produktu i znajdź najbliższy kosz, gdzie możesz go wyrzucić!
              </p>
            </Card>
          </div>
          
          <div className="mt-6 mb-6 mt-8">
            <Button size="lg" className="">
              <p className="text-lg">Skanuj teraz!</p>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;