// import { getApps, initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

// //ALPHA
// //var config = {
// //apiKey: "AIzaSyACrHn7T_1Ie0ts-srD-QrBvz5-xx1zmmI",
// //authDomain: "below2-alpha.firebaseapp.com",
// //projectId: "below2-alpha",
// //storageBucket: "below2-alpha.appspot.com",
// //messagingSenderId: "127126958309",
// //appId: "1:127126958309:web:e26803c623ca8d1239a40c",
// //measurementId: "G-QDD0EMWEC5"
// //};

// //BETA
// const config = {
//   apiKey: "AIzaSyAIyijYXq6bZZE7-Cx0ScrBE3BCALsczQk",
//   authDomain: "below2-beta.firebaseapp.com",
//   projectId: "below2-beta",
//   storageBucket: "below2-beta.appspot.com",
//   messagingSenderId: "905749821261",
//   appId: "1:905749821261:web:fe38147ca9ba778cd62904",
//   measurementId: "G-3JLE8DYT2Y"
// };

// //MASTER
// // var config = {
// //   apiKey: "AIzaSyCHhGbJL-4BKYkkooXKg9EPgtBBVSD0Lr0",
// //   authDomain: "below2-live.firebaseapp.com",
// //   projectId: "below2-live",
// //   storageBucket: "below2-live.appspot.com",
// //   messagingSenderId: "527338637886",
// //   appId: "1:527338637886:web:ada1e502c0c8f56691df6f",
// //   measurementId: "G-50SFWGNSBL"
// // };

// //MASTER
// //  var config = {
// //    apiKey: "AIzaSyCHhGbJL-4BKYkkooXKg9EPgtBBVSD0Lr0",
// //    authDomain: "below2-live.firebaseapp.com",
// //    projectId: "below2-live",
// //    storageBucket: "below2-live.appspot.com",
// //    messagingSenderId: "527338637886",
// //    appId: "1:527338637886:web:ada1e502c0c8f56691df6f",
// //    measurementId: "G-50SFWGNSBL"
// //  };

// // const firebase = initializeApp(config);
// const firebase = !getApps().length ? initializeApp(config) : getApps()[0];
// const auth = getAuth(firebase);
// const firestore = getFirestore(firebase);
// // export { auth, firebase, firestore };
// // export { auth, firebase, firestore, RecaptchaVerifier, signInWithPhoneNumber };

// export default firebase
