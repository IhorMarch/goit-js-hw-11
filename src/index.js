import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

// simplelightbox

let lightbox = new SimpleLightbox(".gallery a");
lightbox.on('show.simplelightbox', function () {
  lightbox.options.captionsData = "alt"
  lightbox.options.captionDelay = 250
});


  const KEY ='38353437-6f1411718b397c5cf93033660';
  axios.defaults.baseURL = "https://pixabay.com/api/";
// axios.defaults.headers.common['x-api-key'] = KEY;
  
const ref = {
  form: document.querySelector('.search-form'),
  searchQuery: document.querySelector('input'),
  btnSubmit: document.querySelector('.submit'),
  btnLoader: document.querySelector('.load-more'),
  gallery:document.querySelector('.gallery'),
};

const LOCALSTORAGE_KEY = "user-input";
ref.btnLoader.hidden = true
// ref.btnSubmit.disabled = true

ref.form.addEventListener('submit', handlerSubmit);
ref.searchQuery.addEventListener('input', handlerInput);
ref.btnLoader.addEventListener('click', handlerClick)

const perPage = 40;
let page = 1;

// Searching IMG

function handlerSubmit(evt) {
  evt.preventDefault();
  ref.gallery.innerHTML = '';
  ref.searchQuery = ''
  ref.btnSubmit.disabled = true;
  const { searchQuery } = evt.currentTarget.elements;
  const search = searchQuery.value;


  if (search === '') {
    return Notiflix.Notify.warning('Your query must not be EMPTY!');;
  }

  serviceSearch(search).then(data => {
      
      totalHits = data.totalHits;
      const imgArr = data.hits;
      ref.btnLoader.hidden = true;
      if (imgArr.length === 0) {
       ref.gallery.innerHTML = '';
    Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
    }  
    else {
      ref.gallery.insertAdjacentHTML('beforeend', createMarkup(imgArr)); 
      if (totalHits > perPage) {
        ref.btnLoader.hidden = false;
      }
      lightbox.refresh();
     
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    }
    })

    .catch(err => {
      Notiflix.Notify.failure('Oops! Something went wrong! Try reloading the page!');
      console.log(err);
    ref.btnLoader.hidden = true;

    })
}

// Load More IMG

function handlerClick(evt) {
  evt.preventDefault();
  page += 1;
  const parsedSettings = JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY));
  serviceSearch(parsedSettings,page)
    
    .then(data => {
      
      totalHits = data.totalHits;
      totalPages = Math.ceil( totalHits / perPage );
      const imgArr = data.hits;
     
      ref.gallery.insertAdjacentHTML('beforeend', createMarkup(imgArr));
       if (totalPages === page) {
      ref.btnLoader.hidden = true
      return Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
    })

    .catch(err => {
      Notiflix.Notify.failure('Oops! Something went wrong! Try reloading the page!');
      console.log(err);
    ref.btnLoader.hidden = true;

    })
}

// INPUT
 
function handlerInput(evt) {
  evt.preventDefault();
  // if ( ( evt.target.value.trim().length ) === 0 ) {
  //   // Notiflix.Notify.warning('Your query must start with a LETTER or NUMBER and must not be EMPTY!');
  //   evt.target.value = '';
  //   // ref.btnSubmit.disabled = true
    
  //   return;
  // }
  
  const formData = evt.target.value;
  console.log(formData);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(formData));
  ref.btnSubmit.disabled = false;


}
  
// GET to BackEnd

function serviceSearch(search,page) {
    const BASE_URL = 'https://pixabay.com/api/';
   

    const params = new URLSearchParams({
        key: KEY,
        q: search,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: page,
        per_page: perPage,
    })

    // return fetch(`${BASE_URL}?${params}`)
      return axios.get(`${BASE_URL}?${params}`)
        .then(response => {
            console.dir(response.data.total);
            if (response.status !== 200) {
                throw new Error(response.statusText)
            }
          return response.data
        })
            
            
}

// RENDER

function createMarkup(arr) {
    return arr.map(img => `<div class="photo-card">
        <a href="${img.largeImageURL}"><img src="${img.webformatURL }" alt="${img.tags }" loading="lazy" /></a>
        <div class="info">
          <p class="info-item">
            <b>Likes ${img.likes}</b>
          </p>
          <p class="info-item">
            <b>Views ${img.comments}</b>
          </p>
          <p class="info-item">
            <b>Comments ${img.views}</b>
          </p>
          <p class="info-item">
            <b>Downloads ${img.downloads}</b>
          </p>
        </div> `).join('')
}

