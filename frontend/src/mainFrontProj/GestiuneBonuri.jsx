
import { useState , useEffect } from 'react'
import axios from 'axios';
import './Gestiunebonuri.css';
import { useNavigate } from 'react-router-dom';

const GestiuneBonuri = () => {

    const navigate = useNavigate();
    const [filterText, setFilterText] = useState(''); 
    const [filterId, setFilterId] = useState(''); // 🔥 Adăugăm un state pentru căutare după ID
    const [filterMasina, setFilterMasina] = useState(''); // 🔥 Adăugăm un state pentru căutare după Mașină


    const handleBackStoc = () =>{
        navigate('/stoc');
      }
    
      const handleFilterChange = (e) => {
        setFilterText(e.target.value); 
    };

    const handleFilterIdChange = (e) => {
      setFilterId(e.target.value);
    };

    const handleFilterMasinaChange = (e) => {
      setFilterMasina(e.target.value); // 🔥 Gestionăm căutarea după mașină
    };
  



    const [bonuriGestionate , setBonuriGestionate] = useState([]);

    const fetchBonuriGestionate = async () => {
        try {
          const response = await axios.get("http://localhost:8080/bonurigestionate");
          setBonuriGestionate(response.data);
          console.log(response.data);
          console.log(bonuriGestionate);
        } catch {
          alert('Failed to fetch data');
        }
      };

      const handleVeziBon =  (id ) =>{
        navigate(`/bonurigestionate/${id}`);
      }


      useEffect( () =>{
            fetchBonuriGestionate();
      },[])


      const filteredBonuri = bonuriGestionate.filter((bon) => {
        const matchesId = filterId ? bon.id.toString().includes(filterId) : true;
        const matchesMasina = filterMasina ? bon.masina.toLowerCase().includes(filterMasina.toLowerCase()) : true;
      
        // Filtrarea produselor în cadrul fiecărui bon
        const filteredProduse = bon.produse.filter((produs) => {
          const denumire = String(produs.denumire || '').toLowerCase();
          const cod = String(produs.cod || '').toLowerCase();
          const codbara = String(produs.codbara || '').toLowerCase();
          const filterTextLower = filterText.toLowerCase();
      
          // Verificăm dacă produsul conține textul de căutare
          return denumire.includes(filterTextLower) ||
                 cod.includes(filterTextLower) ||
                 codbara.includes(filterTextLower);
        });
      
        return matchesId && matchesMasina && filteredProduse.length > 0; // Filtrăm bonurile pentru a avea produse corespunzătoare
      });

  return (
    <div className="container">
      <button className="back-button" onClick={handleBackStoc}>Back</button>
      <h2 className="title">Bonuri Gestionate</h2>
      <div className="bonuri-container">
           <input
          type="text"
          className="inputbonurigestionate"
          placeholder="🔍 Caută după ID bon..."
          value={filterId}
          onChange={handleFilterIdChange}
        />

<input
          type="text"
          className="inputcautaremasina"
          placeholder="🔍 Caută după mașină..."
          value={filterMasina}
          onChange={handleFilterMasinaChange}
        />

            <input 
                type='text' 
                placeholder='Cauta produs...' 
                value={filterText} 
                onChange={handleFilterChange}
                className='inputcautareprodus'
            />


        {filteredBonuri.length > 0 ? (
          <table className="bon-table">
            <thead>
              <tr>
                <th>ID Bon</th>
                <th>Masina</th>
                <th>Detalii bon</th>
              </tr>
            </thead>
            <tbody>
              {filteredBonuri.map((bon) => (
                <tr key={bon.id}>
                  <td>{bon.id}</td>
                  <td>{bon.masina}</td>
                  <td>
                      {/* Verificăm dacă există text de căutare în input */}
  {filterText && (
    <div>
      {/* Filtrăm produsele pentru a arăta doar cele care se potrivesc */}
      {bon.produse
        .filter(produs =>
          (produs.denumire && produs.denumire.toLowerCase().includes(filterText.toLowerCase())) ||
          (produs.cod && produs.cod.toLowerCase().includes(filterText.toLowerCase())) ||
          (produs.codbara && produs.codbara.toLowerCase().includes(filterText.toLowerCase()))
        )
        .map(produs => (
          <div key={produs.codbara}>
            {/* Afișăm denumirea produsului, codul și codul de bare */}
            <p>{produs.denumire}</p>
            <p>{produs.codbara}</p>
            <p>{produs.cod}</p>
          </div>
        ))
      }
    </div>
  )}
                  </td>
                  <td>
                    <button onClick={() => handleVeziBon(bon.id)}>Vezi bon</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">📜 Nu există bonuri gestionate.</p>
        )}
      </div>
    </div>
  )
}

export default GestiuneBonuri
