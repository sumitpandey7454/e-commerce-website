express = require('express');
mongoose = require('mongoose');
app = express();
 mongoose.connect('mongodb://0.0.0.0:27017/quantum');
console.log("Connected");
stdSchema = mongoose.Schema({
	FirstName: String,
	ProductName: String,
	Address: String
})
stdModel = mongoose.model("users",stdSchema);


app.get("/ins-data",function(req,res){
	res.sendFile(__dirname+"/buynow.html");
});
 app.get("/submit-data",function(req,res){
 	f_name = req.query.firstName;
 	l_name = req.query.productName;
 	r_no = req.query.enterAddress;
 	
 	obj = {FirstName:f_name,ProductName:l_name,Address:r_no};
 	d = new stdModel(obj);
 	d.save();
 	res.send("Order Placed Successfully");
 });
 app.get("/show-data",function(req,res){
 	stdModel.find((err,data)=>{
 		res.send(data);
 		res.end();
 	})
 })
 app.listen(4200);