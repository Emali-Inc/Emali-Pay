"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

//this are server action
export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = cookies().get("emali-appwrite-session");
    //check if session exist
  if (!session || !session.value) {
    throw new Error("No session");
  }

  //otherwise attatch this sesion to client
  client.setSession(session.value);

  //to access the session we use the return keyword and extract it
  return {
    get account() {
      return new Account(client);
    },
  };
}

//Providing the key will enable admin client access all functionality and perform all CRUD operation
export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },

    get database() {
        return new Databases(client)
    },

    get user() {
        return new Users(client)
    },

  };
}


export async function getLoggedInUser() {
    try {
      const { account } = await createSessionClient();
      return await account.get();
    } catch (error) {
      return null;
    }
  }
  