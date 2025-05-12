import './AdaugaProdus.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdaugaProdus = () => {

    const [produseNomenclator, setProduseNomenclator] = useState([]);
    const [produseStoc, setProduseStoc] = useState([]);
    const [filterText, setFilterText] = useState(''); 
    const [inputQuantities, setInputQuantities] = useState({}); 
    const navigate = useNavigate();

    const [visibleCount, setVisibleCount] = useState(30); // începi cu 30 produse

    // Function to fetch products from API
    const fetchProduseNomenclator = async () => {
        try {
            const response = await axios.get('http://localhost:8080/produseNomenclator');
            if (response.status === 200) 
                setProduseNomenclator(response.data);  
            else
                console.error(`Error fetching data: ${response.status}`);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
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


    useEffect(() => {
        fetchProduseNomenclator();
        fetchProdusStoc();
    }, []);


    const handleFilterChange = (e) => {
        setFilterText(e.target.value); 
    };

    const handleQuantityChange = (produsId, e) => {
        const value = parseInt(e.target.value, 10) || 0;
        setInputQuantities(prev => ({
            ...prev,
            [produsId]: value
        }));
    };

    const handleBackHome = () =>{
        navigate('/');
    }




    const handleAddProduct = async (produs) => {
        const inputQuantity = inputQuantities[produs.id];

      
        if (inputQuantity <= 0) {
            alert('Introdu o valoare mai mare decat!');
            return;
        }

        if (inputQuantity == undefined){
            alert('Introdu o valoare!');
            return;
        }


        const existingProduct = produseStoc.find(stoc => stoc.cod === produs.cod && stoc.codbara === produs.codbara);

        if (existingProduct) {
            try {
               
                const response = await axios.put('http://localhost:8080/updateStock', {
                    id: existingProduct.id,
                    quantity: inputQuantity 
                });

                if (response.status === 200) {
                    alert(`Stoc updatat pentru ${produs.denumire}`);
                    setProduseStoc(response.data.updatedStock);
                    setFilterText("");
                    fetchProdusStoc();

                } else {
                    alert('Error updating stock');
                }
            } catch (error) {
                console.error('Error updating stock:', error);
                alert('An error occurred while updating the stock.');
            }
        } else {
            alert('Product not found in stock.');
        }
    };

    const handleAddProductDefault = async (codbara) => {
        const inputQuantity = 1;

    

        const existingProduct = produseStoc.find(stoc => stoc.codbara === codbara);

        if (existingProduct) {
            try {

              
               
                const response = await axios.put('http://localhost:8080/updateStock', {
                    id: existingProduct.id,
                    quantity: inputQuantity 
                });

                if (response.status === 200) {
                    alert(`Stoc updatat pentru ${existingProduct.denumire}`);
                    setProduseStoc(response.data.updatedStock);
                    setFilterText("");
                    fetchProdusStoc();

                } else {
                    alert('Error updating stock');
                }
            } catch (error) {
                console.error('Error updating stock:', error);
                alert('An error occurred while updating the stock.');
            }
        } else {
            alert('Product not found in stock.');
        }
    };


    const filteredProduse = produseNomenclator.filter(produs => {
        const denumire = String(produs.denumire || '').toLowerCase();
        const cod = String(produs.cod || '').toLowerCase();
        const codbara = String(produs.codbara || '').toLowerCase();
        const filterTextLower = filterText.toLowerCase();

        return denumire.includes(filterTextLower) ||
               cod.includes(filterTextLower) ||
               codbara.includes(filterTextLower);
    });

    const visibleProduse = filteredProduse.slice(0, visibleCount);


    useEffect(() => {
        const isValidCodBara = /^\d{12}$/.test(filterText);
      
        if (isValidCodBara) {
          handleAddProductDefault(filterText);
          setFilterText(""); // opțional: resetezi câmpul după ce e folosit
        }
      }, [filterText ]);



    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
          setVisibleCount((prev) => prev + 30); // încarci încă 30
        }
      };

    return (
        <div className='adauga-produs'>
            <button className='back-button' onClick={handleBackHome}>Back</button>
            <h2> Adauga Produs </h2>
           
            <input 
                type='text' 
                placeholder='Cauta produs...' 
                value={filterText} 
                onChange={handleFilterChange}
            />

<div   style={{ height: "100vh", width:"75vw",overflowY: "auto",marginTop: "1rem" , padding:"25px"}}
  onScroll={handleScroll}>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Denumire</th>
                        <th>Cod</th>
                        <th>Codbara</th>
                        <th>Cantitate</th>
                    </tr>
                </thead>
                <tbody>
                    {visibleProduse.map(produs => (
                        <tr key={produs.id}>
                            <td>{produs.id}</td>
                            <td>{produs.denumire}</td>
                            <td>{produs.cod}</td>
                            <td>{produs.codbara}</td>
                            <td>
                            <input 
                                    type='number' 
                                    onChange={(e) => handleQuantityChange(produs.id, e)} 
                                    value={inputQuantities[produs.id] || ''} 
                            />

                            </td>
                            <td>
                                <button onClick={() => handleAddProduct(produs)}>Adauga</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default AdaugaProdus;
