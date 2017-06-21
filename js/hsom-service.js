$(document).ready(function() {

    //global variables
    /**
     * Objects format:
     *  {
     *    id,
     *    db,
     *    type:DB,
     *    randomness,
     *    timer,
     *    selectors,
     *    edges,
     *    out
     *  }
     *
     * Every time a HSOM is loaded, the graph is populated with all data sources in @dataSources.
     *
     * @type {Array}
     */
    var dataSources = [];

    /**
     * Objects format:
     *  {
     *    id,
     *    type:PROXY,
     *    in,
     *    out
     *  }
     * This array stores every connection between a data source and a node.
     * Every time a HSOM is loaded, this array is cleared and the associated Proxy data streamers deleted.
     *
     * @type {Array}
     */
    var dsProxies = [];

    //UI
    $('body').on('contextmenu', '#graph', function (e) {
        return false
    });

    //populateGraph();

    //Materialize stuff
    $('select').material_select();
    $('.collapsible').collapsible({
        accordion: false
    });
    $('.modal').modal();
    $('#create-node-modal').modal({
        ready: function(modal, trigger){
            var info = nodesToLink.print();
            $('#node-order').val(info);
        }
    });
    $('#create-edge-modal').modal({
        ready: function(modal, trigger){
            let nodes = getGraphNodes().map(function(node){
                return{
                    id: node.id,
                    name: node.label
                }
            });
            console.log("edge modal");
            console.log(nodes);
            populateSelectList($('#hsom-source-picker'), nodes, "Select the source node");
            populateSelectList($('#hsom-target-picker'), nodes, "Select the target node");
        }
    });
    /*
    $('#delete-hsom-modal').modal({
        ready: function(modal, trigger){
            INSERT THE MODAL POPULATE INFO HERE
                1) Get the HSOM info
                2)
            console.log(modal, trigger);
        }
    });
     */
    //end of materialize stuff


    //Parsing stuff
    function parseHSOMId() {
        return $('#hsom-picker').val();
    }

    function parseHSOM() {
        var hsom = {
            "name": $('#hsom-name').val()
        };
        return hsom;
    }

    function parseNode() {
        var newNodeModel = {
            "name": $('#node-name').val(),
            "weight-labels": $('#node-weight-labels').val().split(","),
            "width": parseInt($('#node-width').val()),
            "height": parseInt($('#node-height').val()),
            "dim": parseInt($('#node-dim').val()),
            "alpha_i": parseFloat($('#node-alpha-i').val()),
            "alpha_f": parseFloat($('#node-alpha-f').val()),
            "sigma_i": parseFloat($('#node-sigma-i').val()),
            "sigma_f": parseFloat($('#node-sigma-f').val()),
            "beta_value": parseFloat($('#node-beta-value').val()),
            "normalization": {"type": "NONE"}
        };
        var newNode = {
            "order": $('#node-order').val().split(","),
            "timer": parseInt($('#node-timer').val()),
            "model": newNodeModel
        };
        return newNode;
    }

    function parseEdge() {
        var newEdge = {
            "source": $('#hsom-source-picker').val(),
            "target": $('#hsom-target-picker').val()
        };
        return newEdge;
    }

    function parseDataSource(){
        return {
            "type":"DB",
            "db":$('#data-source-name').val(),
            "randomness":parseInt($('#data-source-randomness').val()),
            "timer":parseInt($('#data-source-timer').val()),
            "selectors":$('#data-source-selectors').val(),
            "pull-type":$('#data-source-type-picker').val()
        }
    }

    function parseDataSourceEdge(){
        let dataSourceId = $('#data-source-picker').val();
        let source = dataSources[findDataSourceIndex(dataSourceId)].out;
        let nodeId = $('#data-source-node-target-picker').val();
        let target = getGraphNodes()
            .filter(function(node){return node.id == nodeId})
            .map(function(node){return node.hsomNode.zipper});
        return {
            "type":"PROXY",
            "in":source,
            "out":target+"-in"
        }
    }

    function parseDataSourceSourceId () {
        return $('#data-source-picker').val();
    }

    function parseDataSourceTargetId () {
        return $('#data-source-node-target-picker').val();
    }
    //End of parsing stuff

    //ajax stuff
    const HOST = 'localhost';
    const PORT = '8888';
    const URL = 'http://' + HOST + ':' + PORT;

    /**
     * Get All HSOMs
     */
    getAllHSOMs = function (callback) {
        $.getJSON(URL + '/hsoms', callback);
    };

    /**
     * Get one HSOM
     */
    getHSOM = function(id, callback) {
        $.getJSON(URL + '/hsoms/' + id, callback);
    };

    /**
     * Create one HSOM
     */
    createHSOM = function(hsom, callback) {
        $.post(URL + '/hsoms', JSON.stringify(hsom)).done(callback);
    };

    /**
     * Delete one HSOM
     */

    /**
     * Create Node
     */
    createNode = function (hsomId, newNode, callback) {
        $.post(URL + '/hsoms/' + hsomId + '/nodes', JSON.stringify(newNode)).done(callback);
    };

    /**
     * Delete Node
     */

    /**
     * Create Edge
     */
    createEdge = function(hsomId, newEdge, callback) {
        $.post(URL + '/hsoms/' + hsomId + '/edges', JSON.stringify(newEdge)).done(callback);
    };

    /**
     * Create Data Source
     */
    createDataSource = function(dataSource, callback) {
        $.post('http://localhost:8585/datastreamers', JSON.stringify(dataSource)).done(callback);
    };

    createDataSourceEdge = function(edge, callback){
        $.post('http://localhost:8585/datastreamers', JSON.stringify(edge)).done(callback);
    };

    deleteDataSource = function(dataSourceId, callback){
        $.ajax({
            url:'http://localhost:8585/datastreamers/' + dataSourceId,
            type:'DELETE',
            success: callback
        });
    };
    //end of ajax stuff

    //ui-stuff
    function populateSelectList(picker, data, message){
        var picker = picker;
        picker.html('');
        var elem;
        picker.append('<option value="" disabled selected>'+ message +'</option>');
        for(index in data){
            elem = data[index];
            picker.append('<option value="' + elem.id + '">' + elem.name + ' - ' + elem.id + '</option>');
        }
        picker.material_select();
    }

    function controlHoverAnimation(elem, hoverHtml, defaultHtml, hoverColor, defaultColor){
        defaultColor = defaultColor || 'black';
        elem.hover(function(){
            $(this).html(hoverHtml);
            $(this).css('color', hoverColor);
        }, function(){
            $(this).html(defaultHtml);
            $(this).css('color', defaultColor);
        });
    }

    function findDataSourceIndex(dataSourceId){
        return dataSources.findIndex(function(ds){ return dataSourceId.trim() == ds.id.trim()});
    }

    function removeDataSource(dataSourceId){
        let i = findDataSourceIndex(dataSourceId);
        if(i >= 0){
            dataSources.splice(i,1);
            return true;
        }
        return false;
    }

    function createDataSourceItem(dataSource){
        return '' +
            '<li>' +
                '<div class="collapsible-header">' +
                    '<i class="material-icons">rss_feed</i>' +
                    dataSource.db + ' <sub>[' + dataSource.selectors + ']</sub>' +
                    '<i class="material-icons right delete-datasource" value="'+ dataSource.id +'">delete</i>' +
                    '<a class="waves-effect waves-light black-text right" value="'+ dataSource.id +'" href="#create-data-source-edge-modal" id="create-data-source-edge-btn">' +
                        '<i class="material-icons link-datasource">link</i>' +
                    '</a>' +
                '</div>' +
                '<div class="collapsible-body">' +
                    '<p>' +
                        '<b>Id:</b> ' + dataSource.id +
                        '<br>'+
                        '<b>Type:</b> ' + dataSource.type +
                        '<br>'+
                        '<b>Data-set:</b> ' + dataSource.db +
                        '<br>'+
                        '<b>Selectors:</b> ' + dataSource.selectors +
                        '<br>'+
                        '<b>Timer:</b> ' + dataSource.timer +
                        '<br>'+
                        '<b>Randomness:</b> ' + dataSource.randomness +
                        '<br>'+
                    '</p>' +
                '</div>' +
            '</li>';
    }

    controlHoverAnimation(
        $('#create-datasource-btn'),
        'add_circle',
        'add_circle_outline',
        'limegreen'
    );

    controlHoverAnimation(
        $('#create-node-btn'),
        'add_circle',
        'add_circle_outline',
        'limegreen'
    );

    controlHoverAnimation(
        $('#remove-node-btn'),
        'remove_circle',
        'remove_circle_outline',
        'red'
    );

    controlHoverAnimation(
        $('#create-edge-btn'),
        'link',
        'link',
        'blue'
    );

    $('#data-source-list').on('click', '.delete-datasource', function() {
        let elem = $(this).parent().parent();
        let dataSourceId = $(this).attr('value');
        $(this).parent().next().remove();
        elem.fadeOut(300, function(){
            deleteDataSource(dataSourceId, function () {
                removeDataSource(removeDataSource(dataSourceId));
                removeDataSourceVertx(dataSourceId);
                elem.remove();
            });
        });
    });

    $('#data-source-list').on('click', '#create-data-source-edge-btn', function() {
        let dataSourceId = $(this).attr('value');
        let dataSource = dataSources[findDataSourceIndex(dataSourceId)];
        let elem = { id:dataSource.id, name:(dataSource.db + ' - ' + dataSource.selectors) };
        populateSelectList($('#data-source-picker'), { elem }, 'Select data source');
        let nodes = getGraphNodes().filter(function(node){
            return !('dataSource' in node)
        }).map(function(node){
            return{
                id: node.id,
                name: node.label
            }
        });
        populateSelectList($('#data-source-node-target-picker'), nodes, 'Select the target node');
    });

    $('#refresh-hsom-list').on('click', function() {
        console.log("refresh list");
        getAllHSOMs(function(hsoms){
            populateSelectList($('#hsom-picker'), hsoms, 'No HSOM selected');
        });
    });

    $('#create-hsom').on('click', function() {
        var hsom = parseHSOM();
        createHSOM(hsom, function(data) {
            console.log(data);
        });
    });

    $('#view-hsom').on('click', function(){
        let hsomId = parseHSOMId();
        getHSOM(hsomId, function(hsom){
            refreshGraph(hsom, dataSources);
            console.log(hsom);
        });
    });

    $('#create-node').on('click', function() {
        let hsomId = parseHSOMId();
        let node = parseNode();
        createNode(hsomId, node, function(data){
            addVertx(data.model.id, data.model.name, data);
            console.log(data);
        })
    });

    $('#create-edge').on('click', function() {
        let hsomId = parseHSOMId();
        let edge = parseEdge();
        console.log("new edge: " + edge);
        createEdge(hsomId, edge, function(){
            connect(edge.source, edge.target);
        })
    });

    $('#remove-node').on('click', function() {
        let hsomId = parseHSOMId();
        let nodeId = parseNodeId();
        console.log('Remove node not implemented');
    });

    $('#create-data-source').on('click', function(){
        let dataSource = parseDataSource();
        console.log("DataSource");
        console.log(dataSource);
        createDataSource(dataSource, function(newDataSource){
            $('#data-source-list').append(createDataSourceItem(newDataSource));
            addDataSourceVertx(newDataSource.id, newDataSource.db, newDataSource);
            newDataSource.edges = [];
            dataSources.push(newDataSource);
        });
    });

    $('#create-data-source-edge').on('click', function(){
        let dataSourceEdge = parseDataSourceEdge();
        let sourceId = parseDataSourceSourceId();
        let targetId = parseDataSourceTargetId();
        console.log(dataSourceEdge);
        createDataSourceEdge(dataSourceEdge, function(data){
            dataSources[findDataSourceIndex(sourceId)].edges.push({source:sourceId, targetId});
            connect(sourceId, targetId);
        });
    });
    //end of ui stuff

});