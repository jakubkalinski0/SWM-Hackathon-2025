import { Routes, Route } from 'react-router';
import '@/styles/App.css';
import Home from '@/pages/Home';
// import ProductPage from '@/pages/Home';
// import MapPage from '@/pages/Home';
import Map from '@/pages/Map'

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<Home />} />
        <Route path="/map/:id" element={<Map />} />
      </Routes>
  );
}

export default App;