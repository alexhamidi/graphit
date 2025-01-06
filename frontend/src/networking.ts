import axios from "axios";

import { BASE_BACKEND_URL } from "./constants";

export async function fetch(endpoint: string) {
  try {
    const fullUrl: string = BASE_BACKEND_URL + endpoint;
    const response = await axios.get(fullUrl);
    return response;
  } catch (e) {
    throw e;
  }
}

export async function post(endpoint: string, data: any) {
  try {
    const fullUrl: string = BASE_BACKEND_URL + endpoint;
    const response = await axios.post(fullUrl, data);
    return response;
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
