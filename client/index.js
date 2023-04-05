let map;
let directionsService;
let directionsRenderer;
let startMarker;
let endMarker;

function initMap() {
  // Create a new map object
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 50.5188, lng: 30.2398 },
    zoom: 13,
  });

  // Create a new directions service object
  directionsService = new google.maps.DirectionsService();

  // Create a new directions renderer object
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // Add a click listener to the map
  map.addListener('click', function (event) {
    // Get the location of the clicked point
    const clickedLocation = event.latLng;

    // If the start point hasn't been set yet
    if (!startMarker) {
      // Create a new marker at the clicked location and set it as the start marker
      startMarker = new google.maps.Marker({
        position: clickedLocation,
        map: map,
      });
    }
    // If the end point hasn't been set yet
    else if (!endMarker) {
      // Create a new marker at the clicked location and set it as the end marker
      endMarker = new google.maps.Marker({
        position: clickedLocation,
        map: map,
      });

      // Calculate and display the route
      calculateRoute();
    }
    // If both start and end points have been set
    else {
      // Clear the markers and directions from the map
      startMarker.setMap(null);
      endMarker.setMap(null);
      directionsRenderer.setDirections(null);

      // Create a new marker at the clicked location and set it as the start marker
      startMarker = new google.maps.Marker({
        position: clickedLocation,
        map: map,
      });

      // Clear the end marker
      endMarker = null;
    }
  });
}

function calculateRoute() {
  // Get the positions of the start and end markers
  const start = startMarker.getPosition();
  const end = endMarker.getPosition();

  // Create a request object for the directions service
  const request = {
    origin: start,
    destination: end,
    travelMode: 'DRIVING',
  };

  // Send the request to the directions service
  directionsService.route(request, function (result, status) {
    // If the request was successful
    if (status === 'OK') {
      // Clear previous route
      directionsRenderer.setDirections({ routes: [] });
      // Display new route
      directionsRenderer.setDirections(result);
      // Get total distance
      const distance = result.routes[0].legs.reduce((total, leg) => {
        return total + leg.distance.value;
      }, 0);
      const distanceInKm = distance / 1000;
      displayInfo(distanceInKm);
    } else {
      // Handle error
      window.alert('Directions request failed due to ' + status);
    }
  });
}

// todo? : рефактор функции getInfo и функции createNewCarBtn

async function displayInfo(distance) {
  const root = document.querySelector('#root');
  try {
    const data = await fetch('http://localhost:3000/cars');
    const response = await data.json();
    root.append(getInfo(response, distance));
  } catch (error) {
    console.log(error);
    return;
  }
}

function getInfo(obj, distance) {
  const infoWrapper = document.querySelector('.infoWrapper');

  if (infoWrapper.classList.contains('toDelete')) {
    infoWrapper.innerHTML = '';
    infoWrapper.classList.remove('toDelete');
  }

  const consumptionField = document.createElement('p');
  const travelTimeField = document.createElement('p');
  const personalConsumptionField = document.createElement('p');

  const select = createCarSelect(obj);

  select.addEventListener('change', (event) => {
    const selectedModel = event.target.value;
    const selectedObject = obj.find((item) => item.model === selectedModel);
    consumptionField.textContent = ` Consumtpion per 100km: ${selectedObject.consumption} litres`;
    travelTimeField.textContent = calculateTravelTime(distance, selectedObject);
    personalConsumptionField.textContent = calculatePersonalConsumption(
      distance,
      selectedObject
    );
  });

  const sharedInfoWrapper = document.createElement('div');
  sharedInfoWrapper.classList.add('sharedInfoWrapper');

  sharedInfoWrapper.append(consumptionField, createDistanceField(distance));

  const personalInfoWrapper = document.createElement('div');
  personalInfoWrapper.classList.add('personalInfoWrapper');

  personalInfoWrapper.append(travelTimeField, personalConsumptionField);

  infoWrapper.append(
    select,
    sharedInfoWrapper,
    personalInfoWrapper,
    createNewCarBtn()
  );
  infoWrapper.classList.add('toDelete');

  return infoWrapper;
}

function createCarSelect(obj) {
  const select = document.createElement('select');
  select.setAttribute('id', 'model-select');
  select.classList.add('carSelect');

  select.appendChild(createDefaultOption());

  obj.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.model;
    option.text = item.model;
    select.appendChild(option);
  });

  return select;
}

function createDefaultOption() {
  const defaultOption = document.createElement('option');
  defaultOption.text = 'Select a Car';
  defaultOption.disabled = true;
  defaultOption.selected = true;
  return defaultOption;
}

function createDistanceField(distance) {
  const distanceField = document.createElement('p');
  distanceField.textContent = `Distance : ${distance} km`;
  return distanceField;
}

function calculateTravelTime(distance, obj) {
  const travelTime = distance / obj.avgSpeed;
  return `Your trip time is ${travelTime.toFixed(2)} hr`;
}

function calculatePersonalConsumption(distance, obj) {
  const personalConsumption = distance / obj.consumption;
  return `Your consumtion is ${personalConsumption.toFixed(2)} litres`;
}

function createNewCarBtn() {
  const newCarBtn = document.createElement('button');

  newCarBtn.classList.add('newCarBtn');
  newCarBtn.dataset.modalOpen = 'modal-window';
  newCarBtn.textContent = 'Add a new car';

  const modal = createModalWindow();

  const closeModalBtn = document.querySelector('.modal-close');
  closeModalBtn.onclick = closeModalWindow;

  newCarBtn.addEventListener('click', (event) => {
    const data = event.target.dataset.modalOpen;

    if (modal.dataset.modal === data) {
      openModalWindow(modal);
    }
  });

  const formElem = document.querySelector('.newCarForm');

  formElem.addEventListener('submit', submitFormHandler);

  return newCarBtn;
}

function createModalWindow() {
  const modal = document.querySelector('.modal');
  modal.dataset.modal = 'modal-window';
  modal.onclick = closeModalWindow;
  return modal;
}

function openModalWindow(el) {
  el.classList.add('_active');
}

function closeModalWindow(el) {
  if (
    el.target.classList.contains('modal-close') ||
    el.target.classList.contains('modal')
  ) {
    el.target.closest('.modal').classList.remove('_active');
  }
}

async function submitFormHandler(event) {
  const formData = new FormData(event.target);

  const mark = formData.get('mark');
  const model = formData.get('model');
  const consumption = formData.get('consumption');
  const avgSpeed = formData.get('avg-speed');

  const carData = { mark, model, consumption, avgSpeed };

  try {
    const response = await fetch('http://localhost:3000/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(carData),
    });
  } catch (error) {
    console.log(error);
  }
}
