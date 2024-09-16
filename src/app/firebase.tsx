import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBWFlC65_-_6-svCUwTRvFXFwmqJJn2D-w",

  authDomain: "nextgen-converter-f80dd.firebaseapp.com",

  projectId: "nextgen-converter-f80dd",

  storageBucket: "nextgen-converter-f80dd.appspot.com",

  messagingSenderId: "395071741649",

  appId: "1:395071741649:web:b51adbd11caf6c8097aff0",

  measurementId: "G-WXCKLWT72R"

};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

