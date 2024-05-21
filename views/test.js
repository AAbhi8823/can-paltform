//"use strict"
// a=10
// console.log(a)
// let a


let promise =new Promise((resolve,reject)=>{
    console.log("I am syncronous code")
   setTimeout(()=>{
     console.log("I am asyncronous code")
   },2000);
  })
  
  promise.then((res)=>{
    console.log(res)
  }).catch((err)=>{
    console.log(err)
  })