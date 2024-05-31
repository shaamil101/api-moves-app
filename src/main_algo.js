import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ silent: true });


const Groq = require("groq-sdk");
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const maxRequests = 2;
let requestCounter = 0;
console.log('loaded main_algo.js');

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
}

async function callGPT(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content;
  } catch (error) {
    return `Error calling GPT-4 API:${error}`;
  }
}
async function callGroq(prompt) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          "role": "system",
          "content": prompt 
        }
      ],
      "temperature": 1,
      "top_p": 1,
      "stream": false,
      "seed": 0,
      model: 'llama3-8b-8192',
    });

    return response.choices[0].message.content;
  } catch (error) {
    return `Error calling Groq API:${error}`;
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
  const placesTrunc = places.map((place) => {
    return {
      name: place.name,
      price_level: place.price_level,
      rating: place.rating,
      types: place.types,
    };
  });
  // const prompt = `select the 10 best options from the following places and return their names as a simple array, just that as output please ${JSON.stringify(placesTrunc)} you should select the places according to the following responses of this survey ${JSON.stringify(results)} as we will later create an itenary for a night out based on these places. please return raw text with no code block ticks`;

  const prompt = `You are an AI that only generates an array of strings for recommended places based on user preferences. You will be given two JSON objects: one containing details about places from the Google Places API, and another containing user responses to a survey about their preferences.

  Places:
  ${JSON.stringify(placesTrunc)}
  
  Survey responses:
  ${JSON.stringify(results)}
  
  Using these JSON objects, generate an array of ten unique places where each string is a place name that matches the user's preferences. The array should include only those 10 unique places that meet the criteria specified in the survey responses.
  
  Using the reviews and details provided, only generate an array in this format ["Place 1 Name", "Place 2 Name", ..., "Place 10 Name"] that includes the names of the two places that best match the user's preferences.:`;

  const options = await callGroq(prompt);
  console.log('options:', options);
  const optionsArray = JSON.parse(options.match(/\[(.*?)\]/s)[0]);
  console.log('optionsArray: ', JSON.stringify(optionsArray));

  const optionsJson = places.filter((place) => { return optionsArray.includes(place.name); }).map((place) => {
    return {
      name: place.name,
      photos: place.photos,
      place_id: place.place_id,
      price_level: place.price_level,
      rating: place.rating,
      types: place.types,
      user_ratings_total: place.user_ratings_total,
      geometry: place.geometry,
    };
  });

  for (let i = 0; i < optionsJson.length; i += 1) {
    const placeId = optionsJson[i].place_id;
    const revUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${process.env.PLACES_API_KEY}`;
    // eslint-disable-next-line no-await-in-loop
    const response = await axios.get(revUrl);
    const reviews = response.data.result.reviews.slice(0, 2);
    const reviewTexts = reviews.map((review) => { return review.text; });
    optionsJson[i].reviews = reviewTexts;
  }

const finalPrompt = `You are an AI that generates an array of strings based on user preferences and reviews. You will be given two pieces of information: an array of 10 recommended places and their corresponding details.

Place details and reviews:
${JSON.stringify(optionsJson)}

Using the reviews and details provided, only generate an array in this format ["Place 1 Name", "Place 2 Name"] that includes the names of the two places that best match the user's preferences.:`;

const finalRes = await callGroq(finalPrompt);
console.log('finalRes:', finalRes);
const resultsArray = JSON.parse(finalRes.match(/\[(.*?)\]/s)[0]);
console.log('resultsArray:', JSON.stringify(resultsArray));
const finalResult = places.filter((place) => { return resultsArray.includes(place.name); }).map((place) => {
  return {
    name: place.name,
    photos: place.photos,
    place_id: place.place_id,
    price_level: place.price_level,
    rating: place.rating,
    types: place.types,
    user_ratings_total: place.user_ratings_total,
    geometry: place.geometry,
  };
});

const result = finalResult.map(place => ({
  name: place.name,
  photo: getPhotoUrl(place.photos?.[0]?.photo_reference),
  place_id: place.place_id,
  rating: place.rating,
  price_level: place.price_level,
  distance: getDistance(location.latitude, location.longitude, place.geometry.location.lat, place.geometry.location.lng),
}));

console.log('results', JSON.stringify(result));
return result;
}
