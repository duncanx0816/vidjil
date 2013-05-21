
 /* ne marche pas en local (securité)
 * chargement Json
var req = new XMLHttpRequest();
  req.open("GET", "data.Json", true); 
  req.onreadystatechange = getData; 
  req.send(null); 
 
  function getData() 
  { 
    if (req.readyState == 4) 
    { 
      var jsonData = eval('(' + req.responseText + ')'); 
    }
  }
*/

oFReader = new FileReader();

function loadJson() {
  if (document.getElementById("upload").files.length === 0) { return; }
  var oFile = document.getElementById("upload").files[0];
  oFReader.readAsText(oFile);
}

oFReader.onload = function (oFREvent) {
  jsonDataText = oFREvent.target.result;
  jsonData = JSON.parse(jsonDataText);
  document.getElementById("log").innerHTML+="<br>chargement fichier json";
  initVJposition();
  document.getElementById("log").innerHTML+="<br>calcul des positions VJ";
  initClones(jsonData);
  document.getElementById("log").innerHTML+="<br>génération des clones";
  initTimeBar();
  document.getElementById("log").innerHTML+="<br>initialisation timebar";
  initCoef();
  document.getElementById("log").innerHTML+="<br>initialisation coef";
  updateVis();
  force.start();
  updateLook();
  document.getElementById("log").innerHTML+="<br>start visu";
  $("#log").scrollTop(100000000000000);
};

var jsonData
var sizeMap=100; 
var w = 1400,
    h = 700,
    padding = 5,
    fill = d3.scale.category10(),
    nodes = d3.range(sizeMap).map(Object),
    t = 0,
    drag=0;
    
  var colorMethod="V"
  var useCustomColor=false;
  var customColor = [];
    

//
function initClones(data) {
  var divParent = document.getElementById("listJ");
  divParent.innerHTML="";

   for(var i=0 ;i<sizeMap; i++){
     
      var n = [i]
      nodes[i].r1 = 5;
      nodes[i].r2 = 5;
      nodes[i].clones = n;
      nodes[i].focus = false;
      
      var div = document.createElement('div');
      div.id=i;
      div.className="listElem";
      div.onmouseover = function(){ focusIn(this.id, 0); }
      div.onmouseout= function(){ focusOut(this.id); }
      div.onclick=function(){ addToSegmenter(this.id); }
      
      var span = document.createElement('span');
      span.className = "spancolor";
      div.onclick=function(){ changeColor(this.id); }
      
      divParent.appendChild(div);
      if ( typeof(jsonData[i].seg)!='undefined' && typeof(jsonData[i].seg.name)!='undefined' ){
	document.getElementById(i).innerHTML=jsonData[i].seg.name
      }else{
	document.getElementById(i).innerHTML=jsonData[i].junction;
      }
      document.getElementById(i).appendChild(span);
     document.getElementById(i).style.background=color(i);
    }
}

//ajoute les boutons de changement de point de suivi
function initTimeBar(){
    var divParent = document.getElementById("timebar");
    divParent.innerHTML="";
    for(var i=0 ;i<jsonData[0].size.length; i++){
      var a = document.createElement('a');
      a.time=i;
      a.id="test";
      a.className="button";
      a.onclick= function(){ changeT(this.time); }
      a.innerHTML="Time "+i;
      divParent.appendChild(a);
    }
}

resizeCoef = 1

window.onresize = initCoef;
function initCoef(){
 
  var resizeW = document.getElementById("visu").offsetWidth/w;
  var resizeH = document.getElementById("visu").offsetHeight/h;
  document.getElementById("svg").style.width=document.getElementById("visu").offsetWidth+"px";
  document.getElementById("svg").style.height=document.getElementById("visu").offsetHeight+"px";
  
  resizeCoef = resizeW
  
  if (method!=0)
  updateLegend();
  
  tick();

  document.getElementById("log").innerHTML+="<br>resize (new coef : "+resizeCoef+")";
  $("#log").scrollTop(100000000000000);

};

var leg, lines;

function displayLegend(data){
  leg = vis.selectAll("text").data(data);
  leg.enter().append("text");
  leg.exit()
    .remove();
  leg
    .transition()
    .duration(1000)
    .attr("x", function(d) { 
      if (d.cx<5) return resizeCoef*(d.cx+20);
      else return resizeCoef*d.cx;
    })
    .attr("y", function(d) { 
      if (d.cy<5) return resizeCoef*(d.cy+20);
      else return resizeCoef*d.cy;
    })
    .text( function (d) { return d.label; })
    .attr("class", "vjLegend")
    .attr("fill", function (d) { return colorVJ[d.label]; });
    
  lines = vis.selectAll("line").data(data);
  lines.enter().append("line");
  lines.exit()    
    .remove();
  lines
    .transition()
    .duration(1000)
    .attr("x1", function(d) { return resizeCoef*d.cx; })
    .attr("x2", function(d) { 
      if (d.cx<5) return 5000;
      else return resizeCoef*d.cx;
    })
    .attr("y1", function(d) { return resizeCoef*d.cy; })
    .attr("y2", function(d) { 
      if (d.cy<5) return 5000;
      else return resizeCoef*d.cy;
    })
    .style("stroke", function (d) { return colorVJ[d.label]; })
    .attr("class", function (d) { return d.class; });
}

function updateLegend(){
  leg
    .attr("x", function(d) { 
      if (d.cx<5) return resizeCoef*(d.cx+20);
      else return resizeCoef*d.cx;
    })
    .attr("y", function(d) {
      if (d.cy<5) return resizeCoef*(d.cy+20);
      else return resizeCoef*d.cy;
    });
  lines
    .attr("x1", function(d) { return resizeCoef*d.cx; })
    .attr("x2", function(d) { 
      if (d.cx==0) return 5000;
      else return resizeCoef*d.cx;
    })
    .attr("y1", function(d) { return resizeCoef*d.cy; })
    .attr("y2", function(d) { 
      if (d.cy==0) return 5000;
      else return resizeCoef*d.cy;
    });
}
/***************
 * Variable VJ *
 ***************/

//dégradé de couleur germline V
var colorV_begin=[255,241,22];
var colorV_end=[193,17,118];

//dégradé de couleur germline J
var colorJ_begin=[199,22,219];
var colorJ_end=[18,211,211];
var colorVJ={};

//position quadrillage
var margeVJ=140;
var stepVJ=120;

var method=0;
var positionV={};
var positionJ={};
var vjData=[];

var positionV2={};
var positionJ2={};
var vjData2=[];

function initVJposition(){
  
  var sizeV=0;
  var sizeJ=0;
  var vmap=[];
  var jmap=[];
  var n=0;
  
  for(var i=0 ;i<sizeMap; i++){

    if ( typeof(jsonData[i].seg) != 'undefined' && typeof(jsonData[i].seg.V) != 'undefined' ){
      if (typeof( positionV[jsonData[i].seg.V[0]] ) == 'undefined'){	
	vmap[sizeV]=jsonData[i].seg.V[0];
	sizeV++;
	positionV[jsonData[i].seg.V[0]]=0;
      }
       if (typeof( positionJ[jsonData[i].seg.J[0]] ) == 'undefined'){
	jmap[sizeJ]=jsonData[i].seg.J[0];
	sizeJ++;
	positionJ[jsonData[i].seg.J[0]]=0;
      }
    }
  }
  
  vmap.sort();
  jmap.sort();
  
  for (var i=0; i<sizeV; i++){
    colorVJ[vmap[i]]="rgb("+Math.floor((colorV_begin[0]+(i/sizeV)*(colorV_end[0]-colorV_begin[0] )))+
			","+Math.floor((colorV_begin[1]+(i/sizeV)*(colorV_end[1]-colorV_begin[1] )))+
			","+Math.floor((colorV_begin[2]+(i/sizeV)*(colorV_end[2]-colorV_begin[2] )))+")";
    
    positionV[vmap[i]]=margeVJ+i*stepVJ;
    vjData[n]={};
    vjData[n].cx=margeVJ+i*stepVJ;
    vjData[n].cy=0;
    vjData[n].class="vjline1";
    vjData[n].label=vmap[i];
    n++;
  }
  
  for (var i=0; i<sizeJ; i++){
    colorVJ[jmap[i]]="rgb("+Math.floor((colorJ_begin[0]+(i/sizeJ)*(colorJ_end[0]-colorJ_begin[0] )))+
			","+Math.floor((colorJ_begin[1]+(i/sizeJ)*(colorJ_end[1]-colorJ_begin[1] )))+
			","+Math.floor((colorJ_begin[2]+(i/sizeJ)*(colorJ_end[2]-colorJ_begin[2] )))+")";
			
    positionJ[jmap[i]]=margeVJ+i*stepVJ;
    vjData[n]={};
    vjData[n].cx=0;
    vjData[n].cy=margeVJ+i*stepVJ;
    vjData[n].class="vjline1";
    vjData[n].label=jmap[i];
    n++;
  }
  
  var tmp="";
  var n2=-1;
  n=-1;
  
  for (var i=0; i<sizeV; i++){
    var elem = vmap[i].split('*')[0];
    n++;
    if (elem!=tmp){
      tmp=elem;
      n2++
      vjData2[n]={};
      vjData2[n].cx=margeVJ+n2*stepVJ;
      vjData2[n].cy=0;
      vjData2[n].label=elem;
      vjData2[n].class="vjline1";
    }else{
      vjData2[n]={};
      vjData2[n].cx=margeVJ+n2*stepVJ;;
      vjData2[n].cy=0;
      vjData2[n].label=elem;
      vjData2[n].class="vjline2";
      vjData[n].class="vjline2";
    }
    positionV2[vmap[i]]=margeVJ+n2*stepVJ;
  }
  
  for (var i=0; i<=n; i++){
    colorVJ[vjData2[i].label]="rgb("+Math.floor((colorV_begin[0]+(i/n)*(colorV_end[0]-colorV_begin[0] )))+
			","+Math.floor((colorV_begin[1]+(i/n)*(colorV_end[1]-colorV_begin[1] )))+
			","+Math.floor((colorV_begin[2]+(i/n)*(colorV_end[2]-colorV_begin[2] )))+")";
			
  }
  n2=-1;
  for (var i=0; i<sizeJ; i++){
    var elem = jmap[i].split('*')[0];
    n++;
    if (elem!=tmp){
      tmp=elem;
      n2++
      vjData2[n]={};
      vjData2[n].cx=0;
      vjData2[n].cy=margeVJ+n2*stepVJ;
      vjData2[n].label=elem;
      vjData2[n].class="vjline1";
    }else{
      vjData2[n]={};
      vjData2[n].cx=0;
      vjData2[n].cy=margeVJ+n2*stepVJ;
      vjData2[n].label=elem;
      vjData2[n].class="vjline2";
      vjData[n].class="vjline2";
    }
    positionJ2[jmap[i]]=margeVJ+n2*stepVJ;
  }
  
  for (var i=0; i<=n2; i++){
    colorVJ[vjData2[i+n-n2].label]="rgb("+Math.floor((colorJ_begin[0]+(i/n2)*(colorJ_end[0]-colorJ_begin[0] )))+
			","+Math.floor((colorJ_begin[1]+(i/n2)*(colorJ_end[1]-colorJ_begin[1] )))+
			","+Math.floor((colorJ_begin[2]+(i/n2)*(colorJ_end[2]-colorJ_begin[2] )))+")";
  }
  
}

//renvoye la taille d'un clone ( somme des tailles des jonctions qui le compose)
function getSize(cloneID){
  var r=0;
  for(var j=0 ;j<nodes[cloneID].clones.length; j++){
    r += jsonData[nodes[cloneID].clones[j]].size[t];}
  return r;
}


function focusIn(cloneID, move){
  nodes[cloneID].focus = true;
  if (move==1) {
    $('#listJ').stop();
    var p = $("#"+cloneID);
    var position = p.position();
    var position2 = $('#listJ').scrollTop();
    document.getElementById("log").innerHTML+="<br>"+position2;
    $('#listJ').animate({scrollTop: position2+position.top-235}, 500);
  }
  updateLook();
  document.getElementById(cloneID).style.border='white';
  document.getElementById(cloneID).style.borderStyle='solid';
  document.getElementById(cloneID).style.padding='0px';
  document.getElementById(cloneID).style.color='white';

  document.getElementById("log").innerHTML+="<br>[element id "+cloneID+" / "+jsonData[cloneID].junction+"] focus on // size = "+getSize(cloneID);
  $("#log").scrollTop(100000000000000);
}


function focusOut(cloneID){
  nodes[cloneID].focus = false;
  document.getElementById(cloneID).style.border='';
  document.getElementById(cloneID).style.borderStyle='';
  document.getElementById(cloneID).style.padding='';
  document.getElementById(cloneID).style.color='';
  
  updateLook();
}

//ajoute la jonction b (ou le clone lead par la jonction b) dans le clone lead par a// TODO(gerer les cas speciaux)
function merge(a, b){
  var nlist = nodes[a].clones+nodes[b].clones;
  nodes[a].clones = nlist;
  nodes[b].clones=[];
}

//libere la jonction b du clone lead par a TODO
function split(a, b){
  if (a==b) return
    
  for(var i=0 ;i<nodes[a].clones.length; i++){
    if (nodes[a].clones[i] == b) return
  }
  
}
/*
//custom drag
var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
 
    function dragstart(d, i) {
      d.drag=1;
    }
 
    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
	force.alpha(.2);
    }
 
    function dragend(d, i) {
      d.drag=0;
      force.alpha(.2);
    }
    */

//initialisation du cadre
var vis = d3.select("#visu").append("svg:svg")
    .attr("id", "svg");

//initialisation du modele physique
var force = d3.layout.force()
    .gravity(0)
    .theta(0.8)
    .charge(-1)
    .friction(0.9)
    .nodes(nodes)
    .on("tick", tick)
    .size([w, h]);

//initialisation des nodes
var node = vis.selectAll("circle.node")
    .data(nodes)
    .enter().append("svg:circle")
    .attr("class", "node")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("stroke", "")
    .attr("stroke-width", 3) 
    .attr("r", 5)
    .call(force.drag)
    //.call(node_drag)
    .on("click", function(d,i) { 
      addToSegmenter(i);
    })
    .on("mouseover", function(d,i){
      focusIn(i, 1);
    })
     .on("mouseout", function(d,i){
      focusOut(i);
    })
;

//fonction effectué 30x par seconde
function tick(e) {
    updateRadius()
    if (method!=0){
      node.each(vjSplit());
    }
    else {
      node.each(sizeSplit());
    }
    node
      .each(collide())
      .attr("cx", function(d) { return (resizeCoef*d.x); })
      .attr("cy", function(d) { return (resizeCoef*d.y); })
      .attr("r" , function(d) { return (resizeCoef*d.r2); })
}

//mise a jour progressive des radius (evite les problemes physiques liés a des changements de taille brutaux)
function updateRadius(){
    for(var i=0 ;i<nodes.length; i++){
      if( nodes[i].r1 != nodes[i].r2){
	var delta = nodes[i].r1-nodes[i].r2;
	nodes[i].r2 +=0.03*delta;
      }
    }
}

//méthode de répartition des clones en fonction des genes V et J
function vjSplit(){
    var coef = 0.005
    return function(d) {
      if (typeof jsonData != "undefined") {
      if ( typeof(jsonData[d].seg) != 'undefined' && typeof(jsonData[d].seg.V) != 'undefined' ){
	if (method==1){
	  d.x+=coef*(positionV[jsonData[d].seg.V[0]]-d.x);
	  d.y+=coef*(positionJ[jsonData[d].seg.J[0]]-d.y);
	}else{
	  d.x+=coef*(positionV2[jsonData[d].seg.V[0]]-d.x);
	  d.y+=coef*(positionJ2[jsonData[d].seg.J[0]]-d.y);
	} 
      }else{
	d.y+=coef*(50-d.y);
	d.x+=coef*(50-d.x);
      }
      }
    };
}

//méthode de répartition des clones en fonction du radius
function sizeSplit() {
  var coef = 0.006
    return function(d) {
      var r=getSize(d);
      if (d.drag != 1){
	if (r < 50){
	  d.x+=coef*(100-d.x);
	  d.y+=coef*(100-d.y);
	}else{
	  if (r < 200){
	      d.x+=coef*(550-d.x);
	      d.y+=coef*(250-d.y);
	  }else{
	      d.x+=coef*(950-d.x);
	      d.y+=coef*(400-d.y);
	  }
	}
      }
    };
}

//résolution des collisions
function collide() {
  var quadtree = d3.geom.quadtree(nodes);
  return function(d) {
   if (d.drag != 1){
    var r = nodes[d].r2+padding,
        nx1 = d.x - r,
        nx2 = d.x + r,
        ny1 = d.y - r,
        ny2 = d.y + r;
	//document.getElementById("log").innerHTML+=radius(d)+"/";
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y),
            r = nodes[d].r2 + nodes[quad.point].r2+padding;
        if (l < r) {
          l = (l - r) / l*0.5;
          d.x -= x *= l;
          d.y -= y *= l;
	  if(quad.point.drag!=1) {
	    quad.point.x += x;
	    quad.point.y += y;
	  }
        }
      }
      return x1 > nx2
          || x2 < nx1
          || y1 > ny2
          || y2 < ny1;
    });
   }
  };
}

//changement de point de suivi
function changeT(nt){
  t=nt;
  document.getElementById("log").innerHTML+="<br>changement de point de suivi > "+nt;
  $("#log").scrollTop(100000000000000);
  updateVis();
  updateLook();
  for(var i=0 ;i<sizeMap; i++){
    document.getElementById(i).style.background=color(i);
  }
}

//mise a jour de la visualisation
function updateVis(){
  for(var i=0 ;i<sizeMap; i++){
    nodes[i].r1=radius(i);
  }
  vis.selectAll("circle.node")
      .style("fill", function(i) { return color(i); })
  force.alpha(.2);
}

function updateLook(){
  node
  .transition()
  .duration(1500)
  .style("fill", function(i) { return color(i); } )
  node.style("stroke", function(i) { return stroke(i); } )
  for(var i=0 ;i<sizeMap; i++){
    document.getElementById(i).style.background=color(i);
  }
}

//retourne le rayon du clone passé en parametre
function radius(cloneID) {
  if (typeof jsonData != "undefined") {
    var r=getSize(cloneID);
    return 1.5*Math.sqrt(r);
  }
}

function changeColorMethod(method){
  colorMethod=method;
  document.getElementById("log").innerHTML+="<br>change ColorMethod >> "+ method;
  $("#log").scrollTop(100000000000000);
  updateLook();
}

function toggleCustomColor(){
  if (useCustomColor==true) {
    useCustomColor=false;
    document.getElementById("log").innerHTML+="<br>stop customColor";
    $('#log').scrollTop(100000000000000);
  }else{
    useCustomColor=true;
    document.getElementById("log").innerHTML+="<br>active customColor";
    $('#log').scrollTop(100000000000000);
  }
  updateLook();
}

//retourne la couleur du clone passé en parametre
  function color(cloneID) {
    if (typeof jsonData != "undefined") {
      
      if( useCustomColor==true){
	if (typeof customColor[cloneID] != "undefined"){
	  return customColor[cloneID]
	}
      }
	
      if (colorMethod=='V'){
	return colorV(cloneID)
      }
      if (colorMethod=='J'){
	return colorJ(cloneID)
      }
      return colorSize(cloneID);
    }
  }
  
var tmpID
function changeColor(cloneID){
  document.getElementById("log").innerHTML+="<br>"+cloneID;
  tmpID=cloneID;
  document.getElementById('colorSelector').style.display='block';
   $('#colorSelector').ColorPicker({
	flat:true,

	onSubmit: function(hsb, hex, rgb, el) {
		$(el).val(hex);
		document.getElementById('colorSelector').style.display='none';
		customColor[tmpID]="#"+hex;
		document.getElementById("log").innerHTML+="<br>"+tmpID+"//"+customColor[tmpID];
		$('#log').scrollTop(100000000000000);
		updateLook();
	}
  })
}

     
  function colorV(cloneID){
    	if (typeof jsonData[cloneID].seg !="undefined" ){
	  return colorVJ[jsonData[cloneID].seg.V[0]];
	}	
	return "rgb(20,226,89)"
  }
  
  function colorJ(cloneID){
	if (typeof jsonData[cloneID].seg !="undefined" ){
	  return colorVJ[jsonData[cloneID].seg.J[0]];
	}	
	return "rgb(20,226,89)"
  }
  
  function colorSize(cloneID){
    var r=getSize(cloneID) / 2;
    return "rgb("+Math.floor(r)+",200,200)"
  }
  
  
//retourne la couleur de la bordure du clone passé en parametre
  function stroke(cloneID) {
    if (nodes[cloneID].focus==true)
      return "white";
    return '';
  }
  

//change la methode de répartition des clones dans la visualisation
  function changeSplitMethod(m){
    
    if (m==" "){ 
      method=0;
      displayLegend([]);
      document.getElementById("log").innerHTML+="<br>active sizeSplit";
      $('#log').scrollTop(100000000000000);
    }
    if (m=="vj1"){ 
      method=1;
      displayLegend(vjData);
      document.getElementById("log").innerHTML+="<br>active vjSplit1";
      $('#log').scrollTop(100000000000000);
    }
    if (m=="vj2"){ 
      method=2;
      displayLegend(vjData2);
      document.getElementById("log").innerHTML+="<br>active vjSplit2";
      $('#log').scrollTop(100000000000000);
    }
    force.alpha(.2);
  }
  