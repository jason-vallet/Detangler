/************************************************************************
 * This module contains various tools for the application. They were put
 * here because they didn't really belong to any other modules.
 * 
 * @authors Guy Melancon, Benjamin Renoust
 * @created May 2012
 ***********************************************************************/

(function () {

    import_class("graphDrawing.js", "TP");
    import_class("context.js", "TP");
    import_class("objectReferences.js", "TP");
    
    var Tools = function () {

        var __g__ = this;

        var contxt = TP.Context();
        var objectReferences = TP.ObjectReferences();

        if (typeof Object.keys !== "function") {
            (function () {
                Object.keys = Object_keys;

                function Object_keys(obj) {
                    var keys = [],
                        name;
                    for (name in obj) {
                        if (obj.hasOwnProperty(name)) {
                            keys.push(name);
                        }
                    }
                    return keys;
                }
            })();
        }


        // This is a handy function to round numbers
        this.round = function (number, digits) {
            var factor = Math.pow(10, digits);
            return Math.round(number * factor) / factor;
        }


        // This function allows to map a callback to a keyboard touch event
        // It is not currently used.
        // callback, the callback function
        this.registerKeyboardHandler = function (callback) {
            var callback = callback;
            d3.select(window)
                .on("keydown", callback);
        };


        this.grabDataProperties = function (data) {

            function getProps(n) {
                //console.log(Object.keys(n));
                Object.keys(n).forEach(function (p) {
                    if (!(p in contxt.substrateProperties)) {
                        contxt.substrateProperties[p] = typeof (n[p])
                    }
                })
            }

            data.nodes.forEach(getProps)
            data.links.forEach(getProps)

            //console.log("The properties: ", contxt.substrateProperties);
            //console.log("The properties: ", data.nodes);
            //console.log(contxt.substrateProperties);
        }


        // This function adds the baseID property for data which is the basic 
        // identifier for all nodes and links
        // data, the data to update
        // idName, if given, the property value of 'idName' will be assigned 
        // to 'baseID'
        this.addBaseID = function (data, idName) {
            //console.log(data)
            data.nodes.forEach(function (d) {
                if ("x" in d) {
                    d.currentX = d.x;
                } else {
                    d.x = 0;
                    d.currentX = 0;
                };
                if ("y" in d) {
                    d.currentY = d.y;
                } else {
                    d.y = 0;
                    d.currentY = 0;
                };
            })
            if (idName == "") {
                data.nodes.forEach(function (d, i) {
                    d.baseID = i
                });
                data.links.forEach(function (d, i) {
                    d.baseID = i
                });
            } else {
                data.nodes.forEach(function (d, i) {
                    d.baseID = d[idName]
                });
                data.links.forEach(function (d, i) {
                    d.baseID = d[idName]
                });
            }
        }


        // This function loads a substrate graph from a given json
        // data, the data to load
        //
        // we might want to rename this function...        
        this.loadJSON = function (data, target) {
            //console.log("loadJSONrescaleBEGIN");

		    //TP.GraphDrawing(contxt.getViewGraph('substrate'),contxt.getViewSVG('substrate')).rescaleGraph(contxt,data);
		    //console.log("loadJSONrescaleENDING");
            //console.log("the data to store:", data);
            this.grabDataProperties(data);
            contxt.tabGraph["graph_"+target].nodes(data.nodes, target);
            contxt.tabGraph["graph_"+target].links(data.links, target);
            contxt.tabGraph["graph_"+target].edgeBinding();
            //console.log("loading JSON", contxt.graph_substrate.nodes(), contxt.graph_catalyst.nodes());

            var graph_drawing = TP.GraphDrawing(contxt.tabGraph["graph_"+target], contxt.tabSvg["svg_"+target], target);
            graph_drawing.draw();
            objectReferences.VisualizationObject.rescaleGraph(data);
            return
        }


        return __g__;
    }

    return {Tools: Tools};
})()
