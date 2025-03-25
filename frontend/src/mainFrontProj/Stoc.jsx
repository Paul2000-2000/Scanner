import './Stoc.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";



const Stoc = () => {

  const [produseStoc, setProduseStoc] = useState([]);
  const [filterText, setFilterText] = useState(''); 
  const [quantities, setQuantities] = useState({});
  const [bon, setBon] = useState({ id:null ,  masina: null, produse: [] });
  const [bonuriSalvate, setbonuriSalvate]  = useState();
  const [bonurifinalizate , setBonuriFinalizate] = useState();
  const [masini, setMasini] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [previousCar, setPreviousCar] = useState(null);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState(""); 
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Verificăm dimensiunea fișierului (de exemplu, maxim 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    if (file.size > MAX_FILE_SIZE) {
        alert("Fișierul este prea mare! Maxim 10MB.");
        return;
    }

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = async (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const filteredData = jsonData.slice(1).map((row, index) => {
            const [, denumire, cod, codbara] = row;
            return {
                id: index + 1,
                denumire,
                cod,
                codbara,
            };
        });

        console.log("Produse procesate:", filteredData);

        await fetch("http://localhost:8080/incercarePost", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(filteredData),
        });

     
    };
};

const handleVeziNomenclator = () =>{
  navigate('/nomenclator');
};

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

const fetchBonuriSalvate = async () => {
  try {
    const response = await axios.get("http://localhost:8080/bonurisalvate");
    setbonuriSalvate(response.data);
  } catch {
    alert('Failed to fetch data');
  }
};

const fetchBonuriFinalizate = async () => {
  try {
    const response = await axios.get("http://localhost:8080/bonurifinalizate");
    setBonuriFinalizate(response.data);
  } catch {
    alert('Failed to fetch data');
  }
};

const fetchBon = async () => {
  try {
    const response = await axios.get('http://localhost:8080/bon');

    console.log(response.data);
    
    if (response.status === 200) {
      // Verifică dacă răspunsul este valid
      const bonData = response.data || { id: null, masina: null, produse: [] }; // Default object if null


      if (!bonData || bonData.produse.length === 0) {
        setSelectedCar(null);
        setSearchText('');
        localStorage.removeItem('selectedCar');
      }
      
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

const fetchBonSalvat = async (carNumber) => {
  try {
    const response = await axios.get("http://localhost:8080/bonuriSalvate/car", {
      params: { masina: carNumber },
    });


    console.log("Răspunsul de la server:", response.data);


    if (response.status === 200) {
      if (response.data.bon) {
        // Bon salvat găsit
        console.log("Bon existent găsit:", response.data);
        setBon(response.data.bon);
      
      } else {
        // Nu există bon salvat, creează unul gol
        console.log("Nu există bon salvat pentru această mașină. Creăm un bon nou.");
        setBon({ id: null, masina: carNumber, produse: [] });
      }
      fetchBonuriSalvate();
    } else {
      console.error("Eroare la obținerea bonului salvat");
    }
  } catch (error) {
    console.log(error);
    setBon({ id: null, masina: carNumber, produse: [] });
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

const filteredCars = masini.filter(car =>
    (`${car.numar} ${car.marca}`).toLowerCase().includes(searchText.toLowerCase())
);

const handleSelectCar = async (car) => {
    // Salvează mașina anterioară
    setPreviousCar(selectedCar);
    // Dacă există un bon activ cu produse și schimbăm mașina, trebuie salvat
    if (bon.produse.length > 0 && selectedCar !== car.numar) {
      try {
        const response = await axios.post("http://localhost:8080/adaugaBonSalvat", {
          id: bon.id,
          masina: bon.masina,
          produse: bon.produse,
        });
  
        if (response.status === 200) {
          alert(response.data.message);
  
          // Resetăm bonul după salvare
          setBon({ id: null, masina: null, produse: [] });
  
          // Ștergem selecția curentă din localStorage
          localStorage.removeItem('selectedCar');

          fetchProdusStoc();
  
          // Navigăm către altă pagină (opțional)
          navigate('/stoc');
        } else {
          alert("Eroare: " + response.data.message);
          return; // Dacă apare eroare, oprim execuția
        }
      } catch (error) {
        console.error("Eroare la trimiterea formularului:", error);
        alert("A apărut o problemă la trimiterea formularului. Încearcă din nou.");
        return;
      }
    } else {
      // Dacă nu sunt produse sau nu schimbăm mașina, resetăm bonul
      setBon({ id: null, masina: null, produse: [] });
  
      // Ștergem selecția curentă din localStorage (doar dacă nu există produse)
      localStorage.removeItem('selectedCar');
    }
    // Actualizăm selecția de mașină
    setSelectedCar(car.numar);
    setSearchText(`${car.numar} ${car.marca}`);
    setShowDropdown(false);
  
    // Salvăm mașina selectată în localStorage
    localStorage.setItem("selectedCar", JSON.stringify(car));
  
    // Căutăm un bon salvat pentru această mașină
   await fetchBonSalvat(car.numar);
    //fetchBonuriSalvate();
    console.log(bon);
};
  
const handleStergeProdus = async (bonId, codbara) => {
    try {
      const response = await axios.delete(`http://localhost:8080/bonCurent/produs/${codbara}`);

      console.log(selectedCar);
  
      if (response.status === 200) {
        alert('Produsul a fost șters');
         fetchBon();
         fetchProdusStoc();

       
        console.log(selectedCar);  

        console.log(response.data);
      } else {
        alert('A apărut o eroare');
      }
    } catch (error) {
      console.error('Eroare la ștergere:', error);
      alert('A apărut o eroare la ștergere.');
    }
};

const handleSalveazaBon = async () => {

   

    if (!bon || !bon.produse || bon.produse.length === 0) {
        alert('Nu ai produse!');
        return;
    }

    try {
      

      const responseDelete = await axios.delete("http://localhost:8080/stergeBonuri", {
        data: { id: bon.id, masina: bon.masina }
      });
  
      if (responseDelete.status === 200) {
        console.log('Bonurile vechi au fost șterse.');
      } else {
        console.log('Nu au fost găsite bonuri de șters.');
      }



        const response = await axios.post("http://localhost:8080/adaugaBonSalvat", bon);

        // Dacă salvarea este reușită, actualizăm UI-ul
        if (response.status === 200) {
            alert(response.data.message);
            console.log("Bonul trimis pentru adăugare:", bon);
         
            setBon({ id: null, masina: null, produse: [] });

            setSelectedCar(null);
            setSearchText('');

            localStorage.removeItem('selectedCar');
            setPreviousCar(null);

            fetchBon();
            fetchBonuriSalvate();
            fetchProdusStoc();
            
            navigate('/stoc'); // Navighează la altă pagină


        } else {
            alert("Error: " + response.data.message);
        }
    } catch (error) {
        console.error("Error submitting form:", error);
        alert("Failed to submit. Please try again.");
    } 
};

const handleFinalizeazaBon = async () => {


  if (!bon || !bon.produse || bon.produse.length === 0) {
      alert('Nu ai produse!');
      return;
  }


  try {
      const response = await axios.post("http://localhost:8080/adaugaBonFinalizat", {
          id: bon.id,
          masina: bon.masina,
          produse: bon.produse
      });

     
      if (response.status === 200) {
          alert(response.data.message);

          console.log("Bonul trimis pentru adăugare:", bon);
          setBon({ id: null, masina: null, produse: [] });
          console.log("Asa arata bonul dupa finalizare" , bon);

          setSelectedCar(null);
          setSearchText('');
          

          localStorage.removeItem('selectedCar');

          setPreviousCar(null);
          fetchProdusStoc();
         
          
          navigate('/stoc'); // Navighează la altă pagină
      } else {
          alert("Error: " + response.data.message);
      }
  } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit. Please try again.");
  }
};

const handleStergeBon = async () =>{
  try{

    
    const response = await axios.delete("http://localhost:8080/stergebonactiv", {
      data: { bon: bon }  // Trimiți bonul activ către server
    });

    if(response.status === 200)
      {
        alert('Bon sters cu succes');
    

        
        setBon({ id: null, masina: null, produse: [] });
       

        setSelectedCar(null);
        setSearchText('');

        localStorage.removeItem('selectedCar');
        setPreviousCar(null);

       
        fetchProdusStoc();


      }
      

  } catch (error){
    alert('Bonul nu a putut fi sters' , error);
  }
};
   
  useEffect(() => {
    fetchProdusStoc();
    fetchMasini();
    fetchBonuriSalvate();
    fetchBonuriFinalizate();
  }, []);


  useEffect(() =>{
    console.log('Previous car este:' , previousCar);
    console.log('Selected car este' , selectedCar);
    console.log('Bonul este sub froma:' , bon)
    console.log('Bonuri salvate sunt:' , bonuriSalvate);
    console.log('Bonuri finalizate sunt:' , bonurifinalizate);

    
  } , [bon , previousCar , selectedCar , bonuriSalvate , bonurifinalizate] )

const handleFilterChange = (e) => {
    setFilterText(e.target.value); 
};

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

  
  if (!selectedCar) {
    alert("Please select a car first.");
    return;
  }


    // Verificăm dacă bonul există sau trebuie creat unul nou
    if (!bon.id) {
      // Dacă bonul nu există, creăm un bon nou
      setBon({
        id: null,  // Vom aștepta să primim un ID de la server
        masina: selectedCar,
        produse: []
      });
    }


    const now = new Date();

    const day = now.getDate(); // Day of the month (1-31)
const hours = now.getHours().toString().padStart(2, '0'); // Ensure 2-digit format
const minutes = now.getMinutes().toString().padStart(2, '0'); // Ensure 2-digit format
  
    // Adăugăm produsul la bonul curent
    const updatedProducts = [...bon.produse, {
      denumire: produs.denumire,
      cod: produs.cod,
      codbara: produs.codbara,
      cantitate: desiredQuantity,
      timp: `${day}-${hours}:${minutes}` // Properly formatted time
    }];
  
    // Actualizăm bonul cu noul produs
    setBon(prevBon => ({
      ...prevBon,
      produse: updatedProducts
    }));
  

    // Verifică dacă datele sunt corecte înainte de a le trimite
    const requestData = {
      denumire: produs.denumire,
      cod: produs.cod,
      codbara: produs.codbara,
      cantitate: desiredQuantity,
      masina: selectedCar,
      timp: `${day}-${hours}:${minutes}` // Properly formatted time
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
      fetchProdusStoc();
      
      
    } else {
      alert("Error: " + response.data.message);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Enter a value for quantity.");
  }
};

const handleVeziGestiune = () =>{
      navigate('/gestiunebonuri');
}

const handleVeziBonuriSalvate = () =>{
        navigate('/bonurisalvate');
        localStorage.removeItem('selectedCar');
}

const handleVeziBonuriFinalizate = () =>{
        navigate('/bonurifinalizate');
        localStorage.removeItem('selectedCar');
}

const handleAdaugaProdus = () =>{
      navigate('/adauga-produs');
}


  return (
    <div className='stoc-produse'>
            <nav className="navigation">
              
                <button className="adauga-produs-btn" onClick={handleAdaugaProdus}>Adauga Produs</button>
                <div className="stoc-produse-btns">
                    <button className="stoc-produse-btn" onClick={handleVeziGestiune}>Gestiune Bonuri</button>
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

            
     
        <div>
        <div className="car-selector" ref={dropdownRef}>
      {/* Input field where user can type */}
      <input
        type="text"
        placeholder="Selecteaza masina"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setShowDropdown(true); 
        }}
        onFocus={() => setShowDropdown(true)} // Show dropdown when input is focused
        className="car-input"
      />

      
{showDropdown && filteredCars.length > 0 && (
    <ul className="car-dropdown">
      {filteredCars.map(car => (
        <li key={car.id} onClick={() => handleSelectCar(car)} className='car-item'> 
          {car.numar} {car.marca}
        </li>
      ))}
    </ul>
  )}
    </div>
        </div>
      

          <div className='stoc-container'> 
            <div className='input-fisier'>
            
                <input 
                   type="file" 
                   accept=".xls,.xlsx" 
                   onChange={handleFileUpload} 
                   className="file-input"
                />
      <button className='firstPage-button' onClick={handleVeziNomenclator}>Vezi Nomenclator</button>
            </div>
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
            <div className='bon-activ'>
            {bon.id ? (
    <>
      <p className='bon-info'>Id Bon : {bon.id}</p>
      <p className='bon-info'>Masina : {bon.masina}</p>
      <table>
        <thead>
          <tr>
            <th>Denumire</th>
            <th>Cod</th>
            <th>Codbara</th>
            <th>Cantitate</th>
            <th>Timp</th>
          </tr>
        </thead>
        <tbody>
          {bon.produse.map((produs) => (
            <tr key={produs.cod}>
              <td>{produs.denumire}</td>
              <td>{produs.cod}</td>
              <td>{produs.codbara}</td>
              <td>{produs.cantitate}</td>
              <td>{produs.timp}</td>
              <td>
                <button onClick={() => handleStergeProdus(bon.id, produs.codbara)}>Sterge produs</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="buttons-bon">
        <button className="button-bon-sal" onClick={handleSalveazaBon}> Salveaza bon</button>
        <button className="button-bon-fin" onClick={handleFinalizeazaBon}> Finalizeaza bon</button>
        <button className='button-bon-str' onClick={handleStergeBon}> Sterge bon</button>
      </div>
    </>
  ) : (
   null
  )}
            </div>
            </div>
        </div>
  )
}

export default Stoc
