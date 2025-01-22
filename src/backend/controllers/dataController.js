import axios from "axios";

export const getTestData = (req, res) => {
    const testData = {
      message: "This is a test message from the data controller."
    };
    return res.status(200).json(testData);
  };


export const getExchangeRates = async (req, res) => {
  try {
    const { table = "C" } = req.query;
    const url = `https://api.nbp.pl/api/exchangerates/tables/${table}/`;
    
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Błąd podczas pobierania kursów walut:", error.message);
    res.status(500).json({
      message: "Nie udało się pobrać kursów walut.",
      error: error.message,
    });
  }
};

export const getCurrencyHistory = async (req, res) => {
  try {
    const { currencyCode } = req.params;
    const { lastDays = 10 } = req.query;

    const url = `https://api.nbp.pl/api/exchangerates/rates/c/${currencyCode}/last/${lastDays}/?format=json`;
    console.log(url);
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Błąd podczas pobierania historii kursu waluty:", error.message);
    res.status(500).json({
      message: "Nie udało się pobrać historii kursu waluty.",
      error: error.message,
    });
  }
};

