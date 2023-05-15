import axios from 'axios';

const baseUrl = 'http://www.boredapi.com';

const client = axios.create({
  baseURL: baseUrl,
  headers: { "Content-Type": "application/json" },
});

export default {
  async execute(method, resource, data) {
    return client({
      method,
      url: resource,
      data,

      headers: {},
    }).then((req) => {
      return req.data;
    });
  },
  getActivity() {
    return this.execute('get', '/api/activity/', { data: null });
  },
}