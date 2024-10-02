/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'
import omit from "lodash/omit";

const isNIN = (q: string) => q.toLowerCase().startsWith("cm") || q.toLowerCase().startsWith("cf")
const isTIN = (q: string) => q.length === 10
const isBUSINESS = (q: string) => q.length >= 14

export async function query(q: string) {
  if (isNIN(q)) return eemis(q, 'nin')
  if (isTIN(q)) return eemis(q, 'tin')
  if (isBUSINESS(q)) return eemis(q, 'ursb')
}

export async function eemis(q: string, paramName: string) {
  const url = `https://eemis.mglsd.go.ug/api_route?${paramName}=${q}`;

  try {
    // Perform the GET request
    const response = await fetch(url, { cache: "force-cache" });

    // Check if the response is not okay (status code not in the range 200-299)
    if (!response.ok) {
      throw new Error(`Network response was not ok. Status: ${response.status}`);
    }

    // Parse the JSON response
    const data = await response.json();

    // Send the data back as JSON
    return omit(data, ["transactionStatus"])
  } catch (error: any) {
    console.log(error.message)

    return {
      message: "Failed query data"
    }
  }
}

