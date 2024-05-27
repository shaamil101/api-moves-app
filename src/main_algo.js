import axios from 'axios';
import OpenAI from 'openai';

const API_KEY = 'AIzaSyCIPBNyynklZF6t7snFBUNaYDNP6VoM0EU';
const GPT_KEY = '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';
const openai = new OpenAI({
  apiKey: GPT_KEY,
});
const maxRequests = 5;
let requestCounter = 0;

function fetchAllPlaces(url, places = []) {
  requestCounter += 1;
  return axios.get(url)
    .then((response) => {
      return response.data; // No need to call .json(), Axios automatically parses JSON responses
    })
    .then((data) => {
      places = places.concat(data.results);
      if (data.next_page_token && requestCounter < maxRequests) {
        return new Promise((resolve) => { setTimeout(resolve, 2000); })
          .then(() => {
            const nextPageUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${data.next_page_token}&key=${API_KEY}`;
            return fetchAllPlaces(nextPageUrl, places);
          });
      } else {
        return places;
      }
    });
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

export default async function getResultJson(results, location, radius) {
  const typeRes = 'restaurant';
  const typeBar = 'bar';
  const typeClub = 'night_club';
  const locationString = `${location.latitude},${location.longitude}`;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${locationString}&radius=${radius}&type=${typeRes}|${typeBar}|${typeClub}&key=${API_KEY}`;

  const result = await fetchAllPlaces(url);
  const resTrunc = result.map((place) => {
    return {
      name: place.name,
      price_level: place.price_level,
      rating: place.rating,
      types: place.types,
    };
  });
  const prompt = `Select the twenty best options from the following places and return their names as a simple array, just that as output please ${JSON.stringify(resTrunc)} you should select the places according to the following responses of this survey ${JSON.stringify(results)} as we will later create an itenary for a night out based on these places`;

  const res = await callGPT(prompt);
  const optionsArray = JSON.parse(res.match(/\[(.*?)\]/s)[0]);

  console.log(optionsArray);
  return result;
}
