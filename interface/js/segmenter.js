/* VIDJIL
 * License blablabla
 * date: 30/05/2013
 * version :0.0.01-a
 * 
 * segmenter.js
 * 
 * segmenter tools
 * 
 * content:
 * 
 * 
 */

var CGI_ADRESS ="http://127.0.0.1/cgi-bin/";
 
/* segment constructor
 * 
 * */   
function Segment(id, model){
  this.id=id;			//ID de la div contenant le segmenteur
  this.m=model;			//Model utilisé
  this.m.view.push(this);	//synchronisation au Model
  this.starPath = "M 0,6.1176482 5.5244193, 5.5368104 8.0000008,0 10.172535,5.5368104 16,6.1176482 11.406183,9.9581144 12.947371,16 8.0000008,12.689863 3.0526285,16 4.4675491,10.033876 z"
  
  
}

Segment.prototype = {
  
/* 
 * 
 * */ 
  init : function(){
  },
  
/*
 * 
 * */   
  resize : function(){
  },
  
/*
 * 
 * */   
  update : function(){
    for (var i=0; i< this.m.n_windows; i++){
      this.updateElem([i]);
    }
  },
  
/*
 * 
 * */   
  updateElem : function(list){
    
    for (var i=0; i< list.length; i++){
      
      if (this.m.clones[list[i]].select){
	if ( document.getElementById("seq"+list[i]) ){
	  
	}else{
	  this.addToSegmenter(list[i]);
	  this.show();
	}
	
      }else{
	if ( document.getElementById("seq"+list[i]) ){
	  var element = document.getElementById("seq"+list[i]);
	  element.parentNode.removeChild(element);
	}
      }
    }
    
  },

/* genere le code HTML des infos d'un clone
 * @div_elem : element HTML a remplir
 * @cloneID : identifiant du clone a décrire
 * */   
  div_elem : function(div_elem, cloneID){

    var self=this;
    div_elem.innerHTML='';
    div_elem.className="listElem";
    div_elem.style.display="block";
    
    var span0 = document.createElement('span');
    span0.className = "nameBox2";
    span0.ondblclick = function(){ self.editName(cloneID, this); }
    span0.onclick = function(){ self.m.select(cloneID); }
    span0.appendChild(document.createTextNode(this.m.getName(cloneID)));
    span0.title = this.m.getName(cloneID);
    span0.style.color=this.m.clones[cloneID].color;
      
    var svg=document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('class','starBox'); 
    svg.onclick=function(){ changeTag(cloneID); }
    var path=document.createElementNS('http://www.w3.org/2000/svg','path')
    path.setAttribute('d', this.starPath);
    path.setAttribute('id','color'+cloneID); 
    if (typeof this.m.clones[cloneID].tag != 'undefined') path.setAttribute("fill", tagColor[this.m.clones[cloneID].tag]);
    else path.setAttribute("fill", colorStyle.c01);
	
    svg.appendChild(path);
      
    var span2=document.createElement('span')
    span2.className = "sizeBox";
    span2.id="size"+cloneID;
    span2.onclick=function(){ this.m.select(cloneID); }
    span2.style.color=this.m.clones[cloneID].color;
      
    span2.appendChild(document.createTextNode(this.m.getStrSize(cloneID)));
      
    var span3=document.createElement('span')
    span3.className = "clusterBox";
    if (this.m.clones[cloneID].cluster.length >1){
      span3.onclick=function(){ showCluster( cloneID )}
      span3.appendChild(document.createTextNode("+"));
    }else{
      span3.appendChild(document.createTextNode(' '));
    }
      
    div_elem.appendChild(span3);
    div_elem.appendChild(span0);
    div_elem.appendChild(svg);
    div_elem.appendChild(span2);
  },
  
  addToSegmenter : function (cloneID){
    var self=this;
    var divParent = document.getElementById("listSeq");
    var li = document.createElement('li');
    li.id="seq"+cloneID;
    li.className="sequence-line";
    li.onmouseover = function(){ self.m.focusIn(cloneID); }
    
    var spanF = document.createElement('span');
    spanF.id = "f"+cloneID;
    this.div_elem(spanF, cloneID);
    spanF.className="seq-fixed";
    spanF.firstChild.nextSibling.class="nameBox2";
    spanF.lastChild.firstChild.id="scolor"+cloneID;

    var spanM = document.createElement('span');
    spanM.id = "m"+cloneID;
    spanM.className="seq-mobil";
    
    if(typeof this.m.windows[cloneID].seg !='undefined' && this.m.windows[cloneID].seg!=0){
    
    var spanV = document.createElement('span');
    spanV.className="V";
    spanV.style.color=this.m.clones[cloneID].colorV;

    var v_seq=this.m.windows[cloneID].seg.sequence.substr(0, this.m.windows[cloneID].seg.l1+1);
    var size_marge=200-v_seq.length;
    if (size_marge>0){
      var marge="";
      for (var i=0; i<size_marge; i++) marge+="&nbsp";
      spanV.innerHTML=marge+v_seq;
    }else{
      spanV.innerHTML=v_seq;
    }

    spanM.appendChild(spanV);
      
    if ( (this.m.windows[cloneID].seg.l1+1 -this.m.windows[cloneID].seg.r1)!=0){
      var spanN = document.createElement('span');
      spanN.className="N";
      spanN.innerHTML=this.m.windows[cloneID].seg.sequence.substring(this.m.windows[cloneID].seg.l1+1, this.m.windows[cloneID].seg.r1);
      spanM.appendChild(spanN);
    }
    
    var spanJ = document.createElement('span');
    spanJ.className="J";
    spanJ.style.color=this.m.clones[cloneID].colorJ;
    spanJ.innerHTML=this.m.windows[cloneID].seg.sequence.substr(this.m.windows[cloneID].seg.r1);
    spanM.appendChild(spanJ);
    }else{
      var size_marge=220-this.m.windows[cloneID].window.length;
      var marge="";
      for (var i=0; i<size_marge; i++) marge+="&nbsp";
      var spanJunc=document.createElement('span');

      spanJunc.innerHTML=marge+this.m.windows[cloneID].window;

      spanM.appendChild(spanJunc);
    }
    
    li.appendChild(spanF);
    li.appendChild(spanM);
    divParent.appendChild(li);
      
  },
  
  sendTo : function(adress){
    
    var list =this.m.getSelected()
    var request = "";

    for (var i = 0; i<list.length; i++){
      if ( typeof(this.m.windows[list[i]].seg) != 'undefined' && this.m.windows[list[i]].seg!=0)
	request += ">" +this.m.getName(list[i])+"\n"+ this.m.windows[list[i]].seg.sequence+"\n";
      else
	request += ">" +this.m.getName(list[i])+"\n"+ this.m.windows[list[i]].window+"\n";
    }

    if (adress=='IMGT') imgtPost(request);
    if (adress=='igBlast') igBlastPost(request);
    
  },
  
  show : function(){
    var li =document.getElementById("listSeq").getElementsByTagName("li");
    if (li.length >0){
      var id=li[0].id.substr(3);
      var mid=$("#m"+id+" span:first-child").width()-250;
      $("#bot-container").animate({scrollLeft: mid}, 500);
    }
  }
  
  
}//fin prototype


  
 
  
  //TODO repasser en local
  var memTab=[];
  function align(){
   
    var li =document.getElementById("listSeq").getElementsByTagName("li");
    var request = "";
    memTab=[];
    
    for (var i = 0; i<li.length; i++){
      var id =li[i].id.substr(3);
      memTab[i]=id;
      if ( typeof(jsonData.windows[id].seg) != 'undefined' && jsonData.windows[id].seg!=0)
	request += ">" +id+"\n"+ jsonData.windows[id].seg.sequence+"\n";
      else
	request += ">" +id+"\n"+ jsonData.windows[id].window+"\n";
    }
    
    
    $.ajax({
	type: "POST",
	data : request,
	url: CGI_ADRESS+"align.cgi",
	success: function(result) {
	    displayAjaxResult(result);
	}
    });
  }
  
  function displayAjaxResult(file){
    

    var json=JSON.parse(file)
    
    for (var i = 0 ; i< json.seq.length; i++ ){
      colorSeq(memTab[i], json.seq[i]);
    }
    
    displayAlign();
    
  }
  
  function colorSeq(cloneID, seq){
    
    var spanM = document.getElementById("m"+cloneID);
    spanM.innerHTML="";
    
    if(typeof windows[cloneID].seg !='undefined' && windows[cloneID].seg!=0){
      
      var newl1=getNewPosition(seq,windows[cloneID].seg.l1)
      var newr1=getNewPosition(seq,windows[cloneID].seg.r1)
    
    var spanV = document.createElement('span');
    spanV.className="V";
    spanV.style.color=colorV(cloneID);
    
    spanV.innerHTML=seq.substr(0, newl1+1);
    spanM.appendChild(spanV);
      
    if ( (newl1 - newr1)!=0){
      var spanN = document.createElement('span');
      spanN.className="N";
      spanN.innerHTML=seq.substring(newl1+1, newr1);
      spanM.appendChild(spanN);
    }
    
    var spanJ = document.createElement('span');
    spanJ.className="J";
    spanJ.style.color=colorJ(cloneID);
    spanJ.innerHTML=seq.substr(newr1);
    spanM.appendChild(spanJ);
    }else{
      var spanJunc=document.createElement('span');
      spanJunc.innerHTML=seq;
      spanM.appendChild(spanJunc);
    }
    
  }
  
  function getNewPosition(seq, oldPos){
    var k=0;
    
    for (var i = 0 ; i < seq.length ; i++){
      if (seq[i]!='-') k++;
      if (k==oldPos) return i;
    }
    
  }
  
/*
 //affiche le segmenteur/comparateur
 function displayAlign(){
    $('#bot-container').animate({ width: "100%"}, 200 ); 
    
    var li =document.getElementById("listSeq").getElementsByTagName("li");
    if (li.length >0){
      var id=li[0].id.substr(3);
      var mid=$("#m"+id+" span:first-child").width()-250;
      $("#bot-container").animate({scrollLeft: mid}, 500);
    }
  }
  
  //masque le segmenteur/comparateur ( 
  function hideAlign(){
    hideSelector();
    $('#bot-container').stop();
    $('#bot-container').animate({ width: "400px"}, 200 ); 
  }
  */