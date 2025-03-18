
import './App.css';
import { BrowserRouter, Routes , Route} from 'react-router-dom';
// import HomePage from './pages/HomePage';
// import AdaugaProdusPage from './pages/AdaugaProdusPage';
// import EditeazaProdusPage from './pages/EditeazaProdusPage';
// import BonPage from './pages/BonPage';
// import IstoricBonuriPage from './pages/IstoricBonuriPage';
import FirstPage from './mainFrontProj/FirstPage';
import VNomenclator from './mainFrontProj/VNomenclator';
import Stoc from './mainFrontProj/Stoc';
import AdaugaProdus from './mainFrontProj/AdaugaProdus';

import BonuriSalvate from './mainFrontProj/BonuriSalvate';
import BonuriFinalizate from './mainFrontProj/BonuriFinalizate';
import BonFinalizat from './mainFrontProj/BonFinalizat';
 
function App() {
 
  return (

    <div className="app">
      <BrowserRouter>
        <Routes>
          {/* <Route path="/" element={<HomePage />} />
          <Route path="/add-product" element ={<AdaugaProdusPage />} />
          <Route path='/edit-product/:id' element ={<EditeazaProdusPage />} />
          <Route path='/bon' element ={<BonPage />} />
          <Route path='/istoric-bonuri' element ={<IstoricBonuriPage />} /> */}

          
          <Route path="/" element={<Stoc />} />
          <Route path="/nomenclator" element={<VNomenclator />} />
          <Route path="/stoc" element={<Stoc />} />
          <Route path="/adauga-produs" element={<AdaugaProdus />} />
          <Route path='/bonurisalvate' element={<BonuriSalvate/>}/>
          <Route path='/bonurifinalizate' element={<BonuriFinalizate/>} />
          <Route path='/bonfinalizat/:id' element={<BonFinalizat />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
