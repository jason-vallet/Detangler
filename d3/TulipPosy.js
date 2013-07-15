/************************************************************************
 * This class is the core of our visualization system. It manages both
 * the visualization through svg objects and communication with the
 * tulip python server. It displays 2 graphs, one corresponding to the
 * substrate graph and the other to the catalyst graph, and manages the
 * interactions between them.
 * @requires d3.js, jQuery, graph.js, lasso.js
 * @authors Benjamin Renoust, Guy Melancon
 * @created May 2012
 ***********************************************************************/

// This class must be called like any function passing the well formated JSON object.
// originalJSON: a json object with an acceptable format
//
// We need to document the acceptable JSON format, and the communication protocol with
// tulip. This class also might be divided into classes, at least one should deal only
// with the communication, the other with the interaction, another for the overall
// interface...


var TulipPosy = function (originalJSON) {

    var objectReferences = TP.ObjectReferences();
    var contxt = TP.Context();

    TP.Context().clearInterface();

    var viewIndex = "" + TP.Context().getIndiceView();
    var viewIndex1 = "" + TP.Context().getIndiceView();
    var viewIndex2 = "" + TP.Context().getIndiceView();

    var viewIndexMap = [];
    var viewIndex1Map = [];
    var viewIndex2Map = [];

    var path = $('#files').val().split('\\');
    var name = path[path.length - 1].split('.')[0];

    var type1 = "Layout";
    var type2 = "Measures";
    var type3 = "Vizualisation";
    var type4 = "Others";

    // parameter: [type, {attrs}, {attrs_child}, labelprec, labelsuiv]
    // types:   0:select    3:textfield     6:text
    //          1:radio     4:slider
    //          2:checkbox  5:spinner
    /*var bigtest = [[0, {id:"select"}, [{value:"opt1", text:"option1"},{value:"opt2",text:"option2"}]],
    [1, {id:"radio"},[{name:"alpha",value:"2", text:"bravo"},{name:"alpha",value:"3",text:"charlie"}]],
    [2, {id:"checkbox"},[{name:"letter",value:"4", text:"delta"},{name:"alpha",value:"5",text:"epsilon"}]],
    [3, {id:"text"}],
    [5, {id:"spinner"}],
    [4,{id:'slider',class:'slider'},
        {   range: true,
            min: 0,
            max: 99,
            values: [ 3, 12 ],
            change: function() {
                var value = $("#sizemap").slider("values",0);
                var value2 = $("#sizemap").slider("values",1);
                $("#sizemap").find(".ui-slider-handle").eq(0).text(value);
                $("#sizemap").find(".ui-slider-handle").eq(1).text(value2);
            },
            slide: function() {
                var value = $("#sizemap").slider("values",0);
                var value2 = $("#sizemap").slider("values",1);
                $("#sizemap").find(".ui-slider-handle").eq(0).text(value);
                $("#sizemap").find(".ui-slider-handle").eq(1).text(value2);
            }
        }]
    ];*/

    var paramSizeMap = [
        [4, {id:"sizemap"},{
                range: true,
                min: 0,
                max: 99,
                values: [ 3, 12 ],
                change: function() {
                    var value = $("#sizemap").slider("values",0);
                    var value2 = $("#sizemap").slider("values",1);
                    $("#sizemap").find(".ui-slider-handle").eq(0).text(value);
                    $("#sizemap").find(".ui-slider-handle").eq(1).text(value2);
                },
                slide: function() {
                    var value = $("#sizemap").slider("values",0);
                    var value2 = $("#sizemap").slider("values",1);
                    $("#sizemap").find(".ui-slider-handle").eq(0).text(value);
                    $("#sizemap").find(".ui-slider-handle").eq(1).text(value2);
                }
            },
            "scale: "
        ]
    ];

    var tl = [
        [3,{id:"selectedAlgo"}]
    ];

    var colorSettings = [
        [1,{id:"color"},[
            {id:"cnodes", name:"color", class:"colorwell", text:"Nodes Color"},
            {id:"clinks", name:"color", class:"colorwell", text:"Links Color"},
            {id:"cbg", name:"color", class:"colorwell", text:"Background Color"},
            {id:"clabels", name:"color", class:"colorwell", text:"Labels Color"}]
        ],
        [7,{id:"picker"},{class:"colorwell"},null,null,{func:TP.Context().VisualizationObject.changeColor}]]



    var array1 = [
        /*['TEST', '', {call: function (res) {
            console.log(res)
        }}, "Layout"],*/
        ['Force layout', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage('callLayout', {layoutName: 'FM^3 (OGDF)', idView: viewIndex})
        }}, "Layout"],
        ['Sync layouts', '', {click: function () {
            objectReferences.ClientObject.syncLayouts(viewIndex)
        }}, "Layout"],
        ['MDS layout', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage('callLayout', {layoutName: 'MDS', idView: viewIndex})
        }}, "Layout"],
        ['Tulip layout algorithm', tl, {call: function (layout) {
            TP.Context().view[viewIndex].getController().sendMessage('callLayout', {layoutName: layout.selectedAlgo, idView: viewIndex})
        }}, "Layout"],

        ['Induced subgraph', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("sendSelection", {json: objectReferences.ClientObject.getSelection(viewIndex), idView: viewIndex})
        }}, "Selection"],
        ['Delete selection', '', {click: function () {
            objectReferences.InteractionObject.delSelection(viewIndex)
        }}, "Selection"],
        ['Toggle selection', '', {click: function () {
            objectReferences.InteractionObject.toggleSelection(viewIndex)
        }}, 'Selection'],

        ['Center view', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage('resetView');
        }}, "View"],
        ['Reset size', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("resetSize")
        }}, "View"],
        ['Hide labels', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("Hide labels")
        }}, "View"],
        ['Hide links', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("Hide links")
        }}, "View"],
        ['Arrange labels', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("arrangeLabels")
        }}, "View"],
        ['Rotation', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("rotateGraph")
        }}, "View"],
        ['Size mapping', paramSizeMap, {call: function (scales) {
            TP.Context().view[viewIndex].getController().sendMessage("sizeMapping", {parameter: 'viewMetric', idView: TP.Context().activeView, scales: scales})
        }}, "View"],
        ['zoom in', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("runZoom", {wheelDelta: 120, mousePos: [TP.Context().width / 2, TP.Context().height / 2]})
        }}, "View"],
        ['zoom out', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("runZoom", {wheelDelta: -120, mousePos: [TP.Context().width / 2, TP.Context().height / 2]})
        }}, "View"],
        ['Color settings', colorSettings,null, "View"],

        ['Degree', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("callFloatAlgorithm", {floatAlgorithmName: 'Degree', idView: viewIndex})
        }}, "Measure"],
        ['Betweenness centrality', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("callFloatAlgorithm", {floatAlgorithmName: 'Betweenness Centrality', idView: viewIndex})
        }}, "Measure"],
        ['Tulip measure', tl, {call: function (algo) {
            TP.Context().view[viewIndex].getController().sendMessage("callFloatAlgorithm", {floatAlgorithmName: algo.selectedAlgo, idView: viewIndex})
        }}, "Measure"],

        ['Bipartite analysis', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("analyseGraph", {viewIndex: viewIndex, tabCatalyst: tabCatalyst})
        }}, "Open View"],
        ['Horizontal barchart', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("drawBarChart", {smell: 'base'})
        }}, "Open View"],
        ['Barchart', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("drawBarChart", {smell: 'rotate'})
        }}, "Open View"],
        ['Scatter plot', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("drawScatterPlot")
        }}, "Open View"],
        ['Scatter plot nvd3', '', {click: function () {
            TP.Context().view[viewIndex].getController().sendMessage("drawScatterPlotNVD3")
        }}, "Open View"],
        ['Data', '', {click: function () {
            objectReferences.VisualizationObject.drawDataBase(viewIndex)
        }}, "Open View"]
        // ['b3','circular layout','',{click:function(){objectReferences.ClientObject.callLayout('Circular', viewIndex)}}],
        // ['b5','random layout','',{click:function(){objectReferences.ClientObject.callLayout('Random', viewIndex)}}],        
        // ['b13','node information','',{click:function(){objectReferences.InterfaceObject.attachInfoBox()}}],
        // ['b16','labels forward','',{click:function(){objectReferences.VisualizationObject.bringLabelsForward(viewIndex)}}],
    ]

    var array2 = [

        ['Force layout', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage('callLayout', {layoutName: 'FM^3 (OGDF)', idView: viewIndex1})
        }}, "Layout"],
        ['Server update layout', '', {click: function () {
            objectReferences.ClientObject.updateLayout(viewIndex1)
        }}, "Layout"],
        ['Tulip layout algorithm', tl, {call: function (layout) {
            TP.Context().view[target].getController().sendMessage('callLayout', {layoutName: layout.selectedAlgo, idView: target1})
        }}, "Layout"],

        ['Operator ' + TP.Context().tabOperator["catalyst"], '', {click: function () {
            objectReferences.InteractionObject.toggleCatalystSyncOperator(viewIndex1)
        }}, "Selection"],
        ['Toggle selection', '', {click: function () {
            objectReferences.InteractionObject.toggleSelection(viewIndex1)
        }}, 'Selection'],

        ['Center view', '', {click: function () {
            TP.Context().view[target].getController().sendMessage('resetView');
        }}, "View"],
        ['Reset size', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("resetSize")
        }}, "View"],
        ['Hide labels', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("Hide labels")
        }}, "View"],
        ['Hide links', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("Hide links")
        }}, "View"],
        ['Arrange labels', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("arrangeLabels")
        }}, "View"],
        ['Rotation', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("rotateGraph")
        }}, "View"],
        ['Zoom in', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("runZoom", {wheelDelta: 120, mousePos: [TP.Context().width / 2, TP.Context().height / 2]})
        }}, "View"],
        ['Zoom out', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("runZoom", {wheelDelta: -120, mousePos: [TP.Context().width / 2, TP.Context().height / 2]})
        }}, "View"],

        ['Size mapping', paramSizeMap, {call: function (scales) {
            TP.Context().view[viewIndex1].getController().sendMessage("sizeMapping", {parameter: 'viewMetric', idView: contxt.activeView, scales: scales})
        }}, "View"],

        ['Color settings', colorSettings,null, "View"],
        

        ['Degree', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("callFloatAlgorithm", {floatAlgorithmName: 'Degree', idView: viewIndex1})
        }}, "Measure"],
        ['Betweenness. centrality', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("callFloatAlgorithm", {floatAlgorithmName: 'Betweenness Centrality', idView: viewIndex1})
        }}, "Measure"],
        ['Weight mapping', '', {click: function (scales) {
            TP.Context().view[viewIndex1].getController().sendMessage("sizeMapping", {parameter: 'weight', idView: contxt.activeView, scales: scales})
        }}, "Measure"],
        ['Entanglement mapping', '', {click: function (scales) {
            TP.Context().view[viewIndex1].getController().sendMessage("sizeMapping", {parameter: 'entanglementIndice', idView: contxt.activeView, scales: scales})
        }}, "Measure"],
        ['Tulip measure', tl, {call: function (algo) {
            TP.Context().view[target].getController().sendMessage("callFloatAlgorithm", {floatAlgorithmName: algo.selectedAlgo, idView: target1})
        }}, "Measure"],

        ['Horizontal barchart', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("drawBarChart", {smell: 'base'})
        }}, "Open View"],
        ['Barchart', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("drawBarChart", {smell: 'rotate'})
        }}, "Open View"],
        ['ScatterPlot', '', {click: function () {
            TP.Context().view[viewIndex1].getController().sendMessage("drawScatterPlot")
        }}, "Open View"],
        ['Data', '', {click: function () {
            objectReferences.VisualizationObject.drawDataBase(viewIndex1)
        }}, "Open View"]
        // ['b3','random layout','',{click:function(){objectReferences.ClientObject.callLayout('Random',viewIndex1)}}],
        // ['b4','reset view','',{click:function(){objectReferences.VisualizationObject.resetView(viewIndex1)}}],
        // ['b10','Node information','',{click:function(){objectReferences.InterfaceObject.attachInfoBox(viewIndex1)}}],
        //['b14','ent. color','',{click:function(){objectReferences.VisualizationObject.colorMapping('entanglementIndice', viewIndex1)}}],
        //['b15','computeMatrix','',{click:function(){objectReferences.VisualizationObject.buildEdgeMatrices()}}],
    ]




    TP.Context().view[viewIndex] = new TP.ViewGraph(viewIndex, array1, name + " - substrate", "#a0522d", "#808080", "#FFFFFF", "#000000", "rect", "substrate", null);
    TP.Context().view[viewIndex].addView();
    TP.Context().view[viewIndex].buildLinks();

    var tabCatalyst = [viewIndex1, 
                       array2, 
                       name + " - catalyst", 
                       "#4682b4", 
                       "#808080", 
                       "#FFFFFF", 
                       "#000000", 
                       "circle", 
                       "catalyst"];

    $('#undo').click(function () {
        TP.Context().changeStack.undo();
    });
    $('#redo').click(function () {
        TP.Context().changeStack.redo();
    });

    // This is the tricky part, because the json given to the function can be of many shapes.
    // If it is a query, we call tulip to perform the search
    // if it is a given file we load it normally
    // other wise we load the default function
    if (originalJSON != null && originalJSON != "") {
        //console.log('originalJSON not null', originalJSON)
        if ('query' in originalJSON) {
            //console.log('query is in json', originalJSON)
            var recievedGraph = objectReferences.ClientObject.callSearchQuery(originalJSON)
            objectReferences.ClientObject.loadData(recievedGraph, viewIndex);
        } else if ('file' in originalJSON) {
            objectReferences.ClientObject.loadData(originalJSON.file, viewIndex);
        } else objectReferences.ClientObject.loadData(null, viewIndex);
    }
    else {
        objectReferences.ClientObject.loadData(null, viewIndex)
    }


    if ($('#analyse').is(':checked')) {
        TP.Context().view[viewIndex].getController().sendMessage("analyseGraph", {target: viewIndex, tabCatalyst: tabCatalyst});
    }
    if ($('#sync').is(':checked')) {
        objectReferences.ClientObject.syncLayouts(viewIndex)
    }

    //check if Google Chrome browser is used, if not, warn the user
     if(!window.chrome){
        TP.Context().InterfaceObject.throwAnnouncement("Warning","This application is optimized for Google Chrome browser. If you see this message, please "+
            "use Google Chrome or... run you fools.")
    }


};
