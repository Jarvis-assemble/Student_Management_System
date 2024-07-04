const express = require('express');
const path = require('path');
const Joi=require('joi');
const multer = require('multer');
const fspr = require('fs').promises;
const bodyParser = require('body-parser');
const dBFile = path.join(__dirname, '..','database/student_data.csv');
const imagesPath = path.join(__dirname, '..','database/images');
const imgrouter = require(path.join(__dirname, '..','database/imageroute'));
const app = express();
const { v4: uuidv4 } = require('uuid');

// const upload=multer();
//parse json bodies
app.use(express.json())
///chumma


app.use(bodyParser.urlencoded({ extended: true }));
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
        inputZip: Joi.string().required(),
        avatar: Joi.any().required().messages({
      'any.required': 'Please upload a passport picture'
    })
       
        
    }
)

const jpgFileFilter = async (req, file, cb) => {
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

var id =1
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },
  filename: async (req, file, cb) => {
    // const val = await getStudentID();
    const uuid = uuidv4();

  // Example formatting for student ID
  const studentId = `ST-${uuid.replace(/-/g, '').slice(0, 10)}`; // Example format: ST-123e4567e89
    console.log(studentId)
     req.studentID = studentId;
    // req.month = val.month;
    console.log(id)
    req.avatarPath = req.studentID + path.extname(file.originalname);
    
    cb(null, req.avatarPath);
  },
});
const upload = multer({ storage: storage, fileFilter: jpgFileFilter });
app.use(imgrouter)


async function convertCsvToJson() {
  try {
    const inputCsv = await fspr.readFile(dBFile, 'utf-8');
    const studentArray = [];
    const lines = inputCsv.split('\n');
    let lineCount = lines.length;
    if (lines != '') {
      for (const line of lines) {
        const [studentID, name, gender, dept,email, telNo,cutoff, bday,inputAddress,inputCity,inputState, inputZip,avatarPath] = line.split(',');
        if (name !== undefined) {
          const student = {
            id: studentID,
            name: name,
            gender: gender,
            dept:dept,
            email: email,
            telNo: telNo,
            cutoff:cutoff,
            bday: bday,
            inputAddress: inputAddress,
            inputCity: inputCity,
            inputState: inputState,
            inputZip:inputZip,
            avatarPath: avatarPath
           
          };
          studentArray.push(student);
        }
      }
    }
    return { studentArray, lineCount };
  } catch (error) {
    console.log('Error:', error);
  }
}
// Middleware for validation
const validateRequestBody = (req, res, next) => {

   // console.log(req.body)
  const { error } = schema.validate(req.body, 
    {
      abortEarly: false,
      errors: {
        label: 'key',
        wrap: {
          label: false
        }
      }
    }
  ); //abort Early false in order to note all errors
   
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

app.post('/submit', upload.single('avatar'), async (req, res) => {
    console.log(req.body)
    // res.status(200).json({ message: 'Request is valid', data: req.body, createdAt: new Date() });
    const { name, gender,dept, email, telNo,cutoff, bday,inputAddress,inputCity,inputState, inputZip} = req.body;
    if (!req.file) {
      res.status(400).json({ error: 'Image not found' });
    }
  const avatar = req.file.path; 
  try {
    await schema.validateAsync({ name, gender, dept,email, telNo,cutoff, bday,inputAddress,inputCity,inputState, inputZip, avatar });
  } catch (err) {
    return res.status(400).json({ error:err.message });

  }
  const { studentArray } = await convertCsvToJson();
    if (studentArray.some(student => student.email === email || student.telNo === telNo)) {
      fspr.unlink(avatar);
      // Remove uploaded file if email or telNo is not unique
      id = id-1
      res.status(400).json({ error: 'Email or telephone number already exists' });
    }
  
    // Append new student data to CSV file
    const newStudent = `${req.studentID},${name},${gender},${dept},${email},${telNo},${cutoff},${bday},${inputAddress},${inputCity},${inputState},${inputZip},${req.avatarPath}\n`;
    await fspr.appendFile(dBFile, newStudent);
    res.sendFile(__dirname + '/table.html');
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Homepage.html');
});
  
app.get('/students/', async (req, res) => {
  const searchTerm = req.query;
  const { studentArray } = await convertCsvToJson(dBFile);
  if (
    (searchTerm.id == undefined || searchTerm.id === '') &&
    (searchTerm.email === undefined || searchTerm.email === '')
  ) {
    res.json(studentArray);
  } else {
    const newarr = studentArray.filter((student) => {
      return student.id === searchTerm.id || student.email === searchTerm.email;
    });
    res.json(newarr);
  }
});


app.get('/student/', async (req, res) => {
  res.sendFile(__dirname + '/table.html');
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