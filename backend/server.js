import express from "express";
import cors from "cors";
import produseNomenclator from "./nomenclator.js";
import produseStoc from "./stoc.js";
import bon from "./bon.js";
import masini from "./masini.js";
import multer from "multer";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import counter from "./counter.js";
import bonuriSalvate from "./bonurisalvate.js";
import bonuriFinalizate from "./bonurifinalizate.js";
import bonurigestionate from "./bonurigestionate.js";
import nomenclator from "./nomenclator.js";
import bodyParser from "body-parser";
import { time } from "console";

const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

app.use(express.static("public"));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.post("/incercarePost", (req, res) => {
  const __filenameIncercare = fileURLToPath(import.meta.url);
  const __dirnameIncercare = path.dirname(__filenameIncercare);
  const filePathIncercare = path.join(__dirnameIncercare, "nomenclator.js");

  const updatedIncercareSters = `const nomenclator = [];\n\nexport default nomenclator;`;
  fs.writeFileSync(filePathIncercare, updatedIncercareSters);

  const newProducts = req.body;

  console.log("Produse primite din frontend:", newProducts);

  if (!newProducts || newProducts.length === 0) {
    return res.status(400).json({ message: "Nu au fost trimise produse!" });
  }

  const updatedIncercare = `const nomenclator = ${JSON.stringify(
    newProducts,
    null,
    2
  )};\n\nexport default nomenclator;`;

  console.log(
    "Cum arată conținutul fișierului incercare.js:",
    updatedIncercare
  );

  fs.writeFileSync(filePathIncercare, updatedIncercare);

  const __filenameStoc = fileURLToPath(import.meta.url);
  const __dirnameStoc = path.dirname(__filenameStoc);
  const filePathStoc = path.join(__dirnameStoc, "stoc.js");

  const updatedStocSters = `const stoc = [];\n\nexport default stoc;`;
  fs.writeFileSync(filePathStoc, updatedStocSters);

  const updatedStoc = `const stoc = ${JSON.stringify(
    newProducts,
    null,
    2
  )};\n\nexport default stoc;`;

  fs.writeFileSync(filePathStoc, updatedStoc);

  res.json({ message: "Produse adăugate cu succes!", incercare: newProducts });
});

app.get("/incercareGet", (req, res) => {
  res.json(incercare);
});

app.get("/produseNomenclator", async (req, res) => {
  res.json(nomenclator);
});

app.get("/produseStoc", async (req, res) => {
  try {
    const __filenameStoc = fileURLToPath(import.meta.url);
    const __dirnameStoc = path.dirname(__filenameStoc);
    const filePathStoc = path.join(__dirnameStoc, "stoc.js");
    const bonModuleUrl = pathToFileURL(filePathStoc).href;

    // Import dinamic cu "cache busting" pentru a evita caching-ul
    const mod = await import(bonModuleUrl + "?update=" + Date.now());

    res.json(mod.default); // Trimite obiectul bon ca JSON
  } catch (error) {
    console.error("Eroare", error);
    res.status(500).json({ message: "Eroare." });
  }
});

app.post("/resetBon", (req, res) => {
  produseBon.length = 0;
  const filePathBon = path.join(__dirname, "dataBon.js");
  const dataToWriteBon = `const produseBon = [];\n\nexport default produseBon;`;

  fs.writeFileSync(filePathBon, dataToWriteBon);

  res.status(200).send({
    message: "Current Bon has been cleared.",
  });
});

app.get("/produseIstoricBon", (req, res) => {
  res.send(produseIstoricBon);
  console.log(produseIstoricBon);
});

const __filenameStoc = fileURLToPath(import.meta.url);
const __dirnameStoc = path.dirname(__filenameStoc);
const filePathStoc = path.join(__dirnameStoc, "stoc.js");
console.log(filePathStoc);

app.put("/updateStock", async (req, res) => {
  const { id, quantity } = req.body;

  if (typeof id !== "number" || typeof quantity !== "number" || quantity <= 0) {
    return res.status(400).json({ message: "Invalid ID or quantity" });
  }

  try {
    const productIndex = produseStoc.findIndex((product) => product.id === id);

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in stock" });
    }

    if (produseStoc[productIndex].cantitate === undefined) {
      // Dacă nu are câmpul `cantitate`, îl inițializăm la 0
      produseStoc[productIndex].cantitate = 0;
    }

    produseStoc[productIndex].cantitate += quantity;

    // Write the updated stock back to the JS file (update stoc.js)
    const updatedData = `const stoc = ${JSON.stringify(
      produseStoc,
      null,
      2
    )};\n\nexport default stoc;`;

    // Save it back as a JS file
    fs.writeFileSync(filePathStoc, updatedData);

    return res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Error updating stock:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/adaugaBon", async (req, res) => {
  try {
    const produs = req.body;
    console.log("Ce primesc:", produs);

    // Verificăm dacă bonul există deja (bon.js)
    const __filenameBon = fileURLToPath(import.meta.url);
    const __dirnameBon = path.dirname(__filenameBon);
    const filePathBon = path.join(__dirnameBon, "bon.js");

    let bon;
    try {
      const bonData = await fs.promises.readFile(filePathBon, "utf-8");
      bon = eval(bonData.replace("export default", "").trim()); // Convertim în obiect
    } catch (error) {
      console.log("Fișierul bon.js nu există sau nu are date valide.");
      bon = { id: null, masina: null, produse: [] }; // Inițializăm un bon gol
    }

    console.log("Bon găsit:", bon);

    // Validarea datelor produsului
    if (
      !produs ||
      !produs.denumire ||
      !produs.cod ||
      !produs.cantitate ||
      !produs.masina ||
      !produs.timp
    ) {
      return res
        .status(400)
        .json({ message: "Datele produsului sunt invalide." });
    }

    // Verificăm dacă bonul pentru mașina respectivă există
    if (bon.masina === produs.masina) {
      // Dacă bonul pentru mașina respectivă există, continuăm actualizarea produselor
      const existingProduct = bon.produse.find(
        (p) => p.codbara === produs.codbara
      );
      if (existingProduct) {
        existingProduct.cantitate += parseInt(produs.cantitate, 10); // Actualizăm cantitatea
      } else {
        // Dacă produsul nu există, îl adăugăm
        bon.produse.push({
          denumire: produs.denumire,
          cod: produs.cod,
          codbara: produs.codbara || "",
          cantitate: parseInt(produs.cantitate, 10),
          timp: produs.timp,
        });
      }
    } else {
      // Dacă bonul nu există pentru mașina respectivă, creăm unul nou
      bon = {
        id: null, // Așteptăm un ID din counter
        masina: produs.masina,
        produse: [
          {
            denumire: produs.denumire,
            cod: produs.cod,
            codbara: produs.codbara || "",
            cantitate: parseInt(produs.cantitate, 10),
            timp: produs.timp,
          },
        ],
      };
    }

    // 🔹 Actualizăm stocul
    const __filenameStoc = fileURLToPath(import.meta.url);
    const __dirnameStoc = path.dirname(__filenameStoc);
    const filePathStock = path.join(__dirnameStoc, "stoc.js");

    const stockData = await fs.promises.readFile(filePathStock, "utf-8");
    let produseStoc = eval(stockData.replace("export default", "").trim()); // Convertim în obiect

    const productIndex = produseStoc.findIndex(
      (item) => item.codbara === produs.codbara
    );
    if (productIndex !== -1) {
      // Verificăm dacă avem suficient stoc
      const availableQuantity = produseStoc[productIndex].cantitate;
      if (availableQuantity < parseInt(produs.cantitate, 10)) {
        return res.status(400).json({
          message: `Stoc insuficient pentru produsul ${produs.denumire}. Disponibil: ${availableQuantity}.`,
        });
      }

      // Actualizăm stocul
      produseStoc[productIndex].cantitate -= parseInt(produs.cantitate, 10);

      const updatedStock = `const stoc = ${JSON.stringify(
        produseStoc,
        null,
        2
      )};\n\nexport default stoc;`;
      await fs.promises.writeFile(filePathStock, updatedStock);
    } else {
      return res
        .status(400)
        .json({ message: "Produsul nu a fost găsit în stoc." });
    }

    // 🔹 Dacă bonul nu are ID, îi generăm unul nou
    if (!bon.id) {
      const __filenameCounter = fileURLToPath(import.meta.url);
      const __dirnameCounter = path.dirname(__filenameCounter);
      const filePathCounter = path.join(__dirnameCounter, "counter.js");

      // Citim counter-ul și îl actualizăm
      const counterData = await fs.promises.readFile(filePathCounter, "utf-8");
      const counter = eval(counterData.replace("export default", "").trim()); // Convertim în obiect
      counter.bonId += 1;
      bon.id = counter.bonId;

      // Salvăm counter-ul actualizat
      const updatedCounter = `const counter = ${JSON.stringify(
        counter,
        null,
        2
      )};\n\nexport default counter;`;
      await fs.promises.writeFile(filePathCounter, updatedCounter);
    }

    // Salvăm bonul actualizat
    const updatedBon = `const bon = ${JSON.stringify(
      bon,
      null,
      2
    )};\n\nexport default bon;`;
    await fs.promises.writeFile(filePathBon, updatedBon);

    console.log("Bon actualizat:", bon);

    return res.status(200).json({ message: "Produs adăugat cu succes!", bon });
  } catch (error) {
    console.error("Eroare la adăugarea produsului în bon:", error);
    return res
      .status(500)
      .json({ message: "Eroare de server. Te rugăm să încerci din nou." });
  }
});

app.get("/bon", async (req, res) => {
  try {
    const __filenameBon = fileURLToPath(import.meta.url);
    const __dirnameBon = path.dirname(__filenameBon);
    const filePathBon = path.join(__dirnameBon, "bon.js");
    const bonModuleUrl = pathToFileURL(filePathBon).href;

    // Import dinamic cu "cache busting" pentru a evita caching-ul
    const mod = await import(bonModuleUrl + "?update=" + Date.now());

    res.json(mod.default); // Trimite obiectul bon ca JSON
    console.log(mod.default);
  } catch (error) {
    console.error("Eroare la citirea bonului:", error);
    res.status(500).json({ message: "Eroare la obținerea bonului." });
  }
});

app.post("/actualizeazaBon", async (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const filePathBon = path.join(__dirname, "bon.js");

  const bon = req.body;

  const bonData = `const bon = ${JSON.stringify(
    bon,
    null,
    2
  )};\n\nexport default bon;`;
  await fs.promises.writeFile(filePathBon, bonData);

  const __filenameBonuriSalvate = fileURLToPath(import.meta.url);
  const __dirnameBonuriSalvate = path.dirname(__filenameBonuriSalvate);
  const filePathBonuriSalvate = path.join(
    __dirnameBonuriSalvate,
    "bonurisalvate.js"
  );

  const bonGasitBonuriSalvate = bonuriSalvate.find((b) => b.id === bon.id);

  let bonuriSalvateNew = [];

  if (bonGasitBonuriSalvate) {
    // Dacă găsim bonul, îl ștergem din lista bonurilor salvate
    bonuriSalvateNew = bonuriSalvate.filter((b) => b.id !== bon.id);
    console.log("Bonul a fost șters din bonuriSalvate:", bon);
  } else {
    console.log("Bonul nu a fost găsit în bonuriSalvate.");
  }

  const updatedBonuriData = `const bonuriSalvate = ${JSON.stringify(
    bonuriSalvateNew,
    null,
    2
  )};\n\nexport default bonuriSalvate;`;
  await fs.promises.writeFile(filePathBonuriSalvate, updatedBonuriData);

  res.status(200).json({
    message: "Bonul a fost actualizat cu succes si sters din bonuri salvate!",
  });
});

app.get("/bonurisalvate", async (req, res) => {
  try {
    const __filenameBonSalvat = fileURLToPath(import.meta.url);
    const __dirnameBonSalvat = path.dirname(__filenameBonSalvat);
    const filePathBonSalvat = path.join(__dirnameBonSalvat, "bonurisalvate.js");

    // Read bon.js dynamically instead of using import (avoids caching issue)
    const bonData = await fs.promises.readFile(filePathBonSalvat, "utf-8");
    const bonuriSalvate = eval(bonData.replace("export default", "").trim());

    res.json(bonuriSalvate);
  } catch (error) {
    console.error("Error reading bon.js:", error);
    res.status(500).json({ message: "Error fetching bon data." });
  }
});

app.get("/masini", (req, res) => {
  res.send(masini);
});

app.post("/adaugaBonSalvat", async (req, res) => {
  const __filenameBonAdauga = fileURLToPath(import.meta.url);
  const __dirnameBonAdauga = path.dirname(__filenameBonAdauga);
  const filePathBonAdauga = path.join(__dirnameBonAdauga, "bonurisalvate.js");

  const __filenameBon = fileURLToPath(import.meta.url);
  const __dirnameBon = path.dirname(__filenameBon);
  const filePathBon = path.join(__dirnameBon, "bon.js");

  try {
    // Get the bon from the request body
    const bon = req.body;

    const existingBonIndex = bonuriSalvate.findIndex(
      (existing) => existing.id === bon.id && existing.masina === bon.masina
    );

    if (existingBonIndex !== -1) {
      // Dacă bonul există, înlocuim bonul existent cu cel nou
      let bonuriSalvateFaraAsta = bonuriSalvate.filter((b) => b.id !== bon.id);

      bonuriSalvateFaraAsta.push(bon);

      const updatedBonDataDada = `const bonurisalvate = ${JSON.stringify(
        bonuriSalvateFaraAsta,
        null,
        2
      )};\n\nexport default bonurisalvate;`;
      await fs.promises.writeFile(filePathBonAdauga, updatedBonDataDada);
    } else {
      // Dacă bonul nu există, îl adăugăm la listă
      let bonuriSavaltaPula = bonuriSalvate;
      bonuriSavaltaPula.push(bon);
      const updatedBonData = `const bonurisalvate = ${JSON.stringify(
        bonuriSavaltaPula,
        null,
        2
      )};\n\nexport default bonurisalvate;`;
      await fs.promises.writeFile(filePathBonAdauga, updatedBonData);

      console.log("VREAU SA VAD BONURILE SALVATE", bonuriSalvate);
    }

    // Reset the current bon in bon.js to an empty state
    const resetBon = { id: null, masina: null, produse: [] };
    const resetBonData = `const bon = ${JSON.stringify(
      resetBon,
      null,
      2
    )};\n\nexport default bon;`;

    console.log("Bon reset data:", resetBonData);

    await fs.promises.writeFile(filePathBon, resetBonData); // Reset the current bon.js

    res.json({
      message: "Bon salvat cu succes.",
      bon: resetBon, // Send the reset bon back
    });

    console.log("bonul primit de la masina este", bon);
    console.log("BONURILE SALVATE SUNT ", bonuriSalvate);
    console.log("BONURILE FINALIZATE SUNT", bonuriFinalizate);
  } catch (error) {
    console.error("Error saving bon:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

app.post("/adaugaBonFinalizat", async (req, res) => {
  const __filenameBonAdauga = fileURLToPath(import.meta.url);
  const __dirnameBonAdauga = path.dirname(__filenameBonAdauga);
  const filePathBonAdauga = path.join(
    __dirnameBonAdauga,
    "bonurifinalizate.js"
  );
  const filePathBon = path.join(__dirnameBonAdauga, "bon.js");

  try {
    // Get the bon from the request body
    const bon = req.body;

    // Load existing bons from bonurisalvate.js, or initialize an empty array if not found
    bonuriFinalizate.push(bon);

    // Save the updated array of saved bons back to bonurisalvate.js (without `export default`)
    const updatedBonData = `const bonurifinalizate = ${JSON.stringify(
      bonuriFinalizate,
      null,
      2
    )};\n\nexport default bonurifinalizate;`;
    await fs.promises.writeFile(filePathBonAdauga, updatedBonData);

    // Reset the current bon in bon.js to an empty state
    const resetBon = { id: null, masina: null, produse: [] };
    const resetBonData = `const bon = ${JSON.stringify(
      resetBon,
      null,
      2
    )};\n\nexport default bon;`;

    console.log("Bon reset data:", resetBonData);

    await fs.promises.writeFile(filePathBon, resetBonData); // Reset the current bon.js

    const filePathBonuriSalvate = path.join(
      __dirnameBonAdauga,
      "bonurisalvate.js"
    );

    let bonuriSalvateFaraAsta = bonuriSalvate.filter(
      (b) => b.masina !== bon.masina
    );

    const updatedBonSalvateData = `const bonuriSalvate = ${JSON.stringify(
      bonuriSalvateFaraAsta,
      null,
      2
    )};\n\nexport default bonuriSalvate;`;

    await fs.promises.writeFile(filePathBonuriSalvate, updatedBonSalvateData);

    res.json({
      message: "Bon finalizat cu succes.",
      bon: resetBon, // Send the reset bon back
    });

    console.log("bonul primit de la masina este", bon);
    console.log("BONURILE SALVATE SUNT ", bonuriSalvate);
    console.log("BONURILE FINALIZATE SUNT", bonuriFinalizate);
  } catch (error) {
    console.error("Error saving bon:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

app.get("/bonurifinalizate", async (req, res) => {
  try {
    const __filenameBonFinalizat = fileURLToPath(import.meta.url);
    const __dirnameBonFinalziat = path.dirname(__filenameBonFinalizat);
    const filePathBonFinalizat = path.join(
      __dirnameBonFinalziat,
      "bonurifinalizate.js"
    );

    // Read bon.js dynamically instead of using import (avoids caching issue)
    const bonData = await fs.promises.readFile(filePathBonFinalizat, "utf-8");
    const bonuriFinalizate = eval(bonData.replace("export default", "").trim());

    res.json(bonuriFinalizate);
  } catch (error) {
    console.error("Error reading bon.js:", error);
    res.status(500).json({ message: "Error fetching bon data." });
  }
});

app.delete("/bon/:bonId/produs/:cod", async (req, res) => {
  const { bonId, cod } = req.params;

  console.log(bonId);
  console.log(cod);

  const parsedCod = parseInt(cod);

  try {
    // Define file path
    const __filenameBonSalvat = fileURLToPath(import.meta.url);
    const __dirnameBonSalvat = path.dirname(__filenameBonSalvat);
    const filePath = path.join(__dirnameBonSalvat, "bonurisalvate.js");

    // Read the bonurisalvate.js file dynamically
    const bonData = await fs.promises.readFile(filePath, "utf-8");
    let bonuriSalvate = eval(bonData.replace("export default", "").trim()); // Re-load the latest data

    // Find the bon in the array
    const bonIndex = bonuriSalvate.findIndex((b) => b.id === parseInt(bonId));

    if (bonIndex === -1) {
      return res.status(404).json({ message: "Bonul nu a fost găsit." });
    }

    // Get the specific bon
    const bon = bonuriSalvate[bonIndex];

    console.log("Before delete", bon);

    const productToRemove = bon.produse.find((p) => p.cod === parsedCod);

    if (!productToRemove) {
      return res
        .status(404)
        .json({ message: "Produsul nu a fost găsit în bon." });
    }

    // Remove the product from the bon
    bon.produse = bon.produse.filter((p) => p.cod !== parsedCod);

    console.log("After delete", bon);

    const productInStock = produseStoc.find((p) => p.cod === parsedCod);

    productInStock.cantitate += productToRemove.cantitate;

    const updatedStockData = `const stoc = ${JSON.stringify(
      produseStoc,
      null,
      2
    )};\n\nexport default stoc;`;

    const __filenameStoc = fileURLToPath(import.meta.url);
    const __dirnameStoc = path.dirname(__filenameStoc);

    const filePathStock = path.join(__dirnameStoc, "stoc.js");

    await fs.promises.writeFile(filePathStock, updatedStockData);

    if (bon.produse.length === 0) {
      // If the bon has no products left, remove the bon entirely
      bonuriSalvate.splice(bonIndex, 1);
      const carIndex = masini.findIndex((m) => m.numar === bon.masina);

      console.log(carIndex);

      if (carIndex !== -1) {
        // If the car is found, update its disponibilitate to 1 (available)
        masini[carIndex].disponibilitate = 1;

        // Write the updated masini data back to the file
        const updatedMasiniData = `const masini = ${JSON.stringify(
          masini,
          null,
          2
        )};\n\nexport default masini;`;

        try {
          const __filenameMasini = fileURLToPath(import.meta.url);
          const __dirnameMasini = path.dirname(__filenameMasini);

          const filePathMasini = path.join(__dirnameMasini, "masini.js");
          await fs.promises.writeFile(filePathMasini, updatedMasiniData);
          console.log("Masina disponibilitate updated successfully.");
        } catch (error) {
          console.error("Error updating masini file:", error);
        }
      }
    } else {
      // Otherwise, just update the bon
      bonuriSalvate[bonIndex] = bon;
    }

    // Write the updated bonurisalvate data back to the file
    const updatedBonData = `const bonuriSalvate = ${JSON.stringify(
      bonuriSalvate,
      null,
      2
    )};\n\nexport default bonuriSalvate;`;

    // Save the updated data back to the file
    await fs.promises.writeFile(filePath, updatedBonData);

    console.log("After deletion:", bonuriSalvate);

    res.status(200).json({ message: "Produs șters cu succes!" });
  } catch (error) {
    console.error("Eroare la salvarea fișierului:", error);
    res.status(500).json({ message: "Eroare la actualizarea fișierului." });
  }
});

app.delete("/bonCurent/produs/:codbara", async (req, res) => {
  const { codbara } = req.params;

  console.log(codbara);

  try {
    // Define file paths
    const __filenameBonCurent = fileURLToPath(import.meta.url);
    const __dirnameBonCurent = path.dirname(__filenameBonCurent);

    const bonFilePath = path.join(__dirnameBonCurent, "bon.js");
    const stockFilePath = path.join(__dirnameBonCurent, "stoc.js");

    // Citim bon.js
    const bonData = await fs.promises.readFile(bonFilePath, "utf-8");
    let bonCurent = eval(bonData.replace("export default", "").trim()); // bonCurent este deja bonul curent!

    const stockData = await fs.promises.readFile(stockFilePath, "utf-8");
    let produseStoc = eval(stockData.replace("export default", "").trim());

    console.log("Before delete", bonCurent);

    // Găsim produsul de șters
    const productToRemove = bonCurent.produse.find(
      (p) => p.codbara === codbara
    );

    if (!productToRemove) {
      return res
        .status(404)
        .json({ message: "Produsul nu a fost găsit în bon." });
    }

    console.log("Product sters este:", productToRemove);

    let produsStoc = produseStoc.find(
      (p) => p.codbara === productToRemove.codbara
    );

    console.log("Produs stoc pentru sters este:", produsStoc.cantitate);
    console.log("Produs sters cantitate este:", productToRemove.cantitate);

    if (produsStoc) {
      produsStoc.cantitate += productToRemove.cantitate;
    }

    const updatedStock = `const stoc = ${JSON.stringify(
      produseStoc,
      null,
      2
    )};\n\nexport default stoc;`;
    await fs.promises.writeFile(stockFilePath, updatedStock);

    bonCurent.produse = bonCurent.produse.filter((p) => p.codbara !== codbara);
    console.log("After delete", bonCurent);

    if (bonCurent.produse.length === 0) {
      // Dacă bonul nu mai are produse, îl ștergem complet
      const resetBon = { id: null, masina: null, produse: [] };
      const resetBonData = `const bon = ${JSON.stringify(
        resetBon,
        null,
        2
      )};\n\nexport default bon;`;

      await fs.promises.writeFile(bonFilePath, resetBonData);
    } else {
      // Salvăm noul bon.js (fie cu produse noi, fie gol)
      await fs.promises.writeFile(
        bonFilePath,
        `const bon = ${JSON.stringify(
          bonCurent,
          null,
          2
        )};\n\nexport default bon;`
      );
    }

    console.log("After deletion:", bonCurent);
    res.status(200).json({ message: "Produs șters cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizare:", error);
    res.status(500).json({ message: "Eroare la actualizarea fișierului." });
  }
});
app.post("/bonurifinalizatesal", async (req, res) => {
  const { bonId } = req.body;

  const __filenameBonFinalizat = fileURLToPath(import.meta.url);
  const __dirnameBonFinalizat = path.dirname(__filenameBonFinalizat);
  const filePathBonFinalizat = path.join(
    __dirnameBonFinalizat,
    "bonurifinalizate.js"
  );

  const bonIndex = bonuriSalvate.findIndex((b) => b.id === bonId);

  if (bonIndex === -1) {
    return res.status(404).json({ message: "Bonul nu a fost găsit." });
  }

  const bon = bonuriSalvate[bonIndex];

  // Move the bon from bonuriSalvate to bonuriFinalizate
  bonuriFinalizate.push(bon);

  const carIndex = masini.findIndex((m) => m.numar === bon.masina);

  console.log(carIndex);

  if (carIndex !== -1) {
    // If the car is found, update its disponibilitate to 1 (available)
    masini[carIndex].disponibilitate = 1;

    // Write the updated masini data back to the file
    const updatedMasiniData = `const masini = ${JSON.stringify(
      masini,
      null,
      2
    )};\n\nexport default masini;`;

    try {
      const __filenameMasini = fileURLToPath(import.meta.url);
      const __dirnameMasini = path.dirname(__filenameMasini);

      const filePathMasini = path.join(__dirnameMasini, "masini.js");
      await fs.promises.writeFile(filePathMasini, updatedMasiniData);
      console.log("Masina disponibilitate updated successfully.");
    } catch (error) {
      console.error("Error updating masini file:", error);
    }
  }

  bonuriSalvate.splice(bonIndex, 1);

  const updatedBonuriFinalizate = `const bonurifinalizate = ${JSON.stringify(
    bonuriFinalizate,
    null,
    2
  )};\n\nexport default bonurifinalizate;`;

  const updatedBonuriSalvate = `const bonuriSalvate = ${JSON.stringify(
    bonuriSalvate,
    null,
    2
  )};\n\nexport default bonuriSalvate;`;

  try {
    // Write the updated bonuriFinalizate file
    fs.writeFileSync(filePathBonFinalizat, updatedBonuriFinalizate);

    // Also update the bonurisalvate file
    const filePathBonSalvat = path.join(
      __dirnameBonFinalizat,
      "bonurisalvate.js"
    );
    fs.writeFileSync(filePathBonSalvat, updatedBonuriSalvate);

    res.status(200).json({ message: "Bon finalizat și eliminat cu succes!" });
  } catch (error) {
    console.error("Eroare la actualizarea fișierului:", error);
    res.status(500).json({ message: "Eroare la actualizarea fișierului." });
  }
});

app.get("/bonfinalizat/:bonId", (req, res) => {
  const bonId = parseInt(req.params.bonId); // Extract from route parameters

  const bon = bonuriFinalizate.find((bon) => bon.id === bonId);

  if (!bon) {
    return res.status(404).json({ error: "Bon not found" });
  }

  res.json(bon);
});

app.delete("/stergebonsalvate/:bonId", async (req, res) => {
  const bonId = parseInt(req.params.bonId);

  const index = bonuriSalvate.findIndex((bon) => bon.id === bonId);

  if (index === -1) {
    return res.status(404).json({ message: "Bonul nu a fost găsit" });
  }

  const bon = bonuriSalvate[index];

  bon.produse.forEach((produsBon) => {
    let produsStoc = produseStoc.find((p) => p.codbara === produsBon.codbara);
    if (produsStoc) {
      produsStoc.cantitate += produsBon.cantitate;
    }
  });

  const __filenameStoc = fileURLToPath(import.meta.url);
  const __dirnameStoc = path.dirname(__filenameStoc);
  const filePathStock = path.join(__dirnameStoc, "stoc.js");

  const updatedStock = `const stoc = ${JSON.stringify(
    produseStoc,
    null,
    2
  )};\n\nexport default stoc;`;
  await fs.promises.writeFile(filePathStock, updatedStock);

  bonuriSalvate.splice(index, 1);

  const __filenameBonAdauga = fileURLToPath(import.meta.url);
  const __dirnameBonAdauga = path.dirname(__filenameBonAdauga);
  const filePathBonAdauga = path.join(__dirnameBonAdauga, "bonurisalvate.js");

  const updatedBonData = `const bonurisalvate = ${JSON.stringify(
    bonuriSalvate,
    null,
    2
  )};\n\nexport default bonurisalvate;`;
  await fs.promises.writeFile(filePathBonAdauga, updatedBonData);

  res.json("Bon sters cu succes!");
});

app.delete("/stergebonactiv", async (req, res) => {
  try {
    const bon = req.body.bon; // Preia bonul trimis din cerere

    if (!bon || !bon.produse || bon.produse.length === 0) {
      return res
        .status(400)
        .json({ message: "Bonul nu conține produse pentru a fi șters." });
    }

    console.log("bonul ce urmeaza sa fie sters", bon);

    const __filenameStoc = fileURLToPath(import.meta.url);
    const __dirnameStoc = path.dirname(__filenameStoc);
    const filePathStock = path.join(__dirnameStoc, "stoc.js");

    const stockData = await fs.promises.readFile(filePathStock, "utf-8");
    let produseStoc = eval(stockData.replace("export default", "").trim()); // Convertim în obiect

    // Iterează prin fiecare produs din bon și actualizează stocul
    bon.produse.forEach((produsBon) => {
      console.log("Produs bon:", produsBon);

      let produsStoc = produseStoc.find((p) => p.codbara === produsBon.codbara);

      if (produsStoc) {
        console.log("Produs stoc:", produsStoc);
        produsStoc.cantitate += produsBon.cantitate; // Adaugă cantitatea produsului la stoc
        console.log("Produs stoc dupa adagare", produsStoc);
      } else {
        console.log(
          `Produsul cu codul de bare ${produsBon.codbara} nu a fost găsit în stoc.`
        );
      }
    });

    // Actualizează fișierul de stoc

    const updatedStock = `const stoc = ${JSON.stringify(
      produseStoc,
      null,
      2
    )};\n\nexport default stoc;`;
    await fs.promises.writeFile(filePathStock, updatedStock);

    // Resetează bonul activ
    const __filenameBon = fileURLToPath(import.meta.url);
    const __dirnameBon = path.dirname(__filenameBon);
    const filePathBon = path.join(__dirnameBon, "bon.js");

    const resetBon = { id: null, masina: null, produse: [] };
    const resetBonData = `const bon = ${JSON.stringify(
      resetBon,
      null,
      2
    )};\n\nexport default bon;`;

    console.log("Bon resetat:", resetBonData);
    await fs.promises.writeFile(filePathBon, resetBonData); // Resetează bonul activ

    res.json("Bon sters cu succes!");

    console.log("bonul primit de la masina este", bon);
    console.log("BONURILE SALVATE SUNT ", bonuriSalvate);
    console.log("BONURILE FINALIZATE SUNT", bonuriFinalizate);
  } catch (error) {
    console.error("Eroare la ștergerea bonului:", error);
    res.status(500).json({ message: "Eroare la ștergerea bonului." });
  }
});

app.get("/bonuriSalvate/car", async (req, res) => {
  const carnumar = req.query.masina;

  console.log(" NUMAR MASINA", carnumar);

  // Căutăm bonul cu numărul mașinii primit
  const bon = bonuriSalvate.find((bon) => bon.masina === carnumar);

  console.log(" BON GASIT", bon);

  if (!bon) {
    return res.status(404).json({ message: "Bonul nu a fost găsit." });
  }

  const index = bonuriSalvate.findIndex((b) => b.masina === carnumar);

  if (index !== -1) {
    // Dacă bonul există, folosește splice() pentru a-l elimina
    bonuriSalvate.splice(index, 1);
  }

  // Filtrăm bonurile pentru a elimina bonul cu numărul mașinii dat

  // Salvăm lista actualizată în fișierul bonurisalvate.js
  const updatedBonSalvateData = `const bonurisalvate = ${JSON.stringify(
    bonuriSalvate,
    null,
    2
  )};\n\nexport default bonurisalvate;`;

  try {
    // Scriem fișierul actualizat
    const __filenameBonAdauga = fileURLToPath(import.meta.url);
    const __dirnameBonAdauga = path.dirname(__filenameBonAdauga);
    const filePathBonuriSalvate = path.join(
      __dirnameBonAdauga,
      "bonurisalvate.js"
    );

    await fs.promises.writeFile(filePathBonuriSalvate, updatedBonSalvateData);

    console.log(" BONURI SALVATE DUPA CE ACTUALIZAM FISIERUL", bonuriSalvate);

    const updatedBonData = `const bon = ${JSON.stringify(
      bon,
      null,
      2
    )};\n\nexport default bon;`;
    const filePathBon = path.join(__dirnameBonAdauga, "bon.js");

    await fs.promises.writeFile(filePathBon, updatedBonData);

    // Trimitem răspunsul cu bonul șters
    res.json({
      message: "Bon șters cu succes.",
      bon: bon,
    });

    console.log("Bonul șters este:", bon);
    console.log("BONURILE SALVATE SUNT", bonuriSalvate);
  } catch (error) {
    console.error("Eroare la ștergerea bonului:", error);
    res.status(500).json({ message: "Eroare la server. Încearcă din nou." });
  }
});

app.delete("/stergeBonuri", async (req, res) => {
  const { id, masina } = req.body;

  try {
    // Găsește bonurile care au același ID și mașină
    const bonuriDeSters = bonuriSalvate.filter(
      (bon) => bon.id === id && bon.masina === masina
    );

    console.log(bonuriDeSters.length);

    if (bonuriDeSters.length === 0) {
      return res
        .status(200)
        .json({ message: "Nu au fost găsite bonuri cu acest ID și mașină." });
    }

    // Șterge bonurile respective din lista
    const bonuriSalvateActualizate = bonuriSalvate.filter(
      (bon) => bon.id !== id || bon.masina !== masina
    );
    // Actualizează fișierul de bonuri salvate
    const __filenameBonAdauga = fileURLToPath(import.meta.url);
    const __dirnameBonAdauga = path.dirname(__filenameBonAdauga);
    const filePathBonAdauga = path.join(__dirnameBonAdauga, "bonurisalvate.js");

    const updatedBonData = `const bonurisalvate = ${JSON.stringify(
      bonuriSalvateActualizate,
      null,
      2
    )};\n\nexport default bonurisalvate;`;

    await fs.promises.writeFile(filePathBonAdauga, updatedBonData);

    res.status(200).json({ message: "Bonurile au fost șterse cu succes." });
  } catch (error) {
    console.error("Eroare la ștergerea bonurilor:", error);
    res
      .status(500)
      .json({ message: "A apărut o eroare la ștergerea bonurilor." });
  }
});

app.get("/bonurigestionate", async (req, res) => {
  const bonurigestionate = [...bonuriFinalizate, ...bonuriSalvate];

  const __filenameBonuriGestionate = fileURLToPath(import.meta.url);
  const __dirnameBonuriGestionate = path.dirname(__filenameBonuriGestionate);
  const bonuriGestionateFilePath = path.join(
    __dirnameBonuriGestionate,
    "bonurigestionate.js"
  );

  const updatedBonuriGestionate = `const bonurigestionate = ${JSON.stringify(
    bonurigestionate,
    null,
    2
  )};\n\nexport default bonurigestionate;`;
  await fs.promises.writeFile(
    bonuriGestionateFilePath,
    updatedBonuriGestionate
  );

  res
    .status(200)
    .json({ message: "Bonuri gestionate luate", bonurigestionate });
});

app.get("/bongestionat/:bonId", (req, res) => {
  const bonId = parseInt(req.params.bonId); // Extract from route parameters

  const bon = bonurigestionate.find((bon) => bon.id === bonId);

  if (!bon) {
    return res.status(404).json({ error: "Bon not found" });
  }

  res.json(bon);
});

app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
