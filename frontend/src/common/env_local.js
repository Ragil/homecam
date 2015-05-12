import Env from './envbase';


export default new Env({
  baseURL : 'http://localhost:8090/hc',
  service : {
    NTS : 'https://ragilnts.appspot.com/nts'
  }
});
