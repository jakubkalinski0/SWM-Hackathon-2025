import '@/styles/App.css'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

function getCategoryColor(category: string | null): string {
  
    const colors: Record<string, string> = {
    'Plastik': '#ef4444', // red-500
    'Szkło': '#22c55e',   // green-500
    'Papier': '#eab308',  // yellow-500
    'Metal': '#3b82f6',   // blue-500
    'Bio': '#84cc16'      // lime-500
  };

  return category ? colors[category] || '#e5e7eb' : '#e5e7eb'; // default gray-200
}

function handleAddCategory() {

}

function ProductPage() {

    const noData = 'Brak danych';

    const mockProduct = {
        id: 1,
        name: 'Butelka wody mineralnej 1,5L',
        image: 'https://niemirka.com/1048-large_default/zywiec-15-l-niegazowany-552-butelki-paleta.jpg',
        // image: null,
        category: null, // Może być null
        barcode: '5901234567890',
        greenscore: 65,
        carbon_footprint: 0.25,
        verification_count: 128
      };
    
    const [product, setProduct] = useState({
        ...mockProduct,
        // category: null
      });

    return (
        <div className="min-h-screen p-4 bg-gray-50">
          <Alert 
            variant="default" 
            className="relative overflow-visible pt-10 pb-6 bg-main"
          >
            <Card className="absolute -bottom-3 left-3 border-2 border-border bg-blank px-5 py-2">
              <h1 className="text-3xl font-heading text-black">
                Strona Produktu
              </h1>
            </Card>

            <Button 
                className="absolute right-4 bottom-4 px-2 py-1 bg-blank"
                onClick={() => {}}
            >
                <p className='p-0 m-0 text-lg'>&lt;-</p>
            </Button>
          </Alert>
    
          <main className="max-w-3xl mx-auto mt-16">
            <Card className="p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                {/* Liczba weryfikacji w prawym górnym rogu */}
                <Badge 
                variant="default" 
                className="absolute -top-3 -right-3 bg-white border-2 border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                Weryfikacje: {product.verification_count}
                </Badge>

                {/* Główna zawartość produktu */}
                <div className="grid md:grid-cols-2 gap-6">
                {/* Lewa kolumna - zdjęcie */}
                <Card className="p-2 bg-white">
                    <img 
                    src={product.image ? product.image : 'https://www.svgrepo.com/show/340721/no-image.svg'} 
                    alt={product.name ? product.name : noData}
                    className="w-full h-auto object-cover"
                    />
                </Card>

                <div>
                    <h1 className="text-3xl font-bold mb-2">{product.name ? product.name : noData}</h1>
                    
                    {/* Sekcja kategorii */}
                    <div className="mb-4 flex items-center gap-3">
                    Kategoria: 
                    {product.category ? (
                        <Badge 
                        className="text-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                        style={{ 
                            backgroundColor: getCategoryColor(product.category),
                        }}
                        >
                        {product.category}
                        </Badge>
                    ) : (
                        <>
                        <Button 
                            className="px-3 py-1 text-sm bg-blank"
                            onClick={handleAddCategory}
                        >
                            + Dodaj kategorię
                        </Button>
                        </>
                    )}
                    </div>

                    {/* Dane produktu */}
                    <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                        <span className="font-medium">Kod kreskowy:</span>
                        <span>{product.barcode ? product.barcode : noData}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">GreenScore:</span>
                        <span>{product.greenscore ? product.greenscore : noData}/100</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium">Ślad węglowy:</span>
                        <span>{product.carbon_footprint ? product.carbon_footprint : noData} kg CO2</span>
                    </div>
                    </div>

                    {/* Przyciski akcji */}
                    <div className="flex gap-4">
                    <Button 
                        className="px-6 py-3 bg-blank text-lg"
                        onClick={() => {}}
                    >
                        Nawiguj
                    </Button>
                    </div>
                </div>
                </div>
            </Card>
            </main>
        </div>
      );
}

export default ProductPage;