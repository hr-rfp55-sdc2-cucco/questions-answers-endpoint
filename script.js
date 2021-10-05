import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
  vus: 1000,
  duration: '30s',
};

export default function () {

  const id = Math.floor(Math.random() * 518980 + 3000000);
  // http.get(`http://localhost:3004/qa/questions/${id}`);
  http.get(`http://localhost:3000/qa/questions?product_id=${id}?page=1?count=10`);
  // http.get(`http://localhost:3000/qa/questions/${id}/answers`);
  sleep(1);
}