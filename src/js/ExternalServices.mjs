const baseURL = import.meta.env.VITE_SERVER_URL;

async function convertToJson(res) {
  try {
    const data = await res.json();
    if (!res.ok) {
      // Create a custom error with more details
      const error = new Error(data.message || 'Request error');
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  } catch (error) {
    // If there's an error parsing JSON or any other error
    if (error.name === 'SyntaxError') {
      const parseError = new Error('Error processing server response');
      parseError.status = res.status;
      parseError.originalError = error;
      throw parseError;
    }
    // Relanzar el error si ya es un error personalizado
    throw error;
  }
}

export default class ExternalServices {
  constructor() {
  }
  async getData(category) {
    const response = await fetch(`${baseURL}products/search/${category} `);
    const data = await convertToJson(response);
    return data.Result;
  }
  async findProductById(id) {
    const response = await fetch(`${baseURL}product/${id}`);
    const details = await convertToJson(response);
    //console.log(details.Result);
    return details.Result;
  }
  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };
    return await fetch(`${baseURL}checkout/`, options).then(convertToJson);
  }
}
