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

    const handleModificaBon = async (bon) =>{

        try{
      
            const response = await axios.post('http://localhost:8080/modificaBonFinalizat' , bon );
        
            if (response.status === 200)
              {
                  alert('Poti modifica bonul');
                  navigate('/stoc');
              } 
              else{
                  alert('Nu poti modifica bonul');
              }
        
          } catch(error) {
            console.log(error);
          }

    } 


    const handleSaveExcelBon  = async ( bon ) =>{

        try{
      
          const response = await axios.post('http://localhost:8080/savetoexcelBon' , bon );
      
          if (response.status === 200)
            {
                alert('Bon salvat cu succes in Excel');
            } 
            else{
                alert('Salvarea a esuat');
            }
      
        } catch(error) {
          console.log(error);
        }
      
      }

   
    return (
        <div className="bon">
             <button className='back-button' onClick={handleBackStoc}>Back</button>
             <button className='modifica-btn' onClick={() => handleModificaBon(bon)}> Modifica </button>
             <button onClick={() => handleSaveExcelBon(bon)} className='saveexcelbut'> Save to Excel </button>
       
            
             <p className='bon-info'>Id Bon : {bon.id}</p>
             <p className='bon-info'>Masina : {bon.masina}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Nr Curent Produs</th>
                            <th>Denumire</th>
                            <th>Cod</th>
                            <th>Codbara</th>
                            <th>Cantitate</th>
                            <th>Timp</th>
                            <th>Om</th>

                        </tr>
                    </thead>
                    <tbody>
                    {bon.produse.map((produs, index) => (
      <tr key={produs.cod}>
        <td>{index + 1}</td> 
        <td>{produs.denumire}</td>
        <td>{produs.cod}</td>
        <td>{produs.codbara}</td>
        <td>{produs.cantitate}</td>
        <td>{produs.timp}</td>
        {produs.om && <td>{produs.om}</td>}
      </tr>
    ))}
                    </tbody>
                </table>
    
        
           
        
    </div>
    
    );
};

export default BonFinalizat;
