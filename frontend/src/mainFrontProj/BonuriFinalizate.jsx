import './BonuriFinalizate.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate  } from 'react-router-dom';

const BonuriFinalizate = () => {
  const [bonuriFinalizate, setBonuriFinalizate] = useState([]);
  const navigate = useNavigate();

  const fetchBonuriFinalizate = async () => {
    try {
      const response = await axios.get("http://localhost:8080/bonurifinalizate");
      setBonuriFinalizate(response.data);
    } catch {
      alert('Failed to fetch data');
    }
  };

  const handleBackStoc = () =>{
    navigate('/stoc');
  }

  const handleVeziBon =  ( bonId ) => {
    navigate(`/bonfinalizat/${bonId}`);
  }
  

  useEffect(() => {
    fetchBonuriFinalizate();
  }, []);

  return (

    <div className="container">
      <button className="back-button" onClick={handleBackStoc}>Back</button>
      <h2 className="title">Bonuri Finalizate</h2>
      <div className="bonuri-container">
        {bonuriFinalizate.length > 0 ? (
          <table className="bon-table">
            <thead>
              <tr>
                <th>ID Bon</th>
                <th>Masina</th>
              </tr>
            </thead>
            <tbody>
              {bonuriFinalizate.map((bon) => (
                <tr key={bon.id}>
                  <td>{bon.id}</td>
                  <td>{bon.masina}</td>
                  <td>
                    <button onClick={() => handleVeziBon(bon.id)}>Vezi bon</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-message">📜 Nu există bonuri finalizate.</p>
        )}
      </div>
    </div>
  );
};

export default BonuriFinalizate;
