import './BonGestionat.css';
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate , useParams } from 'react-router-dom';

const BonGestionat = () => {
    const [bonGestionat, setBonGestionat] = useState(); 
    const navigate = useNavigate();

    const { id } = useParams();
    console.log(id);


    // Fetch pentru bonul existent
    const fetchBonGestionat = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/bongestionat/${id}`);
            setBonGestionat(response.data);
        } catch {
            alert("Bon does not exist");
        }
    };

    // Folosim useEffect pentru a încărca bonul la început
    useEffect(() => {
        fetchBonGestionat();
    }, [id]);



    const handleBackGestiune = () =>{
        navigate('/gestiunebonuri');
      }
      

    // Dacă bonul este încărcat, dar nu există, afisăm loading
    if (!bonGestionat || (bonGestionat.produse && bonGestionat.produse.length === 0)) {
        return (
            <div className="empty-bon-container">
                <button className='back-button' onClick={handleBackGestiune}>Back</button>
                <div className="no-products-message">
                    <h3>Nu există produse în bon.</h3>
                </div>
            </div>
        );
    }

    // Render-ul bonului
    return (
        <div className="bon">
             <button className='back-button' onClick={handleBackGestiune}>Back</button>
           
            
       
            
             <p className='bon-info'>Id Bon : {bonGestionat.id}</p>
             <p className='bon-info'>Masina : {bonGestionat.masina}</p>
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
                        {bonGestionat.produse.map((produs) => (
                            <tr key={produs.cod}>
                                <td>{produs.denumire}</td>
                                <td>{produs.cod}</td>
                                <td>{produs.codbara}</td>
                                <td>{produs.cantitate}</td>
                                <td>{produs.timp}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
    
        
           
        
    </div>
    
    );
};

export default BonGestionat;
