import './BonFinalizat.css';
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate , useParams } from 'react-router-dom';

const BonFinalizat = () => {
    const [bon, setBon] = useState(); 
    const navigate = useNavigate();

    const { id } = useParams();
    console.log(id);


    // Fetch pentru bonul existent
    const fetchBon = async () => {
        try {
            const response = await axios.get(`http://localhost:8080/bonfinalizat/${id}`);
            setBon(response.data);
        } catch {
            alert("Bon does not exist");
        }
    };

    // Folosim useEffect pentru a încărca bonul la început
    useEffect(() => {
        fetchBon();
    }, [id]);



    const handleBackStoc = () =>{
        navigate('/bonurifinalizate');
      }
      

    // Dacă bonul este încărcat, dar nu există, afisăm loading
    if (!bon || (bon.produse && bon.produse.length === 0)) {
        return (
            <div className="empty-bon-container">
                <button className='back-button' onClick={handleBackStoc}>Back</button>
                <div className="no-products-message">
                    <h3>Nu există produse în bon.</h3>
                </div>
            </div>
        );
    }

    // Render-ul bonului
    return (
        <div className="bon">
             <button className='back-button' onClick={handleBackStoc}>Back</button>
           
            
       
            
             <p className='bon-info'>Id Bon : {bon.id}</p>
             <p className='bon-info'>Masina : {bon.masina}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Denumire</th>
                            <th>Cod</th>
                            <th>Codbara</th>
                            <th>Cantitate</th>

                        </tr>
                    </thead>
                    <tbody>
                        {bon.produse.map((produs) => (
                            <tr key={produs.cod}>
                                <td>{produs.denumire}</td>
                                <td>{produs.cod}</td>
                                <td>{produs.codbara}</td>
                                <td>{produs.cantitate}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
    
        
           
        
    </div>
    
    );
};

export default BonFinalizat;
