import axios from "axios";

// Pobieranie kursów walut
export const getExchangeRates = async (req, res) => {
  try {
    const { table = "C" } = req.query;
    const url = `https://api.nbp.pl/api/exchangerates/tables/${table}/`;

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        message: "Nie znaleziono kursów walut.",
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Błąd podczas pobierania kursów walut:", error.message);
    return res.status(500).json({
      message: "Nie udało się pobrać kursów walut.",
      error: error.message,
    });
  }
};

// Pobieranie historii kursu waluty
export const getCurrencyHistory = async (req, res) => {
  try {
    const { currencyCode } = req.params;
    const { lastDays = 10 } = req.query;

    if (!currencyCode) {
      return res.status(400).json({
        message: "Kod waluty jest wymagany.",
      });
    }

    const url = `https://api.nbp.pl/api/exchangerates/rates/c/${currencyCode}/last/${lastDays}/?format=json`;

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        message: `Nie znaleziono historii dla waluty: ${currencyCode}`,
      });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Błąd podczas pobierania historii kursu waluty:", error.message);
    return res.status(500).json({
      message: "Nie udało się pobrać historii kursu waluty.",
      error: error.message,
    });
  }
};
