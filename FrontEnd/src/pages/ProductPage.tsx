import '@/styles/App.css'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
} from '@/components/ui/dialog'


function getCategoryColor(category: string | null): string {
  
    const colors: Record<string, string> = {
    'Plastik': '#ef4444', // red-500
    'Szkło': '#22c55e',   // green-500
    'Papier': '#eab308',  // yellow-500
    'Metal': '#3b82f6',   // blue-500
    'Bio': '#84cc16'      // lime-500
  };

  return category ? colors[category] || '#e5e7eb' : '#e5e7eb';
}

function ProductPage() {

    const noData = 'Brak danych';

    const mockProduct = {
        id: 1,
        name: 'Butelka wody mineralnej 1,5L',
        image: 'https://niemirka.com/1048-large_default/zywiec-15-l-niegazowany-552-butelki-paleta.jpg',
        category: null,
        barcode: '5901234567890',
        greenscore: 65,
        carbon_footprint: 0.25,
        verification_count: 128
      };
    
    const [product, setProduct] = useState({
        ...mockProduct,
        // category: null
      });

    const categories = [
        { value: 'Plastik', label: 'Plastik', color: '#ef4444' },
        { value: 'Szkło', label: 'Szkło', color: '#22c55e' },
        { value: 'Papier', label: 'Papier', color: '#eab308' },
        { value: 'Metal', label: 'Metal', color: '#3b82f6' },
        { value: 'Bio', label: 'Odpad bio', color: '#84cc16' }
    ];

    const [selectedCategory, setSelectedCategory] = useState('');


    const handleAddCategory = () => {
        if (selectedCategory) {
            setProduct({
            ...product,
            category: selectedCategory
            });
        }
    };
    

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
                className="absolute -top-3 -right-3 bg-white border-2 border-black px-3 py-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1"
                >
                {/* Ikona weryfikacji - np. znaczek checkmark */}
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>{product.verification_count}</span>
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
                        <Dialog>

                            <DialogTrigger asChild>
                                <Button className="px-3 py-1 text-sm bg-blank" >
                                    + Dodaj kategorię
                                </Button>
                            </DialogTrigger>

                            <DialogContent className="sm:max-w-[425px] bg-main">
                                <DialogHeader className="text-xl font-bold mb-4 p-4 border-b-2 border-black">
                                Wybierz kategorię produktu
                                </DialogHeader>
                                
                                <div className="p-4">
                                <div className="space-y-2 mb-6">
                                    {categories.map((category) => (
                                    <button
                                        key={category.value}
                                        className={`w-full text-left p-3 border-2 bg-blank border-black flex items-center rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${selectedCategory === category.value ? 'bg-green-500' : ''}`}
                                        onClick={() => setSelectedCategory(category.value)}
                                    >
                                        <span 
                                        className="w-4 h-4 rounded-full mr-3" 
                                        style={{ backgroundColor: category.color }}
                                        />
                                        {category.label}
                                    </button>
                                    ))}
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-4 border-t-2 border-black">
                                    <Button
                                    onClick={handleAddCategory}
                                    disabled={!selectedCategory}
                                    className="bg-green-500 hover:bg-green-600 border-2 border-black"
                                    >
                                    Potwierdź wybór
                                    </Button>
                                </div>
                                </div>
                            </DialogContent>
                        </Dialog>
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