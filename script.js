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
   
function getField(slug){
  return _.findWhere(FIELDS, {"slug":slug});
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
          parentField.children = [];
          parentField.children.push(field);
        }
      }
    }
  });
}

function getParents(field){
  var parents = [];
  var parent_to_check = true;
  while (parent_to_check) {
    if( field.parent && field.parent != "" ){
      // add parent
      parents.push(field.parent);
      // set new field
      field = field.parent;
    } else {
      parent_to_check = false
    }
  }
  return parents.reverse();
}

function selectParentDiv(d){
  return d3.select("#"+d.parents[0].slug);
}

function drawChart(){

  var parentFields = FIELDS.filter(function(d){ return d.children; });

  var tree = d3.layout.tree().nodeSize([0,3]);
  var root = {
    "id": 0,
    "question": "All Questions with Dependencies",
    "slug": "all_dependencies",
    "children": parentFields
  };
  var nodes = tree.nodes(root);
  var entryDiv = d3.select(".chart");
  var nodeDivs = entryDiv.selectAll("div.node")
    .data(nodes, function(d, i) { return d.id; })
    .enter().append("div").attr("class", function(d){
      return "node status-"+d.status;
    })
    .attr("id", function(d){ return d.slug; })
    .style("padding-left", function(d){
      return (getParents(d).length * 2) + "rem";
    });
  nodeDivs.append("span").attr("class", "slug").text(function(d){ 
      return d.slug; 
    });
  nodeDivs.append("span").attr("class", "question").text(function(d){
    return '“'+d.question+'”';
  });
  nodeDivs.on("mouseenter", function(d,i){
    d3.select("#"+d.parent.slug)
      .append("span").attr("class", "condition-note")
      .text(d.condition);
  }).on("mouseleave", function(d){
    d3.selectAll( "#"+d.parent.slug+" .condition-note")
      .remove();
  });

/*
  var fieldElements = ulElement.selectAll("li").data(
    ).append("li")
    .attr("class", function(d){
      return "status-" + d["status"];
    });


  fieldElements.append("span")
    .attr("class", "question")
    .text(function(d){return "“"+d.question+"”";});

  fieldElements.append("span")
    .attr("class", "slug")
    .text(function(d){return d.slug;});

  fieldElements.selectAll(".parent")
    .data(function(d){ return getParents(d);}).enter()
    .insert("span", ":first-child")
    .attr("class", "parent")
    .text("◤");

  fieldElements.append("span")
    .attr("class", "children")
    .text(function(d){
      if( d.children && d.children.length > 0 ){
        return "◢";
      }
    })
    */

}


