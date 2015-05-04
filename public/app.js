console.log("linked")


var colorsILike = ["254,179,111", "207,149,247", "255,104,214", "98,161,240", "127,251,254"];

$(document).ready(function(){
  buttonListeners();
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
  if ($('.restaurant').length > 0) $('.restaurant').remove();
  getData("restaurants", function(restaurants){

    restaurants.forEach(function(restaurant, i){
      var template = $('script[data-id="restaurant_template"]').text();
      restaurant.color = colorsILike[i%5];
      $(Mustache.render(template, restaurant)).insertBefore($(".four.columns").find("[data-action='new_restaurant']"))   
    })
    $('.restaurant').find('button').each(function(){
      $(this).on('click', editRestaurantForm)
    })
    $('.clickable').on('click', function(event){
      var id = $(event.target).parents(".restaurant").attr("data-id");
      displayItems(parseInt(id));
    })
    $('.clickable').on('mouseenter', function(event){
      $(event.target).parents('.clickable').addClass('animated pulse')
    })
    $('.clickable').on('mouseleave', function(event){
      $(event.target).parents('.clickable').attr("class", "clickable")
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

function setColor(restaurantId) {
  var restaurantColor = $(".restaurant[data-id='"+ restaurantId+ "']").css("background-color")
  $(".container.main").css({"background-color": restaurantColor})
}

function displayItems(restaurantId){

  if ($(".item").length > 0) $(".item").remove();
  setColor(restaurantId);
  var restaurantOffset = $(".restaurant[data-id='" + restaurantId + "']").offset().top;
  $(".eight.columns").css({position: "relative", top: restaurantOffset});
  $(".eight.columns").attr("data-id", restaurantId)

  filterItemsByRestaurant(restaurantId, function(items){
    items.forEach(function(item){
      if (!item.image_url) item.image_url = "http://placehold.it/75x75"      
      var template = $('script[data-id="item_template"]').text();
      $(Mustache.render(template, item)).insertBefore($(".eight.columns").find("[data-action='new_item']"))
    })
    $(".item .edit").on('click', editItemForm)
    $(".item img").on('click', itemImageForm);
    adjustContainingDivs();
    var $draggable = $(".draggable").draggabilly();
    $draggable.on('dragMove', draggingMove);
    $draggable.on('dragEnd', draggingEnd);
  })
}

function adjustContainingDivs(){
  var lowestButton = $("button[data-action='new_item']");
  var bottom = lowestButton.offset().top + parseInt(lowestButton.css("height"));
  if (bottom > parseInt($(".main.container").css("height"))) {
    $(".main.container").css({height: bottom + "px"})    
  } else {
    $(".main.container").css({height: ""})     
  }
}

function buttonListeners(){
  $('.four.columns').on('click', '[data-action="new_restaurant"]', newRestaurantForm);
  $('.eight.columns').on('click', '[data-action="new_item"]', newItemForm);
}

function newRestaurantForm(event){
  makePost("restaurants", function(data){
    $('body').append($(Mustache.render($('script[data-id="new_restaurant_popup"]').text(), {id: data.id})));
    $('form').on('click', '[data-action="save_new_restaurant"]', patchRestaurant);
    $('form').on('click', '[data-action="cancel_restaurant"]', deleteRestaurant);
    $('.popup').fadeIn(300);
    $('.big_dirty_window').animate({opacity:0.4}, {queue:false}, 300);
  })
}

function editRestaurantForm(event){
  var id = $(event.target).parent().attr("data-id");
  $('body').append($(Mustache.render($('script[data-id="edit_restaurant_popup"]').text(), {id: id})));
  $('form').on('click', '[data-action="save_restaurant"]', patchRestaurant);
  $('form').on('click', '[data-action="delete_restaurant"]', deleteRestaurant);
  $('form').on('click', '[data-action="cancel_restaurant"]', cancelRestaurant);
  $('.popup').fadeIn(300);
  $('.big_dirty_window').animate({opacity:0.4}, {queue:false}, 300);
}

function removePopUp(){
  $(".popup").fadeOut(300, function(){
    $(".popup").remove();
  });
  $('.big_dirty_window').animate({opacity:1}, {queue:false}, 300);
}

function newItemForm(event){
  makePost("items", function(data){

    var template = $('script[data-id="new_item_template"]').text();
    $(event.target).replaceWith($(Mustache.render(template, {id: data.id})));  

    $(".main.container").find("form").on('click', '[data-action="save_item"]', patchItem);
    $(".main.container").find("form").on('click', '[data-action="cancel_item"]', cancelItem);
  })
}

function itemImageForm(event) {
  var id = $(event.target).parents(".item").attr("data-id");
  var template = $('script[data-id="imgurl_popup"]').text();
  $("body").append($(Mustache.render(template, {id:id})));
  $('.popup').fadeIn(300);
  $('.big_dirty_window').animate({opacity:0.4}, {queue:false}, 300);
  $("[data-action='save_item_image_url']").on('click', saveItemImageUrl);
  $("[data-action='cancel_item_image_url']").on('click', cancelItemImageUrl);
}

function removeNewItemForm(){
  $("form").remove();
  $(".eight.columns").append($("<button data-action='new_item'>New Item</button>"));   
}

function removeEditItem(itemId){
  var $item = $(".item[data-id='" + itemId + "']");
  $item.find(".text_to_edit").attr("contenteditable", "false");
  $item.find("button").remove();
  $item.find(".three.columns").last().append("<button class='edit'>edit</button>")
  $item.find(".edit").on('click', editItemForm)  
}

function editItemForm(event){
  var $item = $(event.target).parents(".item")
  $item.find(".text_to_edit").attr("contenteditable", "true");
  var $buttons = $($("script[data-id='edit_item_buttons']").text());
  $(event.target).replaceWith($buttons);
  $item.on('click', '[data-action="save_item"]', saveItemEdit)
  $item.on('click', '[data-action="cancel_item"]', cancelItemEdit)
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
  })
}

function deleteRestaurant(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  doADelete("restaurants", $form.attr("data-id"), function(data){
    removePopUp();
    displayRestaurants();
  })
}

function cancelRestaurant(event){
  event.preventDefault();
  removePopUp();
}

function patchItem(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  var payload = {
    name: $form.find("[data-attr='name']").val(),
    price: $form.find("[data-attr='price']").val(),
    order_count: $form.find("[data-attr='order_count']").val(),
    restaurant_id: $form.parent().attr("data-id")
  }
  sendPatch("items", $form.attr("data-id"), payload, function(data){
    removeNewItemForm();
    displayItems(data.restaurant_id);
  })
}

function cancelItem(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  doADelete("items", $form.attr("data-id"), function(){
    removeNewItemForm();    
  })
}

function saveItemEdit(event){
  var $item = $(event.target).parents(".item");
  var payload = {
    name: $item.find("[data-attr='name']").text(),
    price: $item.find("[data-attr='price']").text(),
    order_count: $item.find("[data-attr='order_count']").text()
  }
  sendPatch("items", $item.attr("data-id"), payload, function(data){
    removeEditItem(data.id);
  })
}

function cancelItemEdit(event){
  var $item = $(event.target).parents(".item");
  removeEditItem($item.attr("data-id"))
}

function saveItemImageUrl(event){
  event.preventDefault();
  var $form = $(event.target).parents("form");
  console.log($form.find("[data-attr='image_url']").val())
  var payload = {
    image_url: $form.find("[data-attr='image_url']").val()
  };
  sendPatch("items", $form.attr("data-id"), payload, function(data){
    removePopUp();
    var $item = $(".eight.columns").find("[data-id='" + data.id + "']")
    var template = $('script[data-id="item_template"]').text();
    $item.replaceWith($(Mustache.render(template, data)));
  })
}

function cancelItemImageUrl(event){
  event.preventDefault();
  removePopUp();
}

function draggingMove(event, pointer){
  var $areas = $('.clickable').map(function(){
    var obj = $(this).offset();
    obj.id = $(this).parents(".restaurant").attr('data-id');
    obj.bottom = obj.top + parseInt($(this).css("height"));
    obj.right = obj.left + parseInt($(this).css("width"));
    return obj
  })
  $areas.each(function(){
    if (pointer.pageY > this.top && pointer.pageY < this.bottom &&
      pointer.pageX < this.right && pointer.pageX > this.left) {
        $(".restaurant[data-id='" + this.id + "']").children(".clickable").addClass('animated pulse')
        var idToPass = this.id
        window.setTimeout(function(){
          $(".restaurant[data-id='" + idToPass + "']").children(".clickable").attr("class", "clickable")          
        }, 1000)
    }
  })
  
}

function draggingEnd(event){
  console.log("not so dragging"); 
}