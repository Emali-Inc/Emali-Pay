'use server';


import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";



const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  
} = process.env;

export const getUserInfo = async ({ userId }:getUserInfoProps) => {
  try {
    console.log("getUserInfo called with userId:", userId);

    const { database } = await createAdminClient();
    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );

    if (user.documents.length === 0) {
      console.error("No user found with userId:", userId);
      throw new Error('User not found');
    }

    console.log("User documents retrieved:", user.documents[0]);
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.error('Error getting user info:', error);
    return null; // Return null explicitly if user is not found
  }
};

export const signIn = async ({ email, password }: signInProps) => {
  try {
    console.log("SignIn function called with email:", email);

    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);
    console.log("Session created:", session);

    cookies().set('emali-appwrite-session', session.$id, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId });
    console.log("User info retrieved:", user);

    if (!user) {
      throw new Error("User not found or error retrieving user info");
    }

    return parseStringify(user);
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;

  try {
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    if (!newUserAccount) throw new Error('Error creating user');

    const session = await account.createEmailPasswordSession(email, password);
    console.log("Session created:", session);

    cookies().set("emali-appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
    console.log("New user created or not created",newUserAccount)
    return parseStringify(newUserAccount); 
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};


export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    console.log("Get account:", account);

    const result = await account.get();
    console.log("Logged in user account details:", result);

    const user = await getUserInfo({ userId: result.$id });
    console.log('User info is:', user);

    return parseStringify(user);
  } catch (error) {
    console.error('Error getting logged in user:', error);
    return null;
  }
}


  //initilization logoutAccount functions
export async function logoutAccount() {
    try {
      const { account } = await createSessionClient();
      cookies().delete('emali-appwrite-session');

      await account.deleteSession('current');
    } catch (error) {
      return null;
    }
  }