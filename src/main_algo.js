import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ silent: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const maxRequests = 1;
let requestCounter = 0;

function fetchAllPlaces(url, places = []) {
  requestCounter += 1;
  return axios.get(url)
    .then((response) => {
      return response.data;
    })
    .then((data) => {
      places = places.concat(data.results);
      if (data.next_page_token && requestCounter < maxRequests) {
        return new Promise((resolve) => { setTimeout(resolve, 2000); })
          .then(() => {
            const nextPageUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${data.next_page_token}&key=${process.env.PLACES_API_KEY}`;
            return fetchAllPlaces(nextPageUrl, places);
          });
      } else {
        return places;
      }
    });
}

function getPhotoUrl(photoReference, maxWidth = 400) {
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${process.env.PLACES_API_KEY}`;
  return url;
};

async function callGPT(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    return `Error calling GPT-4 API:${error}`;
  }
}

// inspo from stack overflow: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusMiles = 3958.8; // Radius of the Earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
    + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2))
    * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusMiles * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

export default async function getResultJson(results, location, radius) {
  const typeRes = 'restaurant';
  const typeBar = 'bar';
  const typeClub = 'night_club';
  const locationString = `${location.latitude},${location.longitude}`;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${locationString}&radius=${radius}&type=${typeRes}|${typeBar}|${typeClub}&key=${process.env.PLACES_API_KEY}`;

  const places = await fetchAllPlaces(url);
  // const placesTrunc = places.map((place) => {
  //   return {
  //     name: place.name,
  //     price_level: place.price_level,
  //     rating: place.rating,
  //     types: place.types,
  //   };
  // });
  // const prompt = `Select the twenty best options from the following places and return their names as a simple array, just that as output please ${JSON.stringify(placesTrunc)} you should select the places according to the following responses of this survey ${JSON.stringify(results)} as we will later create an itenary for a night out based on these places`;
  // const options = await callGPT(prompt);
  // const optionsArray = JSON.parse(options.match(/\[(.*?)\]/s)[0]);
  // const optionsJson = places.filter((place) => { return optionsArray.includes(place.name); }).map((place) => {
  //   return {
  //     name: place.name,
  //     photos: place.photos,
  //     place_id: place.place_id,
  //     price_level: place.price_level,
  //     rating: place.rating,
  //     types: place.types,
  //     user_ratings_total: place.user_ratings_total,
  //   };
  // });


  // for (let i = 0; i < optionsJson.length; i += 1) {
  //   const placeId = optionsJson[i].place_id;
  //   const revUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${process.env.PLACES_API_KEY}`;
  //   // eslint-disable-next-line no-await-in-loop
  //   const response = await axios.get(revUrl);
  //   const reviews = response.data.result.reviews.slice(0, 3);
  //   const reviewTexts = reviews.map((review) => { return review.text; });
  //   optionsJson[i].reviews = reviewTexts;
  // }

  // const finalPrompt = `select an itenerary for a night out from the following places ${JSON.stringify(optionsJson)} based on the following responses of this survey ${JSON.stringify(results)} please return just the json of the places in the order in which they should be visited you should only include as many places as would make sense to go to on one night out based on the survey results. please return raw text with no code block ticks`;
  // const finalRes = await callGPT(finalPrompt);
  // const finalResult = JSON.parse(finalRes).map((place) => {
  //   return {
  //     name: place.name,
  //     photos: place.photos,
  //     place_id: place.place_id,
  //     rating: place.rating,
  //   };
  // });

  // return finalResult;

  const finalPlaces = places.map((place) => {
    return {
      name: place.name,
      photo: getPhotoUrl(place.photos[0].photo_reference),
      place_id: place.place_id,
      rating: place.rating,
      price_level: place.price_level,
      distance: getDistance(location.latitude, location.longitude, place.geometry.location.lat, place.geometry.location.lng),
    };
  });

  const retVal = finalPlaces.slice(0, 3);
  return retVal;
}
