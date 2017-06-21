//Initialize sigma
let s = new sigma('graph');
let nodesToLink = new LinkedHashSet();

sigma.plugins.dragNodes(s, s.renderers[0]);

var vertxId = 0;
var edgeId = 0;

var posX = 0.0;
var posY = 0.0;

function populateGraph(){
    //Nodes
    addVertx(vertxId++, 'Petal Length', {}, 1, 1, 1);
    addVertx(vertxId++, 'Petal Width', {}, 1, 1.1, 1);
    addVertx(vertxId++, 'Sepal Length', {}, 1, 1.2, 1);
    addVertx(vertxId++, 'Sepal Width', {}, 1, 1.3, 1);
    addVertx(vertxId++, 'Petal Length + Width', {}, 1, 1.05, 0.9);
    addVertx(vertxId++, 'Sepal Length + Width', {}, 1, 1.25, 0.9);
    addVertx(vertxId++, 'Global', {}, 1, 1.15, 0.8);
    //Edges
    connect(0,4);
    connect(1,4);
    connect(2,5);
    connect(3,5);
    connect(4,6);
    connect(5,6);
}

function newNode(id, label, hsomNode, size, positionX, positionY, color){
    hsomNode = hsomNode || {};
    size = size || 1;
    positionX = positionX || posX;
    positionY = positionY || posY;
    posX += 0.1;
    posY += 0.1;
    color = color || '#333';
    var newNode = {
        id: id,
        label: label,
        x: positionX,
        y: positionY,
        size: size,
        color: color,
        hsomNode: hsomNode
    };
    return newNode;
}

function newDataSourceNode(id, label, dataSource){
    let newDataSource =  {
        id: id,
        label: label,
        x: posX,
        y: posY,
        size: 1,
        color: '#607D8B',
        dataSource: dataSource
    };
    posX += 0.1;
    posY += 0.1;
    return newDataSource;
}

function addDataSourceVertx(id, label, dataSource){
    s.graph.addNode(newDataSourceNode(id, label, dataSource));
    s.refresh();
}

function addVertx(id, label, size, positionX, positionY, color, hsomNode){
    s.graph.addNode(newNode(id, label, size, positionX, positionY, color));
    s.refresh();
}

function newEdge(source, target){
    var newEdge = {
        id: edgeId++,
        source: source,
        target: target
    };
    return newEdge;
}

function connect(source, target){
    s.graph.addEdge(newEdge(source,target));
    s.refresh();
}

function refreshGraph(hsom, dataSources){
    let nodes = hsom.nodes.map(function(node){
                    return {
                        id: node.model.id,
                        label: node.model.name,
                        model: node
                    }
                });
    let edges = hsom.graph.edges;

    s.graph.clear();
    nodes.forEach(function (node) {
        this.addVertx(node.id, node.label, node.model);
        s.refresh();
    });
    edges.forEach(function(edge){
        this.connect(edge.source, edge.target);
        s.refresh();
    });
    dataSources.forEach(function(dsNode){
        this.addDataSourceVertx(dsNode.id, dsNode.db, dsNode);
        s.refresh();
    });

    if(dataSources.length != 0)
        dataSources.edges.forEach(function(dsEdge){
            this.connect(dsEdge.source, dsEdge.target);
            s.refresh();
        });

}

function removeDataSourceVertx(dataSourceId){
    s.graph.dropNode(dataSourceId);
    s.refresh();
}

function getGraphNodes(){
    return s.graph.nodes();
}

//Events
s.bind('rightClickNode', function(e) {
    if('dataSource' in e.data.node)
        return;
    else if(nodesToLink.add(e.data.node)){
        e.data.node.color = "#03A9F4";
        e.data.node.size += 1;
    }
    else{
        e.data.node.color = "#333";
        e.data.node.size -= 1;
    }
    s.refresh({ skipIndexation: true });
});

