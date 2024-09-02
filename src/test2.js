const axios = require('axios');

const url = 'https://api-hft.upstox.com/v2/order/place';
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJrZXlfaWQiOiJza192MS4wIiwiYWxnIjoiSFMyNTYifQ.eyJzdWIiOiJLTDI3NzAiLCJqdGkiOiI2NmQ1M2UxYjRhODY4MTA5YWY5ZTdlYzQiLCJpc011bHRpQ2xpZW50IjpmYWxzZSwiaWF0IjoxNzI1MjUxMDk5LCJpc3MiOiJ1ZGFwaS1nYXRld2F5LXNlcnZpY2UiLCJleHAiOjE3MjUzMTQ0MDB9.-IFRiSKPVDrSxfkRBGr1ggUSuFS-ZZhfUsGR76nLRww',
};

const data = {
  quantity: 1,
  product: 'I',
  validity: 'DAY',
  price: 0,
  tag: 'string',
  instrument_token: 'NSE_EQ|INE528G01035',
  order_type: 'MARKET',
  transaction_type: 'SELL',
  disclosed_quantity: 0,
  trigger_price: 0,
  is_amo: false,
};

axios.post(url, data, { headers })
  .then(response => {
    console.log('Response:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });

  //  data: '{"quantity":1,"product":"D","validity":"DAY","price":0,"tag":"string","instrument_token":"NSE_EQ|INE528G01035","order_type":"MARKET","transaction_type":"SELL","disclosed_quantity":0,"trigger_price":0,"is_amo":false}'