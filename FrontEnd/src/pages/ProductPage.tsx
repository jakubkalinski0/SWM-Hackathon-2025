import '@/styles/App.css'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogTitle
} from '@/components/ui/dialog'
import { useNavigate } from 'react-router'



function ProductPage() {

  const navigate = useNavigate();
  const noData = 'Brak danych';
  const [product, setProduct] = useState<{
    id: number | null;
    name: string | null;
    image: string | null;
    category: string | null;
    type: string | null;
    barcode: string | null;
    greenscore: string | null;
    carbon_footprint: number | null;
    verification_count: number;
  }>({
    id: null,
    name: '',
    image: '',
    category: null,
    type: '',
    barcode: '',
    greenscore: null,
    carbon_footprint: null,
    verification_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: 'plastic', label: 'Plastik', color: '#febe34' },
    { value: 'plastic_bottles', label: 'Butelki plastikowe', color: '#febe34' },
    { value: 'glass', label: 'Szkło', color: '#51b150' },
    { value: 'glass_bottles', label: 'Butelki szklane', color: '#51b150' },
    { value: 'paper', label: 'Papier', color: '#5c69c7' },
    { value: 'metal', label: 'Metal', color: '#d33f3d' },
    { value: 'organic', label: 'Bio', color: '#6b605c' }
  ];

  // Pobieranie danych produktu
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const barcode = window.location.pathname.split('/').pop(); // Pobieramy kod kreskowy z URL
        const response = await fetch(`http://localhost:8000/product/${barcode}`);
        
        if (!response.ok) {
          throw new Error('Produkt nie znaleziony');
        }
        
        const data = await response.json();
        
        setProduct({
          id: data.id,
          name: data.name || noData,
          image: data.image_url || 'https://www.svgrepo.com/show/340721/no-image.svg',
          category: data.recycle_type || null,
          type: data.product_type || noData,
          barcode: data.barcode || noData,
          greenscore: data.green_score || null,
          carbon_footprint: data.carbon_footprint || null,
          verification_count: data.number_of_verifications || 0
        });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setIsLoading(false);
            console.log(product)
        }
    };

    fetchProduct();
  }, []);

  const handleAddCategory = async () => {

        setProduct(prev => ({
          ...prev,
          category: selectedCategory
        }))
    }

  const handleMapClick = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by your browser");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        // Do something with the coordinates
        console.log("Latitude:", latitude);
        console.log("Longitude:", longitude);
        
        // You can use these variables here or pass them to another function
        navigate(`/map/?lat=${latitude}&long=${longitude}&category=${product.category}`)
      },
      (error) => {
        console.error("Error getting location:", error.message);
        return
      }
    );
  };

  const getCategoryColor = (category: string | null): string => {
    const colors: Record<string, string> = {
      'plastic': '#febe34',
      'plastic_bottles': '#febe34',
      'glass': '#51b150',
      'glass_bottles': '#51b150',
      'paper': '#5c69c7',
      'metal': '#d33f3d',
      'organic': '#6b605c'
    };
    return category ? colors[category] || '#e5e7eb' : '#e5e7eb';
  };

  const getCategoryLabel = (category: string | null): string => {
    const labels: Record<string, string> = {
      'plastic': 'Plastik',
      'plastic_bottles': 'Butelki plastikowe',
      'glass': 'Szkło',
      'glass_bottles': 'Butelki szklane',
      'paper': 'Papier',
      'metal': 'Metal',
      'organic': 'Bio'
    };
    return category ? labels[category] || 'Inna' : 'Brak kategorii';
  };

  if (isLoading) {
    return <div className="min-h-screen p-4 flex items-center justify-center">Ładowanie...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="p-6 border-2 border-black">
          <h2 className="text-2xl font-bold mb-4">Błąd</h2>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Spróbuj ponownie
          </Button>
        </Card>
      </div>
    );
  }

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
            onClick={() => {navigate("/")}}
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
                    {getCategoryLabel(product.category)}
                    </Badge>
                ) : (
                    <Dialog>

                        <DialogTrigger asChild>
                            <Button className="px-3 py-1 text-sm bg-blank" >
                                + Dodaj kategorię
                            </Button>
                        </DialogTrigger>

                        <DialogTitle></DialogTitle>

                        <DialogContent className="sm:max-w-[425px] bg-main">
                            <DialogHeader className="text-xl font-bold mb-4 p-4 border-b-2 border-black">
                            Wybierz kategorię produktu
                            </DialogHeader>
                            
                            <div className="p-4">
                            <div className="space-y-2 mb-6">
                                {categories.map((category) => (
                                <button
                                    key={category.value}
                                    className={`w-full text-left p-3 border-2 bg-blank border-black flex items-center rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]`}
                                    style={{ backgroundColor: selectedCategory === category.value ? getCategoryColor(selectedCategory) : '' }}
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
                    <span className="font-medium">Typ:</span>
                    <span>{product.type ? product.type : noData}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Kod kreskowy:</span>
                    <span>{product.barcode ? product.barcode : noData}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">GreenScore:</span>
                    <span>{product.greenscore ? product.greenscore + "/100"  : noData}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Ślad węglowy:</span>
                    <span>{product.carbon_footprint ? product.carbon_footprint * 100 + " gCO2/100g" : noData}</span>
                </div>
                </div>

                {/* Przyciski akcji */}
                <div className="flex gap-4">
                <Button 
                    className="px-6 py-3 bg-blank text-lg"
                    onClick={() => {handleMapClick()}}
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