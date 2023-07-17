import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const KEY = '38311930-85d3c545d646c21734b663503';
const BASE_URL = 'https://pixabay.com/api/';

const formInput = document.querySelector('.search-form');
const inputSearch = document.querySelector('[name="searchQuery"]');
const buttonLoadMore = document.querySelector('.load-more');
const divGallery = document.querySelector('.gallery');

const image_type = 'photo';
const orientation = 'horizontal';
const safesearch = 'true';

let page = 1;
const per_page = 40;
let searchQuery = null;
let images = [];
let totalPages = 0;

formInput.addEventListener('submit', search);
buttonLoadMore.addEventListener('click', loadMore);
hideBtnLoad();

async function getData(searchWord, page, per_page) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${KEY}&q=${searchWord}&page=${page}&per_page=${per_page}&image_type=${image_type}&orientation=${orientation}&safesearch=${safesearch}`
    );
    return response;
  } catch (error) {
    console.error(error);
  }
}

async function search(event) {
  event.preventDefault();
  clearMarkUp();
  searchQuery = event.currentTarget.searchQuery.value.trim();
  if (searchQuery === '') {
    clearMarkUp();
    hideBtnLoad();
    Notiflix.Notify.failure('Sorry , try again');
    return;
  }
  page = 1;

  const response = await getData(searchQuery, page, per_page);
  const totalData = response.data.totalHits;
  images = response.data.hits;
  totalPages = totalData / per_page;
  if (images.length > 0) {
    clearMarkUp();
    Notiflix.Notify.success(`Hooray! We found ${totalData} images.`);
    showBtnLoad();
  } else {
    Notiflix.Notify.failure(
      `Sorry, there are no images matching your ${searchQuery}. Please try again.`
    );
    hideBtnLoad();
  }
  clearMarkUp();
  createGallery();
}

async function loadMore(event) {
  page += 1;

  const response = await getData(searchQuery, page, per_page);
  const totalData = response.data.totalHits;
  images = response.data.hits;
  totalPages = totalData / per_page;
  if (totalPages <= page) {
    Notiflix.Notify.info(
      `We're sorry, but you've reached the end of search results.`
    );
    hideBtnLoad();
  }
  createGallery();
  smoothScroll('.gallery');
}

function createGallery() {
  const items = images;
  const galleryMarkUp = items.map(markUp);
  divGallery.insertAdjacentHTML('beforeend', galleryMarkUp.join(''));

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });

  lightbox.refresh();
}

function markUp({
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads,
}) {
  return `<div class="photo-card">
  <a class="photo-link" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" width="300" height="200" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes:</br> ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views:</br> ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments:</br> ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads:</br> ${downloads}</b>
    </p>
  </div>
</div>`;
}

function clearMarkUp() {
  divGallery.innerHTML = '';
}

function hideBtnLoad() {
  buttonLoadMore.style.display = 'none';
}
function showBtnLoad() {
  buttonLoadMore.style.display = 'block';
}

function smoothScroll(object) {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

Notiflix.Notify.init({
  position: 'center-top',
  distance: '45px',
  timeout: 2000,
  cssAnimationStyle: 'zoom',
  fontFamily: 'Arial, sans-serif',
});
