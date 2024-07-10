console.log("Inside table.js");

async function getStudents(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error('Error fetching student data:', error);
  }
}

const rowsPerPage = 5;
let currentPage = 1;
let totalPages = 1; // Variable to store total pages globally
getStudents('http://localhost:3000/students/');
function populateStudentTable(data) {
  const studentTable = document.getElementById('studentTable').getElementsByTagName('tbody')[0];

  // Clear existing rows
  while (studentTable.rows.length > 0) {
    studentTable.deleteRow(0);
  }

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
<td>hi</td>

      
      `;
  });
}

function displayTable(pageNumber, data) {
  const startIndex = (pageNumber - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const slicedData = data.slice(startIndex, endIndex);

  populateStudentTable(slicedData); // Populate table with sliced data
  currentPage = pageNumber;
  updatePagination();
}
async function viewDetails(studentId) {
  fetch(`http://localhost:3000/students/${studentId}`)
      .then(response => response.json())
      .then(student => {
          document.getElementById('editForm').style.display = 'flex';
          document.getElementById('studentId').value = student.id;
          document.getElementById('studentName').value = student.name;
          document.getElementById('studentGender').value = student.gender;
          document.getElementById('studentDept').value = student.dept;
          document.getElementById('studentEmail').value = student.email;
          document.getElementById('studentTelNo').value = student.telNo;
          document.getElementById('studentCutoff').value = student.cutoff;
          document.getElementById('studentBday').value = student.bday;
          document.getElementById('studentCity').value = student.inputCity;
          document.getElementById('studentState').value = student.inputState;
          document.getElementById('studentZip').value = student.inputZip;
      })
      .catch(error => {
          console.error('Error fetching student details:', error);
      });
}

function saveStudent() {
  const studentId = document.getElementById('studentId').value;
  const student = {
      id: studentId,
      name: document.getElementById('studentName').value,
      gender: document.getElementById('studentGender').value,
      dept: document.getElementById('studentDept').value,
      email: document.getElementById('studentEmail').value,
      telNo: document.getElementById('studentTelNo').value,
      cutoff: document.getElementById('studentCutoff').value,
      bday: document.getElementById('studentBday').value,
      inputCity: document.getElementById('studentCity').value,
      inputState: document.getElementById('studentState').value,
      inputZip: document.getElementById('studentZip').value
  };

  fetch(`http://localhost:3000/students/${studentId}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(student)
  })
      .then(response => response.json())
      .then(data => {
          console.log('Student updated successfully:', data);
          // Refresh the student table or handle the response data
          getStudents('http://localhost:3000/students/');
          document.getElementById('editForm').style.display = 'none';
      })
      .catch(error => {
          console.error('Error updating student:', error);
      });
}
document.addEventListener('DOMContentLoaded', () => {
  const searchField = document.getElementById('search');
  const clearButton = document.getElementById('clearButton');
  const departmentFilter = document.getElementById('departmentFilter');

  function filterStudents() {
      const searchValue = searchField.value.trim().toLowerCase();
      const departmentValue = departmentFilter.value;
      const studentTable = document.getElementById('studentTable').getElementsByTagName('tbody')[0];
      const rows = studentTable.getElementsByTagName('tr');

      Array.from(rows).forEach(row => {
          const cells = row.getElementsByTagName('td');
          const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
          const dept = cells[3].textContent;

          if ((searchValue === '' || rowText.includes(searchValue)) &&
              (departmentValue === '' || dept === departmentValue)) {
              row.style.display = '';
          } else {
              row.style.display = 'none';
          }
      });
  }

  searchField.addEventListener('input', filterStudents);
  departmentFilter.addEventListener('change', filterStudents);

  clearButton.addEventListener('click', function() {
      searchField.value = '';
      departmentFilter.value = '';
      filterStudents();
  });
});
function updatePagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  const prevArrow = document.createElement("span");
  prevArrow.className = "arrow";
  prevArrow.textContent = "←";
  prevArrow.addEventListener("click", function () {
    if (currentPage > 1) {
      displayTable(currentPage - 1, studentData);
    }
  });
  paginationContainer.appendChild(prevArrow);

  for (let i = 1; i <= totalPages; i++) {
    const pageLink = document.createElement("a");
    pageLink.href = "#";
    pageLink.textContent = i;
    pageLink.onclick = function () {
      displayTable(i, studentData);
    };
    if (i === currentPage) {
      pageLink.style.fontWeight = "bold";
    }
    paginationContainer.appendChild(pageLink);
    paginationContainer.appendChild(document.createTextNode(" "));
  }

  const nextArrow = document.createElement("span");
  nextArrow.className = "arrow";
  nextArrow.textContent = "→";
  nextArrow.addEventListener("click", function () {
    if (currentPage < totalPages) {
      displayTable(currentPage + 1, studentData);
    }
  });
  paginationContainer.appendChild(nextArrow);
}

async function pagesSetup() {
  const apiUrl = 'http://localhost:3000/students/';

  try {
    const studentData = await getStudents(apiUrl);

    totalPages = Math.ceil(studentData.length / rowsPerPage);

    displayTable(currentPage, studentData);

  } catch (error) {
    console.error('Error initializing page:', error);
  }
}

// Call the initializePage function to start fetching and displaying data
pagesSetup();

