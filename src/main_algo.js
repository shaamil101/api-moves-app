import axios from 'axios';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config({ silent: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const maxRequests = 5;
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
  const prompt = `select the twenty best options from the following places and return their names as a simple array, just that as output please ${JSON.stringify(placesTrunc)} you should select the places according to the following responses of this survey ${JSON.stringify(results)} as we will later create an itenary for a night out based on these places. please return raw text with no code block ticks`;
  const options = await callGPT(prompt);
  const optionsArray = JSON.parse(options.match(/\[(.*?)\]/s)[0]);
  const optionsJson = places.filter((place) => { return optionsArray.includes(place.name); }).map((place) => {
    return {
      name: place.name,
      photos: place.photos,
      place_id: place.place_id,
      price_level: place.price_level,
      rating: place.rating,
      types: place.types,
      user_ratings_total: place.user_ratings_total,
    };
  });

  for (let i = 0; i < optionsJson.length; i += 1) {
    const placeId = optionsJson[i].place_id;
    const revUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&key=${process.env.PLACES_API_KEY}`;
    // eslint-disable-next-line no-await-in-loop
    const response = await axios.get(revUrl);
    const reviews = response.data.result.reviews.slice(0, 3);
    const reviewTexts = reviews.map((review) => { return review.text; });
    optionsJson[i].reviews = reviewTexts;
  }

  const finalPrompt = `select an itenerary with at most one place per type (e.g. bar, restaurant, club) for a night out from the following places ${JSON.stringify(optionsJson)} based on the following responses of this survey ${JSON.stringify(results)} please return just the json of the places in the order in which they should be visited you should only include as many places as would make sense to go to on one night out based on the survey results. please return raw text with no code block ticks`;
  const finalRes = await callGPT(finalPrompt);
  const finalResult = JSON.parse(finalRes).map((place) => {
    return {
      name: place.name,
      photos: place.photos,
      place_id: place.place_id,
      rating: place.rating,
      user_ratings_total: place.user_ratings_total,
    };
  });


  return finalResult;
}
