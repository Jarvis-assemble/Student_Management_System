const express = require('express');
const path = require('path');
const cors = require('cors');
const Joi=require('joi');
const multer = require('multer');
const readline = require("readline")
const fspr = require('fs').promises;
const bodyParser = require('body-parser');
const dBFile = path.join(__dirname,'database/student_data.csv');
const imagesPath = path.join(__dirname,'database/images');
const imgrouter = require(path.join(__dirname,'imageroute'));
const app = express();
const csv = require('csv-parser');

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname)));

app.use(express.json())

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
const schema=Joi.object(
    {
        name: Joi.string().min(3).max(30).regex(/^[A-Za-z]+$/).required().messages({
          'string.pattern.base': 'Name must contain only alphabets.'}),
        gender: Joi.string().valid('male', 'female').required(),
        dept: Joi.string().valid('ECE', 'CSE', 'IT', 'EEE', 'ME', 'CE').required(),
        email: Joi.string().email().required(),
        telNo: Joi.string().pattern(/^[0-9]{10}$/).required(),
        cutoff: Joi.number().min(0).max(100).required(),
        bday: Joi.date().min('2000-01-01').max('2005-12-31').required(),
        inputAddress: Joi.string().min(5).required(),
        inputCity: Joi.string().required(),
        inputState: Joi.string().required(),
        inputZip: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
          'string.pattern.base': `"inputZip" should be a 6-digit number`,
          'string.empty': `"inputZip" cannot be an empty field`,
          'any.required': `"inputZip" is a required field`
        }),
    }
)

const jpgFileFilter = async (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error('Invalid file type');
      error.code = 'INVALID_FILE_TYPE';
      return cb(error);
    }
  else {
    cb(null, true);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesPath);
  },

  filename: async (req, file, cb) => {
  
    const uuid = uuidv4();

  // student ID
  const studentId = `${uuid.replace(/-/g, '').slice(0, 10)}`; // Example format: ST-123e4567e89
    console.log(studentId)
    req.studentID = studentId;
 
    req.avatarPath = req.studentID + path.extname(file.originalname);
    
    cb(null, req.avatarPath);
  },
});

const upload = multer(
  { storage: storage, 
    fileFilter: jpgFileFilter,
    limits: { fileSize: 100000}
  }).single('avatar');

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


const validateRequestBody = (req, res, next) => {

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

    return res.status(400).json({ errors: errorMessages });
  }
  
  next();
};


// If validation fails, it responds with a 400 status and the validation error message. If validation succeeds, it calls next() to proceed to the route handler.

const uploadMiddleware = (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 100KB limit' });
      }
    }
    next();
  });
};

app.post('/submit', uploadMiddleware, validateRequestBody,async (req, res) => {

    const { name, gender,dept, email, telNo,cutoff, bday,inputAddress,inputCity,inputState, inputZip} = req.body;

    const avatar = req.file.path; 

    const { studentArray } = await convertCsvToJson();

    const emailSet = new Set();
    const telNoSet = new Set();
    
    let isEmailDuplicate = false;
    let isTelNoDuplicate = false;
    
    for (const student of studentArray) {
      if (student.email === email) {
        isEmailDuplicate = true;
      }
      if (student.telNo === telNo) {
        isTelNoDuplicate = true;
      }
      emailSet.add(student.email);
      telNoSet.add(student.telNo);
    }
    
    if (isEmailDuplicate || isTelNoDuplicate) {
      fspr.unlink(avatar); 
      if (isEmailDuplicate && isTelNoDuplicate) {
        return res.status(400).json({ error: 'Email and telephone number already exist' });
      } else if (isEmailDuplicate) {
        return res.status(400).json({ error: 'Email already exists' });
      } else if (isTelNoDuplicate) {
        return res.status(400).json({ error: 'TelNo already exists' });
      }
    }
    
    // Append new student data to CSV file
    const newStudent = `${req.studentID},${name},${gender},${dept},${email},${telNo},${cutoff},${bday},${inputAddress},${inputCity},${inputState},${inputZip},${req.avatarPath}\n`;
    await fspr.appendFile(dBFile, newStudent).then(() => {
      res.status(200).json({ status: 'success' });
    });
    return;
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


app.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const { studentArray } = await convertCsvToJson();
  studentArray.some(student => { if (student.id === id) res.json(student); })
});


function readCSV() {
  return new Promise((resolve, reject) => {
    const students = [];
    const readStream = fs.createReadStream(dBFile);
    const readInterface = readline.createInterface({ input: readStream });

    readInterface.on('line', (line) => {
      const data = line.split(',');
      const student = {
        id: data[0],
        name: data[1],
        gender: data[2],
        dept: data[3],
        email: data[4],
        telNo: data[5],
        cutoff: data[6],
        bday: data[7],
        inputAddress:data[8],
        inputCity: data[9],
        inputState: data[10],
        inputZip: data[11],
        image:data[12]
      };
      students.push(student);
    });

    readInterface.on('close', () => {
      resolve(students);
    });

    readInterface.on('error', (err) => {
      reject(err);
    });
  });
}

// Function to write array of student objects back to CSV
function writeCSV(students) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(dBFile);
    console.log(students);
    students.forEach(student => {
      writeStream.write(
        `${student.id},${student.name},${student.gender},${student.dept},${student.email},${student.telNo},${student.cutoff},${student.bday},${student.inputAddress},${student.inputCity},${student.inputState},${student.inputZip},${student.image}\n`
      );
    });

    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    writeStream.end();
  });
}

// Endpoint to update student details
app.put('/students/:id', async (req, res) => {
  const studentId = req.params.id;
  const updatedStudent = req.body;
  console.log(req.body);
  console.log("id from url" + studentId)

  try {
    // Read CSV file and get array of student objects
    let students = await readCSV();

    console.log(students)
    // Find index of student with matching ID
    const studentIndex = students.findIndex(student => student.id == studentId);

    console.log("student index" + studentIndex)
    // Handle case where student is not found
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update the student object with new data
    students[studentIndex] = { ...students[studentIndex], ...updatedStudent };

    // Write updated student data back to CSV
    await writeCSV(students);

    // Respond with success message and updated student object

    res.status(200).json({status:'success', message: 'Student updated successfully', student: students[studentIndex] });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
;

app.listen(port=3000, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
    } else {
      console.log(`port ${port} is listening very keenly`);
    }
  });
