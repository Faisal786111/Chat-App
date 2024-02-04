const socket = io();

//Elements
const $messageForm = document.querySelector("#messageForm");
const $messageFormInput = document.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationMessageTemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const {username , room} = Object.fromEntries(new URLSearchParams(location.search));

const autoScroll = ()=>{
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message 
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height 
  const visibleHeight = $messages.offsetHeight;
   
  // Hieght of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrolloffset = $messages.scrollTop + visibleHeight;

  if(containerHeight - newMessageHeight <= scrolloffset){
    $messages.scrollTop = $messages.scrollHeight;
  }


  console.log(newMessageHeight)

}

socket.on("message", (message) => {
  console.log(message);
  
  const html = Mustache.render($messageTemplate, {
    username : message.username,
    message : message.text,
    createdAt : moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (message) => {
  console.log(message);
  const html = Mustache.render($locationMessageTemplate, { 
    username : message.username,
    url : message.url, 
    createdAt : moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend" , html);
  autoScroll();
});

socket.on("roomData" , ({room , users})=>{
  const html = Mustache.render($sidebarTemplate , {
    room,
    users
  });

  document.querySelector("#sidebar").innerHTML = html;

})

$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Access the message input value
  const message = event.target.elements.message.value;

  //disable send button
  $messageFormButton.setAttribute("disabled", "disabled");

  //emit to server
  socket.emit("sendMessage", message, (error) => {
    //Enable send button
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    }
    console.log("Message was delivered.");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Your browser doesn't support geolocation!");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const data = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };

    //disable send-location button
    socket.emit("sendLocation", data, () => {
      //enable send-location button
      $sendLocationButton.removeAttribute("disabled");

      console.log("Location shared.");
    });
  });
});

socket.emit("join" , {username , room} , (error)=>{
    if(error){
      alert(error);
      location.href = '/';
    }
});