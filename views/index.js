const form = document.querySelector("#addstud");

async function sendData() {
  const formData = new FormData(form);

  try {
    const response = await fetch('/submit', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Success:', data);
      // Redirect to '/user/' or perform any other success actions
      // window.location.href = '/user/';
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