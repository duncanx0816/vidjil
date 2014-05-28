function Builder(model) {
    this.m = model; //Model utilisé
    this.m.view.push(this); //synchronisation au Model

    this.colorMethod = "";
    this.point = 0;

    this.drag_separator = false
}

//TODO need a reset function

Builder.prototype = {

    init: function () {
        var self = this;
        this.width_left_container = $("#left-container")
            .css("width")

        d3.select("#visu-separator")
            .on("mousedown", function () {
                self.dragSeparator()
            })
        d3.select("#visu-container")
            .on("mouseup", function () {
                self.dropSeparator()
            })
        d3.select("#visu-container")
            .on("mousemove", function () {
                self.updateSeparator()
            })
        $("#vertical-separator")
            .click(function () {
                self.toggle_left_container()
            });

        this.build_tagSelector()
        this.build_displaySelector()
        this.build_info_container()
        this.build_clusterSelector()
    },

    update: function () {

            this.build_info_container()

    },
    
    updateElem: function () {},

    updateElemStyle: function () {},

    resize: function () {},

    dragSeparator: function () {
        this.drag_separator = true;
        console.log("drag");
    },

    updateSeparator: function () {
        if (this.drag_separator) {
            var coordinates = [0, 0];
            coordinates = d3.mouse(d3.select("#visu-container")
                .node());

            var position = coordinates[1]
            var total_height = document.getElementById("visu-container")
                .offsetHeight;

            if (position < 2 || total_height - position < 2) this.dropSeparator()

            var height2 = position / total_height * 100
            if (height2 > 90) height2 = 100;
            if (height2 < 10) height2 = 0;

            var height1 = 100 - height2

            document.getElementById("visu")
                .style.height = height1 + "%"
            document.getElementById("visu2")
                .style.height = height2 + "%"

            console.log("update");
        }
    },

    dropSeparator: function () {
        if (this.drag_separator) {
            this.m.resize();
            this.drag_separator = false;

            var sel = window.getSelection();
            sel.removeAllRanges();

            console.log("drop");
        }
    },

    /*complete tagSelector html element with correct info about current tagname
     * */
    build_tagSelector: function () {
        var self = this;

        var tagSelector = document.getElementById("tagSelector")
        var listTag = tagSelector.getElementsByTagName("ul")[0]

        //reset
        listTag.innerHTML = "";

        for (var i = 0; i < tagName.length; i++) {
            (function (i) {
                var span3 = document.createElement('span');
                span3.onclick = function (tag) {
                    self.editTagName(i, this);
                }
                span3.className = "edit_button"
                span3.appendChild(document.createTextNode("..."))

                var span1 = document.createElement('span');
                span1.className = "tagColorBox tagColor" + i
                span1.onclick = function () {
                    var cloneID = parseInt(document.getElementById('tag_id').innerHTML);
                    self.m.changeTag(cloneID, i)
                    $('#tagSelector').hide('fast')
                }
                
                var span2 = document.createElement('span');
                span2.className = "tagName" + i + " tn"
                span2.onclick = function () {
                    var cloneID = parseInt(document.getElementById('tag_id').innerHTML);
                    self.m.changeTag(cloneID, i)
                    $('#tagSelector').hide('fast')
                }

                var div = document.createElement('div');
                div.className = "tagElem"
                div.appendChild(span1)
                div.appendChild(span2)
                div.appendChild(span3)

                var li = document.createElement('li');
                li.appendChild(div)

                listTag.appendChild(li);
            })(i)
        }
        


        var span1 = document.createElement('span');
        span1.appendChild(document.createTextNode("expected size : "))

        var span2 = document.createElement('span');
        var input = document.createElement('input');
        input.type = "number";
        input.step = "0.0001"
        input.id = "normalized_size";
        
        span2.appendChild(input)
        
        var span3 = document.createElement('button');
        span3.appendChild(document.createTextNode("ok"))
        span3.onclick = function () {
            var cloneID = parseInt(document.getElementById('tag_id')
                .innerHTML);
            var size = parseFloat(document.getElementById('normalized_size').value);
            
            if (size>0 && size<1){
                document.getElementById('normalized_size').value = ""
                self.m.norm = true
                self.m.compute_normalization(cloneID, size)
                self.m.update()
                $('#tagSelector')
                    .hide('fast')
            }else{
                popupMsg("expected input between 0.0001 and 1")
            }
            
        }
        
        var div = document.createElement('div');
        div.appendChild(span1)
        div.appendChild(span2)
        div.appendChild(span3)
        
        var li = document.createElement('li');
        li.appendChild(div)

        listTag.appendChild(li);
    },

    /* 
     * */
    editTagName: function (tagID, elem) {
        var self = this;
        var divParent = elem.parentNode;
        divParent.innerHTML = "";

        var input = document.createElement('input');
        input.type = "text";
        input.id = "new_tag_name";
        input.value = tagName[tagID];
        input.style.width = "100px";
        input.style.border = "0px";
        input.style.margin = "0px";
        input.onkeydown = function () {
            if (event.keyCode == 13) document.getElementById('btnSaveTag')
                .click();
        }
        divParent.appendChild(input);
        divParent.onclick = "";

        var a = document.createElement('a');
        a.className = "button";
        a.appendChild(document.createTextNode("save"));
        a.id = "btnSaveTag";
        a.onclick = function () {
            console.log("hello")
            var newTagName = document.getElementById("new_tag_name")
                .value;
            tagName[tagID] = newTagName
            self.build_tagSelector()
            self.build_displaySelector()
        }
        divParent.appendChild(a);
        $('#new_tag_name')
            .select();
    },

    /* 
     * */
    edit: function (elem, data) {
        var self = this;
        var divParent = elem.parentNode;
        divParent.innerHTML = "";

        var input = document.createElement('input');
        input.type = "text";
        input.id = "edit_value";
        input.value = self.m[data][self.point];
        input.style.width = "200px";
        input.style.border = "0px";
        input.style.margin = "0px";
        input.onkeydown = function () {
            if (event.keyCode == 13) document.getElementById('btnSave')
                .click();
        }
        divParent.appendChild(input);
        divParent.onclick = "";

        var a = document.createElement('a');
        a.className = "button";
        a.appendChild(document.createTextNode("save"));
        a.id = "btnSave";
        a.onclick = function () {
            self.m[data][self.point] = document.getElementById("edit_value").value
            self.build_info_container()
            self.m.update()
        }
        divParent.appendChild(a);
        $('#edit_value')
            .select();
    },

    /*complete displaySelector menu with correct info about current tagname / top
     * */
    build_displaySelector: function () {
        var self = this;

        var displaySelector = document.getElementById("displaySelector")
        var listTag = displaySelector.getElementsByTagName("ul")[0]
        var listSystem = document.getElementById("system_list")
        
        //reset
        listTag.innerHTML = "";
        listSystem.innerHTML = "";

        //init tag list
        for (var i = 0; i < tagName.length; i++) {
            (function (i) {
                var span3 = document.createElement('span');
                span3.onclick = function (tag) {
                    self.editTagName(i, this);
                }
                span3.className = "edit_button"
                span3.appendChild(document.createTextNode("..."))

                var span1 = document.createElement('span');
                span1.className = "tagColorBox tagColor" + i

                var span2 = document.createElement('span');
                span2.className = "tagName" + i + " tn"

                var div = document.createElement('div');
                div.className = "tagElem"
                div.id = "tagDisplay" + i
                div.onclick = function () {
                    nextDisplayTag(this)
                }
                div.appendChild(span1)
                div.appendChild(span2)
                div.appendChild(span3)

                var li = document.createElement('li');
                li.appendChild(div)

                listTag.appendChild(li);
            })(i)
        }

        //init slider
        var max_top = 0;
        for (var i = 0; i < this.m.windows.length; i++) {
            if (this.m.windows[i].top > max_top)
                max_top = this.m.windows[i].top
        }
        max_top = (Math.ceil(max_top / 5)) * 5
        document.getElementById("top_slider")
            .max = max_top;
            
        //init notation
        if (this.m.notation_type == "scientific") {
            document.getElementById("notation").checked = true
        }
        
        //init system
        if (this.m.system == "multi") {
            $("#system_menu").css("display", "")
            $("#color_system_button").css("display", "")
            
            for (var key in this.m.system_segmented) {
                
                var checkbox=document.createElement("input");
                    checkbox.type="checkbox";
                    checkbox.id = "checkbox_system_"+key
                    checkbox.appendChild(document.createTextNode(key))
                    checkbox.checked=true
                    checkbox.onchange = function () {
                        m.update_selected_system()
                    }
                    
                var div = document.createElement('div');
                div.appendChild(checkbox)
                div.appendChild(document.createTextNode(key))
                
                var li = document.createElement('li');
                li.appendChild(div)

                listSystem.appendChild(li);
                
            }
             
        }else{
            $("#system_menu").css("display", "none")
            $("#color_system_button").css("display", "none")
        }

        initTag();
    },
    
    //TODO need to build complete Selector 
    build_clusterSelector: function () {
        var self = this;

        var clusterSelector = document.getElementById("clusterby_button")
        clusterSelector.innerHTML = "";
        
        if (self.m.windows[0]._target){
        
            var target = document.createElement('a');
                target.className = "buttonSelector"
                target.onclick = function () { self.m.clusterBy('_target')}
                target.appendChild(document.createTextNode("target"));
            clusterSelector.appendChild(target)
            
            var targetV = document.createElement('a');
                targetV.className = "buttonSelector"
                targetV.onclick = function () { self.m.clusterBy('_target.V-GENE')}
                targetV.appendChild(document.createTextNode("target V"));
            clusterSelector.appendChild(targetV)
            
            var targetJ = document.createElement('a');
                targetJ.className = "buttonSelector"
                targetJ.onclick = function () { self.m.clusterBy('_target.J-GENE')}
                targetJ.appendChild(document.createTextNode("target J"));
            clusterSelector.appendChild(targetJ)
            
            var clonotype = document.createElement('a');
                clonotype.className = "buttonSelector"
                clonotype.onclick = function () { self.m.clusterBy('_clonotype')}
                clonotype.appendChild(document.createTextNode("clonotype"));
            clusterSelector.appendChild(clonotype)
        }
        
        if (self.m.windows[0].system){
            
            var system = document.createElement('a');
                system.className = "buttonSelector"
                system.onclick = function () { self.m.clusterBy('system')}
                system.appendChild(document.createTextNode("system"));
            clusterSelector.appendChild(system)
        }
    },

    toggle_left_container: function () {
        var self = this
        elem = $("#left-container")

        if (elem.css("width") == "0px") {
            elem.css("display", "")
                .animate({
                    width: self.width_left_container
                }, 400, function () {
                    self.m.resize();
                })
        } else {
            elem.animate({
                width: "0px"
            }, 400, function () {
                $(this).css("display", "none")
                self.m.resize();
            })
        }
    },

    toggle_segmenter: function () {
        var self = this
        seg = $("#segmenter")
        bot = $("#bot-container")
        mid = $("#mid-container")

        if (seg.css("display") == "none") {
            seg.css("display", "")
            seg.css("overflow-x", "scroll")
            bot.animate({
                height: "125px"
            }, 400, function () {
                //$("#toggle-segmenter").html("+ + +")
            })
            mid.animate({
                bottom: "125px"
            }, 400, function () {
                self.m.resize();
            })
        } else {
            seg.css("display", "none")
            seg.css("overflow-x", "hidden")
            bot.animate({
                height: "25px"
            }, 400, function () {
                //$("#toggle-segmenter").html("- - -")
            })
            mid.animate({
                bottom: "25px"
            }, 400, function () {
                self.m.resize();
            })
        }
    },

    build_info_container: function () {
        var self = this
        var parent = document.getElementById("info")
        parent.innerHTML = "";

        //file name
        var div_data_file = document.createElement('div');
        div_data_file.id = "info_data_file"
        div_data_file.appendChild(document.createTextNode(this.m.dataFileName));

        //global info
        var div_analysis_file = this.build_info_line("info_analysis_file", "analysis", this.m.analysisFileName)
        var div_system = this.build_info_line("info_system", "system", this.m.system)

        //point info
        var div_point = this.build_info_line("info_point", "point",  this.m.getStrTime(this.m.t, "name") )
        var span = document.createElement('span')
        span.appendChild(document.createTextNode("..."));
        span.className = "edit_button"
        span.onclick = function () {
            self.edit(this, "time");
        }
        div_point.appendChild(span)
        
        var div_date = this.build_info_line("info_date", "date", this.m.getStrTime(this.m.t, "sampling_date") )
        var span = document.createElement('span')
        span.appendChild(document.createTextNode("..."));
        span.className = "edit_button"
        span.onclick = function () {
            self.edit(this, "timestamp2");
        }
        div_date.appendChild(span)

        var percent = (this.m.reads_segmented[this.point] / this.m.reads_total[this.point]) * 100
        var val = "" + this.m.reads_segmented[this.point] + " reads" + " (" + percent.toFixed(2) + "%)"
        var div_segmented = this.build_info_line("info_segmented", "segmented", val)

        var div_total = this.build_info_line("info_total", "total", this.m.reads_total[this.point] + " reads")

        parent.appendChild(div_data_file)
        parent.appendChild(div_analysis_file)
        parent.appendChild(div_system)

        parent.appendChild(div_point)
        parent.appendChild(div_date)
        parent.appendChild(div_segmented)
        parent.appendChild(div_total)

        /*TODO put this somewhere else
        //color
        var div_color = this.build_info_color()
        parent.appendChild(div_color) 
        */

        initTag();
    },

    build_info_line: function (id, name, value) {
        var span1 = document.createElement('span');
        span1.appendChild(document.createTextNode(name + " : "));
        span1.className = "info_row"
        var span2 = document.createElement('span');
        span2.appendChild(document.createTextNode(value));

        var div = document.createElement('div');
        div.id = id
        div.className = "info_line"
        div.appendChild(span1)
        div.appendChild(span2)

        return div
    },

    build_info_color: function () {
        var self = this

        var div = document.createElement('div');
        div.className = "info_color"

        var span1 = document.createElement('span');
        var span2 = document.createElement('span');
        var span3 = document.createElement('span');

        switch (this.colorMethod) {
        case "N2":
            div.appendChild(document.createTextNode(" colors : "));

            span1.appendChild(document.createTextNode(" N=0 "));

            span2.className = "gradient";

            span3.appendChild(document.createTextNode("N=" + this.m.n2_max));

            break;
        case "Tag":
            div.appendChild(document.createTextNode(" tag colors : "));

            for (var i = 0; i < tagName.length; i++) {
                var spantag = document.createElement('span');
                spantag.className = "tagColorBox tagColor" + i
                spantag.id = "fastTag" + i
                spantag.onclick = function () {
                    nextDisplayTag(this)
                }

                span2.appendChild(spantag);
            }


            break;
        case "abundance":
            div.appendChild(document.createTextNode(" colors : "));

            span1.appendChild(document.createTextNode(" 0% "));

            span2.className = "gradient";

            span3.appendChild(document.createTextNode(" 100%"));

            break;
        }

        div.appendChild(span1)
        div.appendChild(span2)
        div.appendChild(span3)
        return div;
    },

}