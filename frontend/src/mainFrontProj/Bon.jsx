import './Bon.css';
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const Bon = () => {
    const [bon, setBon] = useState(); // Starea bonului
    const navigate = useNavigate();
   


    // Fetch pentru bonul existent
    const fetchBon = async () => {
        try {
            const response = await axios.get("http://localhost:8080/bon");
            setBon(response.data);
        } catch {
            alert("Bon does not exist");
        }
    };

    // Folosim useEffect pentru a încărca bonul la început
    useEffect(() => {
        fetchBon();
    }, []);

    // Funcția care salvează bonul și îl șterge din starea componentului
    const handleSalveazaBon = async () => {

        if (!bon || !bon.produse || bon.produse.length === 0) {
            alert('Nu ai produse!');
            return;
        }
    
        try {
            const response = await axios.post("http://localhost:8080/adaugaBonSalvat", {
                id: bon.id,
                masina: bon.masina,
                produse: bon.produse
            });

            // Dacă salvarea este reușită, actualizăm UI-ul
            if (response.status === 200) {
                alert(response.data.message);
                setBon(null);  // Șterge bonul din starea locală
                
                navigate('/stoc'); // Navighează la altă pagină
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to submit. Please try again.");
        }
    };

    const handleBackStoc = () =>{
        navigate('/stoc');
      }
      


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
                setBon(null);  // Șterge bonul din starea locală
                
                navigate('/stoc'); // Navighează la altă pagină
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Failed to submit. Please try again.");
        }
    };

    const handleStergeProdus = async (bonId, cod) => {
        try {
          const response = await axios.delete(`http://localhost:8080/bonCurent/produs/${cod}`);
      
          if (response.status === 200) {
            alert('Produsul a fost șters');
             fetchBon();
            console.log(response.data);
          } else {
            alert('A apărut o eroare');
          }
        } catch (error) {
          console.error('Eroare la ștergere:', error);
          alert('A apărut o eroare la ștergere.');
        }
    };

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
           
            
        {bon.produse && bon.produse.length > 0 ? (
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

                        </tr>
                    </thead>
                    <tbody>
                        {bon.produse.map((produs) => (
                            <tr key={produs.cod}>
                                <td>{produs.denumire}</td>
                                <td>{produs.cod}</td>
                                <td>{produs.codbara}</td>
                                <td>{produs.cantitate}</td>
                                <td>
                                    <button onClick={() => handleStergeProdus(bon.id, produs.cod)}>Sterge produs</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
    
                
                <div className="buttons-bon">
                    <button className="button-bon-sal" onClick={handleSalveazaBon}> Salveaza </button>
                    <button className="button-bon-fin" onClick={handleFinalizeazaBon}> Finalizeaza </button>
                </div>
            </>
        ) : (
            <div className="no-products-message">
                <h3>Nu există produse în bon.</h3>
               
            </div>
        )}
    </div>
    
    );
};

export default Bon;
