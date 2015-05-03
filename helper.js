var fs = require('fs')

var obk = {
  "restaurants": [
    {
      "id": 1,
      "name": "Denny's",
      "location": "Chicago",
      "cuisine": "American",
      "image_url": "http://www.coupons4utah.com/wp-content/uploads/2012/06/dennys-breakfast.jpg"
    }
  ],
  "items": [
    {
      "id": 1,
      "restaurant_id": 1,
      "name": "hamburger",
      "price": 10,
      "order_count": 0,
      "image_url": "http://kleberly.com/data_images/wallpapers/7/277047-hamburger.jpg"
    }
  ]
}

JSON.stringify(obk)
fs.writeFileSync('./restaurant_db.json', JSON.stringify(obk), 'utf8');