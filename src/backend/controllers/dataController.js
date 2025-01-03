export const getTestData = (req, res) => {
    const testData = {
      message: "This is a test message from the data controller."
    };
    
    return res.status(200).json(testData);
  };
  