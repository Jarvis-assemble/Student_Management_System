const express = require('express');
const path = require('path');
const Joi=require('joi');
const multer = require('multer');
const app = express();

const upload=multer();
//parse json bodies
app.use(express.json())
///chumma

const schema=Joi.object(
    {
        name: Joi.string().min(3).max(30).required(),
        gender: Joi.string().valid('male', 'female').required(),
        dept: Joi.string().valid('ECE', 'CSE', 'IT', 'EEE', 'ME', 'CE').required(),
        email: Joi.string().email().required(),
        telNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
        cutoff: Joi.number().min(0).max(100).required(),
        bday: Joi.date().min('2000-01-01').max('2005-12-31').required(),
        inputAddress: Joi.string().min(5).required(),
        inputCity: Joi.string().required(),
        inputState: Joi.string().required(),
        inputZip: Joi.string().required()
   // avatar: Joi.string().required()
       
        
    }
)

// Middleware for validation
const validateRequestBody = (req, res, next) => {

   // console.log(req.body)
  const { error } = schema.validate(req.body, { abortEarly: false }); //abort Early false in order to note all errors

  if (error) {
    // Extract all validation error messages
    const errorMessages = error.details.map(detail => detail.message);

    // Print the error details to the console for reference
    console.log(error.details);

    // Return all validation error messages
    return res.status(400).json({ errors: errorMessages });
  }
  
  next();
};

/*
 If validation fails, it responds with a 400 status and the validation error message. If validation succeeds, it calls next() to proceed to the route handler.
*/

app.post('/submit', upload.none(), validateRequestBody, (req, res) => {
    console.log(req.body)
    res.status(200).json({ message: 'Request is valid', data: req.body, createdAt: new Date() });
  });

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Homepage.html');
  });

app.listen(port=3000, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
    } else {
      console.log(`port ${port} is listening very keenly`);
    }
  });

/*
{"message":"Request is valid","data":{"name":"Jaithri","gender":"female","dept":"ECE","email":"jaithri21@gmail.com","telNo":"9874563210","cutoff":"75","bday":"2005-12-06","inputAddress":"abc","inputCity":"de","inputState":"fgh","inputZip":"600034"},"createdAt":"2024-07-03T19:47:41.456Z"}

*/