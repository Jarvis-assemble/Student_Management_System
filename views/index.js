const form = document.querySelector("#addstud");
//note
async function sendData() {
  const formData = new FormData(form);

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.status=='success') {
      console.log('Success:', data);
      // Redirect to '/user/' or perform any other success actions
      window.location.href = '/student/';
    } else {
      const ehandle = document.getElementById('Ehandle');
      if (data.errors) {
        ehandle.textContent = data.errors.join(', ');
      } else {
        ehandle.textContent = 'Unknown error occurred.';
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendData();
});


// const form = document.querySelector("#addstud");

// async function sendData() {
//   // Associate the FormData object with the form element
//   const formData = new FormData(form);
//   console.log("form data is ",formData)
//   fetch('/submit', {
//     method: 'POST',
//     body: formData,
//   })
//     .then((response) => response.json())
//     .then((data) => {
    
//       if (data.status === 'success') {
//          // window.location.href = '/user/'; //redirecting to table
//         console.log(data,formData)
//       } else  {
//         const ehandle = document.getElementById('Ehandle');
//         ehandle.textContent = data.message;  //error message
//       }
//     })
//     .catch((error) => {
//       console.error('Error:', error);
//     });
// }
// //   try {
// //     const response = await fetch("/submit", {
// //       method: "POST",
// //       // Set the FormData instance as the request body
// //       body: formData,
// //     });
// //     const data=response.json();
// //     console.log(await data);
// //     if (data.status === 'success') {
// //        // window.location.href = '/user/'; //redirecting to table
// //        console.log(data)
// //     } else  {
// //       const ehandle = document.getElementById('Ehandle');
// //       ehandle.textContent = data.message;  //error message
// //     }
// //   } catch (e) {
// //     console.error(e);
// //   }
// // }

// // Take over form submission
// form.addEventListener("submit", (event) => {
//   event.preventDefault();
//   sendData();
// });
