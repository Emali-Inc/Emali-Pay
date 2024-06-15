"use server";

import { Account, Client, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";



// Initialize session client
export async function createSessionClient() {
  try {
    // Create a new Appwrite client
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
    
    // Retrieve session token from cookie
    const session = cookies().get("emali-appwrite-session");
    console.log("Get Cookies:",session)

    // Check if session token exists
    if (!session || !session.value) {
      throw new Error("No session found in cookies");
    }

    // Extract session token value
    const sessionToken = session.value;

    // Validate the session token format (must be a JWT with 3 segments)
    //if (!isValidSessionToken(sessionToken)) {
     // throw new Error("Invalid session token format");
   // }

    // Set session token for the client
    client.setSession(sessionToken);

    // Return the session client with the associated account
    return {
      account: new Account(client),
    };
  } catch (error) {
    console.error('Error creating session client:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}


// Function to validate session token format
//function isValidSessionToken(token: string): boolean {
  //return token.split('.').length === 3;
//}

// Initialize admin client
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    account: new Account(client),
    database: new Databases(client),
    users: new Users(client),
  };
}
