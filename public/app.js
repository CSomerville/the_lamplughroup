console.log("linked")

$(document).ready(function(){
  headerListeners();
  displayRestaurants();
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
  getData("restaurants", function(data){
    data.forEach(function(restaurant){
      var template = $('script[data-id="restaurant_template"]').text();
      $(".container.main").append($(Mustache.render(template, restaurant)));    
    })
    $('.restaurant').find('button').each(function(){
      $(this).on('click', editRestaurantForm)
    })
  })
}

function headerListeners(){
  $('header').on('click', '[data-action="new_restaurant"]', newRestaurantForm);
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
    console.log("yay");
  })
}

function deleteRestaurant(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  doADelete("restaurants", $form.attr("data-id"), function(data){
    console.log("nuh-uh");
  })
}

function cancelRestaurant(event){
  console.log("That does nothing");
}