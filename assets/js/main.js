let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  let imageUrl = DBHelper.imageUrlForRestaurant(restaurant);

  if (imageUrl === '/img/undefined') {
    const notAvailable = document.createElement('div');
    notAvailable.className = 'restaurant-img';
    const txt = document.createElement('p');
    txt.append('Image\'s not available.');

    notAvailable.append(txt);
    li.append(notAvailable);
  } else {
    const picture = document.createElement('picture');
    li.append(picture);

    const img_source1 = document.createElement('source');
    img_source1.media = '(min-width: 600px) and (max-width: 700px)';
    img_source1.srcset = `${imageUrl}_small2x.jpg`;

    const img_source2 = document.createElement('source');
    img_source2.srcset = `${imageUrl}_small.jpg, ${imageUrl}_small2x.jpg 2x, ${imageUrl}_small2x.jpg 3x`

    const img_source3 = document.createElement('source');
    img_source3.media = '(min-width: 600px) and (max-width: 700px)';
    img_source3.srcset = `${imageUrl}_small2x.webp`;

    const img_source4 = document.createElement('source');
    img_source4.srcset = `${imageUrl}_small.webp, ${imageUrl}_small2x.webp 2x, ${imageUrl}_small2x.webp 3x`

    picture.append(img_source3); // 3 and 4 for browsers that supports  webp formats
    picture.append(img_source4);
    picture.append(img_source1);
    picture.append(img_source2);

    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.src = imageUrl+'_small.jpg';
    image.alt = `${restaurant.name} restaurant image`;
    picture.append(image);

  }


  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  name.setAttribute('tabindex', '0');
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
// For Accessibility
// remove focus from google map for keyboard users.
document.querySelector('a').addEventListener('keydown', skipMap);
document.querySelector('select').addEventListener('keydown', skipMap2);

function skipMap(e) {
  if (e.keyCode === 9) {
    if (e.shiftKey) {
      document.querySelector('#footer a').focus();
    } else {
      document.querySelector('select').focus();
    }
  }
  e.preventDefault();
}

function skipMap2(e) {
  if (e.keyCode === 9) {
    if (e.shiftKey) {
      document.querySelector('a').focus();
      e.preventDefault();
    }
  }
}
// The Service Worker
// if (navigator.serviceWorker) {
//   window.addEventListener('load', function() {
//     navigator.serviceWorker.register('/sw.js')
//       .then(function(reg) {
//         console.log('service worker registeration successful!');
//       }, function(err) {
//         console.log('service worker registeration failed.');
//       });
//   });
// }