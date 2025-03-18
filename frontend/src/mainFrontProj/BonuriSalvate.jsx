import './BonuriSalvate.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';

const BonuriSalvate = () => {

  const [bonuriSalvate, setbonuriSalvate] = useState([]);
  const navigate = useNavigate();

  const fetchBonuriSalvate = async () => {
    try {
      const response = await axios.get("http://localhost:8080/bonurisalvate");
      setbonuriSalvate(response.data);
    } catch {
      alert('Failed to fetch data');
    }
  };

  const handleStergeProdus = async (bonId, cod) => {
    try {
      const response = await axios.delete(`http://localhost:8080/bon/${bonId}/produs/${cod}`);
  
      if (response.status === 200) {
        alert('Produsul a fost șters');
        fetchBonuriSalvate(); // Reîncărcăm datele după ștergere
        console.log(response.data);
      } else {
        alert('A apărut o eroare');
      }
    } catch (error) {
      console.error('Eroare la ștergere:', error);
      alert('A apărut o eroare la ștergere.');
    }
};

const handleBackStoc = () =>{
  navigate('/stoc');
}

const handleSterge =  async (bonId) => {
 try{

  const response = await axios.delete(`http://localhost:8080/stergebonsalvate/${bonId}`);

  if(response.status === 200)
  {
    alert('Bon sters cu succes');
    setbonuriSalvate(bonuriSalvate.filter((bon) => bon.id !== bonId));
  }
  

 } catch (error){
  alert('Bonul nu o a putut fi sters' , error);
 }
}


const handleFinalizeaza = async (bonId) => {
  try {
    console.log("Finalizing bon with ID:", bonId);

    // Send a POST request using axios
    const response = await axios.post("http://localhost:8080/bonurifinalizatesal", { bonId });

    // Check if the response status is OK (200)
    if (response.status === 200) {
      console.log("Bon finalizat:", response.data.message);
      // Update the UI by removing the finalized bon from the list
      setbonuriSalvate(prevBonuri => prevBonuri.filter(bon => bon.id !== bonId));
    } else {
      console.error("Error finalizing bon:", response.statusText);
      alert('A apărut o eroare la finalizarea bonului');
    }
  } catch (error) {
    console.error("Error in finalization process:", error);
    if (error.response) {
      // The request was made, and the server responded with an error
      console.log("Response error: ", error.response);
    } else if (error.request) {
      // The request was made but no response was received
      console.log("Request error: ", error.request);
    } else {
      // Something else caused the error
      console.log("Error message: ", error.message);
    }
    alert('A apărut o eroare la finalizarea bonului');
  }
};


  useEffect(() => {
    fetchBonuriSalvate();
  }, []);  // Add empty dependency array to only run once

  return (
    <div className="container">
    <div className="header">
      <button className="back-button" onClick={handleBackStoc}>Back</button>
      <h2 className="title">Bonuri Salvate</h2>
    </div>

    <div className="bonuri-salvate-container">
      {Array.isArray(bonuriSalvate) && bonuriSalvate.length > 0 ? (
        <table className="bon-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mașina</th>
              <th>Produse</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {bonuriSalvate
              .filter(bon => Array.isArray(bon.produse) && bon.produse.length > 0)
              .map((bon) => (
                <tr key={bon.id}>
                  <td>{bon.id}</td>
                  <td>{bon.masina}</td>
                  <td>
                    <div className="produs-list">
                      {bon.produse.map((produs, idx) => (
                        <div key={idx} className="produs-card">
                          <p><strong>{produs.denumire}</strong></p>
                          <p>Cod: {produs.cod}</p>
                          <p>Cod Bara: {produs.codbara}</p>
                          <p>Cantitate: {produs.cantitate}</p>
                          <button className="delete-btn" onClick={() => handleStergeProdus(bon.id, produs.cod)}>Șterge</button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="actions">
                    <button className="finalize-btn" onClick={() => handleFinalizeaza(bon.id)}>Finalizează bon</button>
                    <button className="delete-btn" onClick={() => handleSterge(bon.id)}>Șterge bon</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <div className="no-products-message">
          <h2>Nu există bonuri salvate.</h2>
        </div>
      )}
    </div>
  </div>
     
  );
};

export default BonuriSalvate;
