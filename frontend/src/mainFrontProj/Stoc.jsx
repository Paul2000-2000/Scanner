import './Stoc.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import { useLocation } from 'react-router-dom';
import AdaugaProdus from './AdaugaProdus';
import { FaCar } from "react-icons/fa6";
import { FaCartShopping } from "react-icons/fa6";




const Stoc = ( ) => {


  const location = useLocation(); // Obține locația curentă
  const [produseStoc, setProduseStoc] = useState([]);

  const [filterText, setFilterText] = useState(''); 
  const [quantities, setQuantities] = useState({});
  const [bon, setBon] = useState({ id:null ,  masina: null, produse: [] });
  const [bonuriSalvate, setbonuriSalvate]  = useState();
  const [bonurifinalizate , setBonuriFinalizate] = useState();
  const [masini, setMasini] = useState([]);
  const [masiniSchimba,  setMasiniSchimba] =  useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [previousCar, setPreviousCar] = useState(null);
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState(""); 
  const [searchTextSchimba, setSearchTextSchimba] = useState(""); 
  const [searchTextOm, setSearchTextOm] = useState(""); 


  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownSchimba, setShowDropdownSchimba ] = useState(false);
  
  const dropdownRef = useRef(null);
  const dropdownChangeRef= useRef(null);


  const [visibleCount, setVisibleCount] = useState(30); // începi cu 30 produse

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


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownChangeRef.current && !dropdownChangeRef.current.contains(event.target)) {
        setShowDropdownSchimba(false);
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


        alert("Fisier produse schimbat cu succes!");
        fetchProdusStoc();
     
    };
};

const handleFileUploadMasini = async (event) => {
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

      const filteredDataMasini = jsonData.slice(1).map((row, index) => {
          const [ Nrauto, fel, marca] = row;
          return {
              id: index + 1,
              Nrauto,
              fel,
              marca,
          };
      });

      console.log("Masini procesate:", filteredDataMasini);

      await fetch("http://localhost:8080/incercarePostMasini", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(filteredDataMasini),
      });


      alert("Fisier masini schimbat cu succes!");
      fetchMasini();
   
  };
};

const handleVeziNomenclator = () =>{
  navigate('/nomenclator');
};


// const fetchOameni = async () => {
//   try {
//       const response = await axios.get('http://localhost:8080/oameni');
//       if (response.status === 200) 
//           setOameni(response.data);  
//       else
//           console.error(`Error fetching data: ${response.status}`);
//   } catch (error) {
//       console.error('Error fetching data:', error);
//   }
// };

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
    alert('Nu exista bonuri salvate!');
  }
};

const fetchBonuriFinalizate = async () => {
  try {
    const response = await axios.get("http://localhost:8080/bonurifinalizate");
    setBonuriFinalizate(response.data);
  } catch {
    alert('Nu exista bonuri finalizate!');
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
      } else {
        // Dacă există mașină, setează numărul mașinii
        if (bonData.masina) {
          const carNumber = bonData.masina; // Sau bonData.masina.numar dacă structura are `numar` în loc de `masina`
          setSelectedCar(carNumber);
          setSearchText(carNumber);
          localStorage.setItem('selectedCar', carNumber);  // Salvează doar numărul mașinii
        } else {
          // Dacă nu există mașină în răspuns, șterge datele
          setSelectedCar(null);
          setSearchText('');
          localStorage.removeItem('selectedCar');
        }
      }
    
      
      setBon({
        ...bonData,
        produse: bonData.produse || [], // Asigură-te că `produse` este mereu un array
      });

      console.log(bon);

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

    if (response.status === 200 && response.data.bon) {
      return response.data.bon; // Doar returnează bonul
    } else {
      return null;
    }
  } catch (error) {
    console.error("Eroare la fetchBonSalvat:", error);
    return null;
  }
};


const fetchMasini = async () => {
    try {
        const response = await axios.get('http://localhost:8080/masini');
        if (response.status === 200)
          { 
          setMasini(response.data);
          setMasiniSchimba(response.data);
          } 
    } catch (error) {
        console.error('Error fetching masini:', error);
    }
};

const filteredCars = masini.filter(car =>
    (`${car.Nrauto} `).toLowerCase().includes(searchText.toLowerCase())
);

const filteredCarsSchimba = masiniSchimba.filter(car =>
  searchTextSchimba ? (`${car.Nrauto} `).toLowerCase().includes(searchTextSchimba.toLowerCase()) : true
);

const handleSelectCar = async (car) => {
  const carNumar = car.Nrauto.trim();
  const selectedCarTrimmed = selectedCar?.trim();

  console.log("Carnumar este:", carNumar);
  console.log("Selected car este:", selectedCar);

  // UI + LocalStorage
  setSelectedCar(carNumar);
  setSearchText(`${carNumar} `);
  setShowDropdown(false);
  localStorage.setItem("selectedCar", `${carNumar} `);
  localStorage.setItem("searchText", `${carNumar} `);
  setPreviousCar(selectedCar);

  // Salvăm bonul existent dacă trebuie
  if (bon.produse.length > 0 && selectedCarTrimmed !== carNumar) {
    try {
      const response = await axios.post("http://localhost:8080/adaugaBonSalvat", {
        id: bon.id,
        masina: bon.masina,
        produse: bon.produse,
      });

      if (response.status === 200) {
        alert(response.data.message);
        setBon({ id: null, masina: null, produse: [] });
        localStorage.removeItem("selectedCar");
        fetchProdusStoc();
        navigate("/stoc");
      } else {
        alert("Eroare la salvare bon: " + response.data.message);
        return;
      }
    } catch (error) {
      console.error("Eroare la salvare:", error);
      alert("Eroare la salvare bon.");
      return;
    }
  }

  // Verificăm dacă există bon salvat pentru mașina nouă
  try {
    const bonSalvat = await fetchBonSalvat(carNumar);
    if (bonSalvat) {
      setBon(bonSalvat);
      console.log("BON INSTANT GĂSIT:", bonSalvat); // ✅ ai acces instant
      await fetchBon();
    } else {
      const bonNou = { id: null, masina: carNumar, produse: [] };
      setBon(bonNou);
      console.log("BON NOU INSTANT:", bonNou);
    }
  } catch (error) {
    console.error("Eroare la fetch bon salvat:", error);
    alert("Nu s-a putut verifica dacă există bon salvat.");
  }
};



const handleChangeCar  = async ( car ) =>{

  console.log('Masina schimba ar numarul' , car.Nrauto);

  setSearchTextSchimba(car.Nrauto); // Sau orice alt atribut care reprezintă mașina (de exemplu, car.marca)
  setShowDropdownSchimba(false);  // Închide dropdown-ul



  try {
   
    const response = await axios.post("http://localhost:8080/schimbaMasina", {
      masina: car.Nrauto,  // Trimite valoarea selectată din input
    });

    if (response.status === 200) {
      alert(response.data.message);

      // Resetăm bonul după salvare
      setBon({ id: bon.id, masina: searchTextSchimba, produse: bon.produse });

      setSelectedCar(car.Nrauto);
      setSearchText(`${car.Nrauto}`);
      setSearchTextSchimba("");

      
      localStorage.setItem("selectedCar", JSON.stringify(car.Nrauto));
      localStorage.setItem("searchText", `${car.Nrauto}`);

      
      fetchBon();
  
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




}
  
const handleStergeProdus = async (bonId, codbara) => {
    try {
      const response = await axios.delete(`http://localhost:8080/bonCurent/produs/${codbara}`);

      console.log(selectedCar);
  
      if (response.status === 200) {
        alert('Produsul a fost șters');
         fetchBon();
         fetchProdusStoc();
         fetchMasini();

       
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
            fetchMasini();
            
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
          fetchMasini();
         
          
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
  //  Apelăm fetchBon la fiecare schimbare de locație (adică când revii pe pagina respectivă)
 fetchBon();

  // Dacă ai bon disponibil, salvează doar numărul mașinii
  if (bon && bon.masina) {
    localStorage.setItem("selectedCar", bon.masina);  // Salvează doar numărul mașinii
  }

}, [location]); // Depinde de locația curentă

const handleSearchChange = (e) => {
  const newSearchText = e.target.value;
  setSearchText(newSearchText);
  setShowDropdown(true);
  localStorage.setItem("searchText", newSearchText);  // Salvează valoarea în localStorage
};

useEffect(() => {
  console.log("Current location pathname: ", location.pathname);  // Verifică dacă pathname-ul se schimbă

  const savedSearchText = localStorage.getItem('searchText');
  const savedSelectedCar = localStorage.getItem('selectedCar');

  console.log("Saved selectedCar from localStorage:", savedSelectedCar); // Verifică ce se salvează

  if (savedSearchText) {
    setSearchText(savedSearchText);  // Setează searchText din localStorage
  }

  if (savedSelectedCar) {
    setSelectedCar(savedSelectedCar);  // Setează doar numărul mașinii
  }

}, [location]); // Când locația se schimbă, recuperează valoarea


// useEffect(() =>{

//  const inputScaner = document.getElementById("inputscaner");

//   handleAddProduct(inputScaner);

// } , [])


  useEffect(() => {
    fetchProdusStoc();
    fetchMasini();
    fetchBonuriSalvate();
    fetchBonuriFinalizate();
    // fetchOameni();
    
  }, []);


  useEffect(() =>{
    console.log('Search text este ' , searchText);
    console.log('Previous car este:' , previousCar);
    console.log('Selected car este' , selectedCar);
    console.log('Bonul este sub froma:' , bon)
    console.log('Bonuri salvate sunt:' , bonuriSalvate);
    console.log('Bonuri finalizate sunt:' , bonurifinalizate);
    console.log('locatie este' , location.pathname);

    
  } , [bon , previousCar , selectedCar , bonuriSalvate , bonurifinalizate ,  location] )

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

const visibleProduse = filteredProduse.slice(0, visibleCount);



    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          setVisibleCount((prev) => prev + 30); // încarci încă 30
        }
      };


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
    alert(`Eroare: Cantitatea (${desiredQuantity}) este mai mare decat (${stockQuantity}).`);
    return;
  }

  if (desiredQuantity < 0) {
    alert("Nu poate sa fie negativa!");
    return;
  }

  
  if (!selectedCar) {
    alert("Selecteaza masina!");
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

    const year = now.getFullYear(); // 2025
    const day = now.getDate().toString().padStart(2, '0'); // 31
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 03
    const hours = now.getHours().toString().padStart(2, '0'); // 18
    const minutes = now.getMinutes().toString().padStart(2, '0'); // 23
    const seconds = now.getSeconds().toString().padStart(2, '0'); // 23
    
  
    // Adăugăm produsul la bonul curent
   
  

    // Verifică dacă datele sunt corecte înainte de a le trimite
    const requestData = {
      denumire: produs.denumire,
      cod: produs.cod,
      codbara: produs.codbara,
      cantitate: desiredQuantity,
      masina: selectedCar,
      timp: `${hours}:${minutes}:${seconds} - ${day}.${month}.${year}` // Properly formatted time
    };

  try {
   
    const response = await axios.post("http://localhost:8080/adaugaBon", requestData
     );

   
    if (response.status === 200) {
      alert(response.data.message);

      const updatedProducts = [...bon.produse, {
        denumire: produs.denumire,
        cod: produs.cod,
        codbara: produs.codbara,
        cantitate: desiredQuantity,
        timp: `${hours}:${minutes}:${seconds} - ${day}.${month}.${year}` // Properly formatted time
      }];
    
      // Actualizăm bonul cu noul produs
      setBon(prevBon => ({
        ...prevBon,
        produse: updatedProducts
      }));

      setFilterText("");

      
      if (!bon.masina) {
        setBon(prev => ({ ...prev, masina: prev.masina || selectedCar }));
        setMasini(prevMasini => prevMasini.filter(car => car.numar !== selectedCar)); 
      }

      fetchBon();
      fetchProdusStoc();
      
      
    } else {
      alert("Error: " + response.data.message);
      setFilterText("");
    
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("Eroare input sau cantitate stoc");
  }
};


const handleAddCobara = async ( codbara ) =>{ 

    const produsCodBaraFct = produseStoc.find( ( p) => p.codbara === codbara);

    if (produsCodBaraFct) 
      handleAddProduct(produsCodBaraFct);


}


useEffect(() => {
  const isValidCodBara = /^\d{12}$/.test(filterText);

  if (isValidCodBara) {
    handleAddCobara(filterText);
    setFilterText(""); // opțional: resetezi câmpul după ce e folosit
  }
}, [filterText ]);

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

const handleSearchChangeSchimba = () =>{
}

const handleSearchSelecteazaOm = (codbara, timp, value) => {
  const key = `${codbara}_${timp}`;
  setSearchTextOm((prev) => ({
    ...prev,
    [key]: value,
  }));
};
const handleSaveExcel  = async ( produseStoc ) =>{

  try{

    const response = await axios.post('http://localhost:8080/savetoexcel' , produseStoc );

    if (response.status === 200)
      {
          alert('Stoc salvat cu succes in Excel');
      } 
      else{
          alert('Salvarea a esuat');
      }

  } catch(error) {
    console.log(error);
  }

}


const handleSelecteazaOm  = async ( codbara, timp ) =>{

  const key = `${codbara}_${timp}`;
  
  const omNume = searchTextOm[key];

  if (!omNume) {
    alert("Te rog introdu un nume pentru Om.");
    return;
  }

  
  console.log('Codbara produs este:', codbara);
  console.log('Omul este:', omNume);
  console.log("Timp produs:", timp);


  try {
   
    const response = await axios.post("http://localhost:8080/omBonProdus", {
      codbara: codbara,
      timp: timp,
      om: omNume,
    });
    console.log("Răspuns de la server:", response.data);

    if (response.status === 200) {
      alert(response.data.message);

 
   
      setSearchTextOm((prev) => ({
        ...prev,
        [key]: "",
      }));

    

      
      fetchBon();
  
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
            <button onClick={() => handleSaveExcel(produseStoc)} className='saveexcelbut'> Save  to Excel </button>


           

        <div style={{display:"flex" , width:"100vw" , gap:"55px"}}>

        <div className='input-fisier' style={{display:"flex", alignItems:"center" , justifyContent:"center"}}>
            
            <input 
               type="file" 
               accept=".xls,.xlsx" 
               onChange={handleFileUpload} 
               className="file-input"
            />
  <FaCartShopping style={{width:"55px" , height:"55px"}}/>
        </div>


            <div>
            <h2 style={{marginBottom:"35px"}}> Produse Stoc </h2>
           
            <input 
                type='text' 
                placeholder='Cauta produs...' 
                value={filterText} 
                onChange={handleFilterChange}
                id="inputscaner"
            />
            </div>
            <div className='input-fisier'  style={{display:"flex", alignItems:"center" , justifyContent:"center"}}>
            
            <input 
               type="file" 
               accept=".xls,.xlsx" 
               onChange={handleFileUploadMasini} 
               className="file-input"
            />
    <FaCar style={{width:"55px" , height:"55px"}}/>
        </div>


      </div>

            
     
        <div>
        <div className="car-selector" ref={dropdownRef}>
      {/* Input field where user can type */}
      <input
        type="text"
        placeholder="Selecteaza masina"
        value={searchText}
        onChange={handleSearchChange}  // Folosește handler-ul pentru schimbarea textului
        onFocus={() => setShowDropdown(true)} // Show dropdown when input is focused
        className="car-input"
      />

      
{showDropdown && filteredCars.length > 0 && (
    <ul className="car-dropdown">
      {filteredCars.map(car => (
        <li key={car.id} onClick={() => handleSelectCar(car)} className='car-item'> 
          {car.Nrauto} 
        </li>
      ))}
    </ul>
  )}
    </div>
        </div>
      

          <div className='stoc-container'> 
           
            <div   style={{ height: "65vh", width:"50vw",overflowY: "auto",marginTop: "1rem" }}
  onScroll={handleScroll}>
            <table style={{width:"100%"}}>
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
                    {visibleProduse.map(produs => (
                        <tr key={produs.id}>
                            <td>{produs.id}</td>
                            <td>{produs.denumire}</td>
                            <td>{produs.cod}</td>
                            <td>{produs.codbara}</td>
                            <td>{produs.cantitate}</td>
                            <td>
                            <input 
                                    type='number' 
                                    value={quantities[produs.id] !== undefined ? quantities[produs.id] : 1}
                                    onChange={(e) => handleQuantityChange(produs.id, e.target.value)}
                                   
                                    
                            />

                            </td>
                            <td>
                            <button onClick={() => handleAddProduct(produs)}>
                                Adauga 
                            </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
            <div className='bon-activ' style={{width:"15vw"}}>
            {bon.id ? (
    <>
      <p className='bon-info'>Id Bon : {bon.id}</p>
      <p className='bon-info'>Masina : {bon.masina}</p>
      <div className="car-selector" ref={dropdownChangeRef}>
      <input
        type="text"
        placeholder="Schimba masina"
        value={searchTextSchimba}
        onChange={handleSearchChangeSchimba}  // Folosește handler-ul pentru schimbarea textului
        onFocus={() => setShowDropdownSchimba(true)} // Show dropdown when input is focused
        className="schimbacarinput"
      />

{showDropdownSchimba && filteredCarsSchimba.length > 0 && (
    <ul className="car-dropdown">
      {filteredCarsSchimba.map(car => (
        <li key={car.id} onClick={() => handleChangeCar(car)} className='car-item'> 
          {car.Nrauto} 
        </li>
      ))}
    </ul>
  )}
  </div>
      <table>
        <thead>
          <tr>
            <th>Denumire</th>
            <th>Cod</th>
            <th>Codbara</th>
            <th>Cantitate</th>
            <th>Timp</th>
            <th>Mecanic</th>
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

              {!produs.om ? (
  <div className="car-selector" style={{width:"145px"}}>
   <input
  type="text"
  style={{width:"145px"}}
  placeholder="Introdu Mecanic"
  value={searchTextOm[`${produs.codbara}_${produs.timp}`] || ""}
  onChange={(e) =>
    handleSearchSelecteazaOm(produs.codbara, produs.timp, e.target.value)
  }
  className="schimbacarinput"
/>
  </div>
) : (
  <p>{produs.om}</p>
)}

              </td>
              <td>
                <button onClick={() => handleStergeProdus(bon.id, produs.codbara)}>Sterge produs</button>
              </td>
              <td>
              <button onClick={() => handleSelecteazaOm(produs.codbara, produs.timp)}>
  Selecteaza Mecanic
</button>
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
