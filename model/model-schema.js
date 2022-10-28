let mongoose=require("mongoose");
let Schema=mongoose.Schema;

const signInSchema=new Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true}
})

let signInModel=mongoose.model("signin",signInSchema)

module.exports=signInModel