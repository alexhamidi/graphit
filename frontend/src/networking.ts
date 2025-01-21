import axios from "axios";

import { BASE_BACKEND_URL } from "./constants";



export async function post(endpoint: string, data: any) {
  try {
    const fullUrl: string = BASE_BACKEND_URL + endpoint;
    const response = await axios.post(fullUrl, data);
    return response;
  } catch (e) {
    throw e;
  }
}

export async function streamPost(endpoint: string, data: any) {
  try {
    const fullUrl: string = BASE_BACKEND_URL + endpoint;
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    return reader;

  } catch (e) {
    throw e;
  }
}



export async function authorizedFetch(endpoint: string, token: string) {
  try {
    const fullUrl: string = BASE_BACKEND_URL + endpoint;
    const response = await axios.get(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (e) {
    throw e;
  }
}

export async function authorizedPost(
  endpoint: string,
  data: any,
  token: string,
) {
  try {
    const fullUrl: string = BASE_BACKEND_URL + endpoint;
    const response = await axios.post(fullUrl, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (e) {
    throw e;
  }
}
