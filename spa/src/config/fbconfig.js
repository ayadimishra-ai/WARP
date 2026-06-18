import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

//ALPHA
//var config = {
//apiKey: "AIzaSyACrHn7T_1Ie0ts-srD-QrBvz5-xx1zmmI",
//authDomain: "below2-alpha.firebaseapp.com",
//projectId: "below2-alpha",
//storageBucket: "below2-alpha.appspot.com",
//messagingSenderId: "127126958309",
//appId: "1:127126958309:web:e26803c623ca8d1239a40c",
//measurementId: "G-QDD0EMWEC5"
//};

//BETA
var config = {
  apiKey: "AIzaSyAIyijYXq6bZZE7-Cx0ScrBE3BCALsczQk",
  authDomain: "below2-beta.firebaseapp.com",
  projectId: "below2-beta",
  storageBucket: "below2-beta.appspot.com",
  messagingSenderId: "905749821261",
  appId: "1:905749821261:web:fe38147ca9ba778cd62904",
  measurementId: "G-3JLE8DYT2Y"
};

//MASTER
// var config = {
//   apiKey: "AIzaSyCHhGbJL-4BKYkkooXKg9EPgtBBVSD0Lr0",
//   authDomain: "below2-live.firebaseapp.com",
//   projectId: "below2-live",
//   storageBucket: "below2-live.appspot.com",
//   messagingSenderId: "527338637886",
//   appId: "1:527338637886:web:ada1e502c0c8f56691df6f",
//   measurementId: "G-50SFWGNSBL"
// };

//MASTER
 //var config = {
 //  apiKey: "AIzaSyCHhGbJL-4BKYkkooXKg9EPgtBBVSD0Lr0",
 //  authDomain: "below2-live.firebaseapp.com",
 //  projectId: "below2-live",
 //  storageBucket: "below2-live.appspot.com",
 //  messagingSenderId: "527338637886",
 //  appId: "1:527338637886:web:ada1e502c0c8f56691df6f",
 //  measurementId: "G-50SFWGNSBL"
 //};

// //DEMO
// var config = {
//     apiKey: "AIzaSyDtD1O-sXGyvh931PjGTv7h8xsVFlYy9mQ",
//     authDomain: "below2-demo.firebaseapp.com",
//     projectId: "below2-demo",
//     storageBucket: "below2-demo.appspot.com",
//     messagingSenderId: "54734687583",
//     appId: "1:54734687583:web:af15d296dc7bd3506cbaea",
//     measurementId: "G-LTFZCGS48P"
// };

//Demo New
var config = {
    apiKey: "AIzaSyDjCKi4ZeahhoizLSp7QIm2Hw0a9gSgF78",
    authDomain: "below2-demo-new.firebaseapp.com",
    projectId: "below2-demo-new",
    storageBucket: "below2-demo-new.appspot.com",
    messagingSenderId: "305201865925",
    appId: "1:305201865925:web:33c211445b2b440ec9fcac",
    measurementId: "G-VFY1LYJBBC"
};
firebase.initializeApp(config);
firebase.firestore().settings({timestampsInSnapshots:true});

export default firebase;


