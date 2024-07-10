document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector("#addstud");
  const ehandle = document.getElementById('ErrorPrint');

  if (!form) {
    console.error('Form not found!');
    return;
  }

  if (!ehandle) {
    console.error('Error handle element not found!');
    return;
  }

  async function sendData() {
    const formData = new FormData(form);

    console.log('Form data:', formData);
    try {
      const response = await fetch('/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("Data in index.js:", data);

      if(!response.ok){
        if (data.errors) {
          ehandle.textContent = data.errors.join(', ');
        } else {
          ehandle.textContent = data.error;
        }
      }
      else if (response.ok) {
        if (data.status === 'success') {
          window.location.href = '/student'; //routing..redirecting to another page
      }
    }
    }
    catch (error) {
      console.error('Error:', error);
      ehandle.textContent = `An error occurred while submitting the form. ${error}`;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendData();
  });
});
