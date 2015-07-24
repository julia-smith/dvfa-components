$(document).ready(function(){
  //initInteraction();
});

function initInteraction(){
  $('.dvfa-option input').click(function(){
    printSelected( $(this) );
  });
}

function printSelected(clicked){
  console.log("clicked: " + clicked.attr('id'));
  var checked = $('.dvfa-option input:checked');
  for (var i=0, j=checked.length; i<j; i++){
    var id = checked[i].id;
    console.log(id);
  }
}


