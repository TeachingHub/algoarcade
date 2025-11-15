import { HttpError } from "../errors/HttpError";

function GET(url: string, body: any, headers = {}) {
    fetch(url)
}

async function POST(url: string, body: any, headers = {}) {
    const options: RequestInit = {
        method: "POST",
        headers: headers
    }
    
    const isFormData = body instanceof URLSearchParams || body instanceof FormData;
    if (isFormData) {
        options.body = body;
    } else {
        options.body = JSON.stringify(body);
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
        }
    }

    const response = await fetch(url, options);

    const data = await response.json();
    if (!response.ok) {
        throw new HttpError(response.status, data.error.message || response.statusText);
    }
    return data;
}

export const httpService = { GET, POST };