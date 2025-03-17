import './FirstPage.css';
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";


const FirstPage = () => {

    const navigate = useNavigate();
   

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
    }

    const handleVeziStoc = () =>{
        navigate('/stoc');
    }

    const handleAdaugaProdus = () =>{
        navigate('/adauga-produs');
    }

  return (
    <div className='firstPage-buttons'>
       <input 
    type="file" 
    accept=".xls,.xlsx" 
    onChange={handleFileUpload} 
    className="file-input"
  />
      <button className='firstPage-button' onClick={handleVeziNomenclator}>Vezi Nomenclator</button>
      <button className='firstPage-button' onClick={handleAdaugaProdus}>Adauga Produs</button>
      <button className='firstPage-button' onClick={handleVeziStoc}>Vezi Stoc</button>
    </div>
  )
}

export default FirstPage
