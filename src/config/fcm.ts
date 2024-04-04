import * as admin from "firebase-admin";
import serviceAccount from "../../firebase-key.json";

export const firebaseConfig = () => {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
  });
}