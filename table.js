console.log("Inside table.js")

async function getStudents(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    else{
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error fetching student data:', error);
  }
}

//getStudents('http://localhost:3000/students/'); // API call to render table


const rowsPerPage = 5; 
let currentPage = 1; 
  
function populateStudentTable(data) {
    const studentTable = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
  
    // Clear existing rows
    while (studentTable.rows.length > 0) {
      studentTable.deleteRow(0);
    }

    //data is json needed  
    
    //student is a object in json
    data.forEach((student) => {
      const row = studentTable.insertRow();

      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.gender}</td>
        <td>${student.dept}</td>
        <td>${student.email}</td>
        <td>${student.telNo}</td>
        <td>${student.cutoff}</td>
        <td>${student.bday}</td>
        <td>${student.inputCity}</td>
        <td>${student.inputState}</td>
        <td>${student.inputZip}</td>

        <td><img src="http://localhost:3000/images/${student.avatarPath}" alt="Profile Pic" style="width: 50px; height: 50px;"></td>
      `;
    });

  }


function displayTable(pageNumber, totalPages, data) {

  const startIndex = (pageNumber - 1) * rowsPerPage;
  const endIndex=startIndex + rowsPerPage;
  const slicedData = data.slice(startIndex, endIndex);

  populateStudentTable(slicedData); // Populate table with sliced data

  const totalEntries=(data.length);
  const info=document.getElementById("msg")
  info.innerHTML=`<p>Showing ${startIndex+1} to ${endIndex+1} of ${totalEntries} entries</p>`

  updatePagination(pageNumber,totalPages,data); 
}

function updatePagination(currentPage,pageCount,data) { 
 
  const paginationContainer = document.getElementById("pagination"); 
  paginationContainer.innerHTML = ""; 

  for (let i = 1; i <= pageCount; i++) { 
      const pageLink = document.createElement("a"); 
      pageLink.href = "#"; 
      pageLink.innerText = i; 
      pageLink.onclick = function () { 
          displayTable(i,pageCount,data); 
      }; 
      if (i === currentPage) { 
          pageLink.style.fontWeight = "bold"; 
      } 
      paginationContainer.appendChild(pageLink); 
      paginationContainer.appendChild(document.createTextNode(" ")); 
  } 
} 


  async function pagesSetup() {

  const apiUrl = 'http://localhost:3000/students/'; //vary api for filter

  try {
    const studentData = await getStudents(apiUrl); // Fetch student data

    const totalPages = Math.ceil(studentData.length / rowsPerPage); 

    displayTable(currentPage, totalPages, studentData);

  } catch (error) {
    console.error('Error initializing page:', error);
  }
}

// Call the initializePage function to start fetching and displaying data
pagesSetup();