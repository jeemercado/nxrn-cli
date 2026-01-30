/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { HttpStatusCode } from 'axios';

export function isNetworkError(error: any) {
  return axios.isAxiosError(error) && !error.response;
}

export function isUnauthorizedError(error: any) {
  return axios.isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized;
}
