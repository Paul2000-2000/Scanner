import './Stoc.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



const Stoc = () => {

  const [produseStoc, setProduseStoc] = useState([]);
  const [filterText, setFilterText] = useState(''); 
  const [quantities, setQuantities] = useState({});
  const [bon, setBon] = useState({ masina: null, produse: [] });
  const [masini, setMasini] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const navigate = useNavigate();


  const fetchProdusStoc = async () => {
    try {
        const response = await axios.get('http://localhost:8080/produseStoc');
        if (response.status === 200) 
            setProduseStoc(response.data);  
        else
            console.error(`Error fetching data: ${response.status}`);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const fetchBon = async () => {
  try {
    const response = await axios.get('http://localhost:8080/bon');
    
    if (response.status === 200) {
      // Verifică dacă răspunsul este valid
      const bonData = response.data || { id: null, masina: null, produse: [] }; // Default object if null
      
      setBon({
        ...bonData,
        produse: bonData.produse || [], // Asigură-te că `produse` este mereu un array
      });
    } else {
      console.error(`Error fetching data: ${response.status}`);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

  const fetchMasini = async () => {
    try {
        const response = await axios.get('http://localhost:8080/masini');
        if (response.status === 200) setMasini(response.data);  
    } catch (error) {
        console.error('Error fetching masini:', error);
    }
  };

   

  useEffect(() => {
    fetchProdusStoc();
    fetchBon();
    fetchMasini();
  }, []);

  const handleFilterChange = (e) => {
    setFilterText(e.target.value); 
};

const handleBackHome = () =>{
  navigate('/');
}



const filteredProduse = produseStoc.filter(produs => {
  const denumire = String(produs.denumire || '').toLowerCase();
  const cod = String(produs.cod || '').toLowerCase();
  const codbara = String(produs.codbara || '').toLowerCase();
  const filterTextLower = filterText.toLowerCase();

  return denumire.includes(filterTextLower) ||
         cod.includes(filterTextLower) ||
         codbara.includes(filterTextLower);
});

const handleQuantityChange = (id, value) => {
  const newQuantity = value === "" ? "" : Math.max(1, parseInt(value)); // Ensure the value is a number and defaults to 1
  setQuantities(prevQuantities => ({
    ...prevQuantities,
    [id]: newQuantity,
  }));
};

const handleAddProduct = async (produs) => {
  const desiredQuantity = parseInt(quantities[produs.id], 10) || 1; 
  const stockQuantity = produs.cantitate;

  if (desiredQuantity > stockQuantity) {
    alert(`Error: Desired quantity (${desiredQuantity}) exceeds available stock (${stockQuantity}).`);
    return;
  }

  if (desiredQuantity < 0) {
    alert("Error: Desired quantity cannot be negative.");
    return;
  }

  
  if (!bon.masina && !selectedCar) {
    alert("Please select a car first.");
    return;
  }

    // Verifică dacă datele sunt corecte înainte de a le trimite
    const requestData = {
      denumire: produs.denumire,
      cod: produs.cod,
      codbara: produs.codbara,
      cantitate: desiredQuantity,
      masina: bon.masina || selectedCar
    };

  try {
   
    const response = await axios.post("http://localhost:8080/adaugaBon", requestData
     );

   
    if (response.status === 200) {
      alert(response.data.message);

      
      if (!bon.masina) {
        setBon(prev => ({ ...prev, masina: prev.masina || selectedCar }));
        setMasini(prevMasini => prevMasini.filter(car => car.numar !== selectedCar)); 
      }

      fetchBon();
      navigate('/bon');
    } else {
      alert("Error: " + response.data.message);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Enter a value for quantity.");
  }
};

    const handleVeziBon = () =>{
      navigate('/bon');
    }

    const handleVeziBonuriSalvate = () =>{
        navigate('/bonurisalvate');
    }

    const handleVeziBonuriFinalizate = () =>{
        navigate('/bonurifinalizate');
    }

    const handleAdaugaProdus = () =>{
      navigate('/adauga-produs');
  }


  return (
    <div className='stoc-produse'>
            <nav className="navigation">
                <button className="back-button-stoc" onClick={handleBackHome}>Back</button>
                <button className="adauga-produs-btn" onClick={handleAdaugaProdus}>Adauga Produs</button>
                <div className="stoc-produse-btns">
                    <button className="stoc-produse-btn" onClick={handleVeziBon}>Vezi bon</button>
                    <button className="stoc-produse-btn" onClick={handleVeziBonuriSalvate}>Bonuri salvate</button>
                    <button className="stoc-produse-btn" onClick={handleVeziBonuriFinalizate}>Bonuri finalizate</button>
                </div>
</nav>
            <h2> Produse Stoc </h2>
           
            <input 
                type='text' 
                placeholder='Cauta produs...' 
                value={filterText} 
                onChange={handleFilterChange}
            />

            
      { ( bon.masina===null ||  bon.produse?.length === 0 ) && (
        <div>
          <select onChange={(e) => setSelectedCar(e.target.value)} defaultValue="">
            <option value="" disabled>Select a car</option>
            {masini.filter(car => car.disponibilitate === 1).map(car => (
              <option key={car.id} value={car.numar}>{car.numar}</option>
            ))}
          </select>
        </div>
      )}

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Denumire</th>
                        <th>Cod</th>
                        <th>Codbara</th>
                        <th>Cantitate stoc</th>
                        <th>Cantitate dorita</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProduse.map(produs => (
                        <tr key={produs.id}>
                            <td>{produs.id}</td>
                            <td>{produs.denumire}</td>
                            <td>{produs.cod}</td>
                            <td>{produs.codbara}</td>
                            <td>{produs.cantitate}</td>
                            <td>
                            <input 
                                    type='number' 
                                    value={quantities[produs.id] || 1}
                                    onChange={(e) => handleQuantityChange(produs.id, e.target.value)}
                                   
                                    
                            />

                            </td>
                            <td>
                            <button onClick={() => handleAddProduct(produs)}>
                                Adauga Bon
                            </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
  )
}

export default Stoc
