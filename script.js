var public_spreadsheet_url = 'https://docs.google.com/spreadsheets/d/1bfxO5HbJm6buUbTk5GJSJKMznKqTCmXxb3Hc7Snn_1w/pubhtml';
var FIELDS;

window.onload = function() { init() };

function init() {
  Tabletop.init( { key: public_spreadsheet_url,
                   callback: postProcess,
                   simpleSheet: true,
                   debug: true } );
}

function postProcess(data){
  FIELDS = data;
  console.log("FIELDS! ==>", FIELDS);
  processParents();
  drawChart();
}
   
function getField(key){
  return _.findWhere(FIELDS, {"key":key});
}

function processParents(){
  _.each(FIELDS, function(field){
    if( field.parent != "" ){
      var parentField = getField(field.parent);
      if( !parentField ){
        console.log(field.question, "can't find parent:", field.parent);
      } else {
        field.parent = parentField;
        if( _.has(parentField, "children") ){
          parentField.children.push(field);
        } else {
          parentField.children = [field];
        }
      }
    }
  });
}

function drawChart(){
  ulElement = d3.select(".chart").append("ul");
  fieldElements = ulElement.selectAll("li").data(FIELDS).enter()
    .append("li")
    .text(function(d){return d.question;});
}


