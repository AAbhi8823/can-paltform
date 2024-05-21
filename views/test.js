const { name } = require("ejs")

let array=[1,0,0,1,1,0,1,0,1,0]
let x=2
 
newArr=[1,0,0,1,1,1,0,1,0,0]


cars:{
    name,
    model
    car_numbers,
    car_details
}

user_model:{
  name,
  email/Mobile,
  password,
  car{
    ref:"cars"
    type: Object
  }
}

pparking_area:{
    user_id,
    car_id,
    time_slots:
    enum;["1 :2 HRS"],
    entry_gate_number:String,
    exit_gate_number: String

    price:Number
}


//stpes 

