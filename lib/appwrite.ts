"use server";

import { Account,  Client,   Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

// Initialize session client
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = cookies().get("emali-appwrite-session");

  console.log("createSessionClient - session:", session);

  if (!session || !session.value) {
    console.error("No session found in cookies");
    throw new Error("No session found");
  }

  client.setSession(session.value);
  console.log("Session token set:", session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

// Initialize admin client
export async function createAdminClient() {
  console.log("Initializing Admin Client with endpoint:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
  console.log("Project ID:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT);
  
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      console.log("Get User:",this.account)
      return new Users(client);
    }
  };
}

// Example usage of the session client to fetch user account details
export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    console.log("Logged in user account details:", user);
    return user;
  } catch (error) {
    console.error('Error getting logged in user:', error);
    throw error;
  }
}

// Example usage of the admin client to fetch user details
export async function getAdminUserDetails(userId: string) {
  try {
    const { user } = await createAdminClient();
    const userDetails = await user.get(userId);
    console.log("Admin user details:", userDetails);
    return userDetails;
  } catch (error) {
    console.error('Error getting admin user details:', error);
    throw error;
  }
}
