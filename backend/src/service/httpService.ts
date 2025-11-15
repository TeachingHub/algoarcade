import { HttpError } from "../errors/HttpError";

function GET(url: string, body: any, headers = {}) {
    fetch(url)
}

async function POST(url: string, body: any, headers = {}) {

    const response = await fetch(url,
        {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                ...(headers || {})
            }
        })

    const data = await response.json()
    if (!response.ok){
        throw new HttpError(response.status, data.error.message || response.statusText )
    }
    return data
}

export const httpService = { GET, POST };