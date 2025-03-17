import './VNomenclator.css';
import { useState , useEffect } from 'react';
import axios from 'axios'
import { useNavigate} from 'react-router-dom';

const VNomenclator = () => {

    const [produseNomenclator , setProduseNomenclator] = useState([]);
    const navigate = useNavigate();

    const handleBackNom = () =>{
        navigate('/');
    }

    const fetchProduse = async () =>{
        const response = await axios.get('http://localhost:8080/produseNomenclator');
        if (response.status === 200) 
            setProduseNomenclator(response.data)
        else
            console.error(`Error fetching data: ${response.status}`);
    }

    useEffect(() => {
        fetchProduse();
    }, [])

  return (
    <div className="nomenclator">
    {/* Container to align Back button left and title center */}
    <div className="nomenclator-header">
      <button className="back-button" onClick={handleBackNom}>Back</button>
      <h2>Produse Nomenclator</h2>
    </div>

    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Denumire</th>
          <th>Cod</th>
          <th>Codbara</th>
        </tr>
      </thead>
      <tbody>
        {produseNomenclator.map((produs) => (
          <tr key={produs.id}>
            <td>{produs.id}</td>
            <td>{produs.denumire}</td>
            <td>{produs.cod}</td>
            <td>{produs.codbara}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  )
}

export default VNomenclator
