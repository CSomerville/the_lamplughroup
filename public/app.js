console.log("linked")

$(document).ready(function(){
  buttonListeners();
  displayRestaurants();
  displayItems();
})

//generic wrapper functions for ajax calls
function getData(resource, cb){
  $.ajax({
    url: "http://127.0.0.1:3000/" + resource,
    type: "GET"
  }).done(cb)
}
function makePost(resource, cb){
  $.ajax({
    url: "http://127.0.0.1:3000/" + resource,
    type: "POST"
  }).done(cb)
}

function sendPatch(resource, id, payload, cb){
  $.ajax({
    url: "http://127.0.0.1:3000/" + resource + "/" + id,
    type: "PATCH",
    data: payload
  }).done(cb)
}

function doADelete(resource, id, cb){
  $.ajax({
    url: "http://127.0.0.1:3000/" + resource + "/" + id,
    type: "DELETE"
  }).done(cb)
}

function displayRestaurants(){
  if ($('.restaurant').length > 0) $('.restaurant').remove();
  getData("restaurants", function(restaurants){

    restaurants.forEach(function(restaurant){
      var template = $('script[data-id="restaurant_template"]').text();
      $(Mustache.render(template, restaurant)).insertBefore($(".four.columns").find("[data-action='new_restaurant']"))   
    })
    $('.restaurant').find('button').each(function(){
      $(this).on('click', editRestaurantForm)
    })
  })
}

function filterItemsByRestaurant(restaurantId, cb){
  getData("items", function(items){
    var filtered = items.filter(function(item){
      if (item.restaurant_id === restaurantId) return item;
    })
    cb(filtered);
  })
}

function displayItems(){
  if ($(".item").length > 0) $(".item").remove();
  filterItemsByRestaurant(1, function(items){
    items.forEach(function(item){
      var template = $('script[data-id="item_template"]').text();
      $(Mustache.render(template, item)).insertBefore($(".eight.columns").find("[data-action='new_item']"))
    })
  })
}

function buttonListeners(){
  $('.four.columns').on('click', '[data-action="new_restaurant"]', newRestaurantForm);
  $('.eight.columns').on('click', '[data-action="new_item"]', newItemForm);
}

function newRestaurantForm(event){
  makePost("restaurants", function(data){
    $('body').append($(Mustache.render($('script[data-id="new_restaurant_popup"]').text(), {id: data.id})));
    $('form').on('click', '[data-action="new_restaurant"]', patchRestaurant);
    $('form').on('click', '[data-action="cancel_restaurant"]', deleteRestaurant);    
  })
}

function editRestaurantForm(event){
  var id = $(event.target).parent().attr("data-id");
  $('body').append($(Mustache.render($('script[data-id="edit_restaurant_popup"]').text(), {id: id})));
  $('form').on('click', '[data-action="save_restaurant"]', patchRestaurant);
  $('form').on('click', '[data-action="delete_restaurant"]', deleteRestaurant);
  $('form').on('click', '[data-action="cancel_restaurant"]', cancelRestaurant);
}

function removePopUp(){
  $(".popup").remove();
}

function newItemForm(event){
  makePost("items", function(data){

    var template = $('script[data-id="new_item_template"]').text();
    $(event.target).replaceWith($(Mustache.render(template, {id: data.id})));  

    $(".main.container").find("form").on('click', '[data-action="save_item"]', patchItem);
    $(".main.container").find("form").on('click', '[data-action="cancel_item"]', cancelItem);
  })
}

function removeNewItemForm(){
  $("form").remove();
  $(".eight.columns").append($("<button data-action='new_item'>New Item</button>"))   
}

function patchRestaurant(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  var payload = {
    name: $form.find("[data-attr='name']").val(),
    location: $form.find("[data-attr='location']").val(),
    cuisine: $form.find("[data-attr='cuisine']").val(),
    image_url: $form.find("[data-attr='image_url']").val()
  };
  sendPatch("restaurants", $form.attr("data-id"), payload, function(data){
    removePopUp();
    displayRestaurants();
    displayItems();
  })
}

function deleteRestaurant(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  doADelete("restaurants", $form.attr("data-id"), function(data){
    removePopUp();
    displayRestaurants();
    displayItems();
  })
}

function cancelRestaurant(event){
  event.preventDefault();
  console.log("That does nothing")
}

function patchItem(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  var payload = {
    name: $form.find("[data-attr='name']").val(),
    price: $form.find("[data-attr='price']").val(),
    order_count: $form.find("[data-attr='order_count']").val(),
    restaurant_id: 1
  }
  sendPatch("items", $form.attr("data-id"), payload, function(data){
    removeNewItemForm();
    displayItems();
  })
}

function cancelItem(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  doADelete("items", $form.attr("data-id"), function(){
    removeNewItemForm();    
  })
}