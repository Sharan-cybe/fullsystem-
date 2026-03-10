const API_URL = "http://127.0.0.1:8000";

export const verifyInterview = async (formData) => {

  const response = await fetch(`${API_URL}/verify-interview`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();

  return data;
};