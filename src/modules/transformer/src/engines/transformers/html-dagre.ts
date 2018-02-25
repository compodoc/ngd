export const html = (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Angular Dependencies Graph</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="http://nlpviz.bpodgursky.com/resources/d3.v3.min.js" charset="utf-8"></script>
    <script src="http://nlpviz.bpodgursky.com/resources/dagre-d3.js"></script>
    <style>
        .main-svg {
            position: fixed;
            left: 0;
            height: 1000px;
            width: 100%;
            border: 1px solid #999;
        }
        
        .node {
            display: inline-block;
            padding: 2px 4px;
            font-size: 11.844px;
            font-weight: bold;
            line-height: 14px;
            color: #ffffff;
            vertical-align: baseline;
            white-space: nowrap;
            text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
            background-color: #999999;
        }
        
        text {
            font-weight: 300;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 14px;
        }
        
        .node>rect,
        .node>ellipse {
            stroke-width: 1px;
            stroke: #333;
            fill: none;
            fill: #fff;
            opacity: 0.5;
        }
        
        .provider rect {
            fill: #03A9F4;
        }
        
        .directive rect {
            fill: #4CAF50;
        }
        
        .pipe rect {
            fill: #FF9800;
        }
        
        .component ellipse {
            fill: #FF5252;
        }
        
        .module rect {
            fill: #9C27B0;
        }
        
        .edge rect {
            fill: #fff
        }
        
        .edgePath path {
            stroke: #333;
            stroke-width: 1.5px;
        }
    </style>
    <style>
        body {
            font-family: helvetica;
            font-size: 14px;
        }
        
        #attach {
            width: 100%;
            height: 100%;
            position: absolute;
            left: 0;
            top: 0;
            z-index: 999;
        }
    </style>
</head>
<body>
    <div id="attach">
        <svg id="svg-canvas" class="main-svg"></svg>
    </div>
    <script>
        window.onload = () => {
            render(window.__data);
        }
        function render(data) {
            document.querySelector('#svg-canvas').innerHTML = '';
            // https://github.com/cpettitt/dagre/wiki#configuring-the-layout
            const g = new dagreD3.graphlib.Graph()
                .setGraph({
                    rankdir: 'LR', // TB, BT, LR, or RL
                    // align: 'UL',
                    nodesep: 50,
                    edgesep: 10,
                    ranksep: 50,
                    marginx: 0,
                    marginy: 0,
                    acyclicer: undefined, //undefined greedy
                    ranker: 'tight-tree', //tight-tree, longest-path
                })
                .setDefaultEdgeLabel(function() {
                    return {};
                });
            const nodes = [];
            const edges = [];
            const modulesEdges = [];
            populate(data, nodes, edges, modulesEdges);
            nodes.map(node => {
                node.label = node.name;
                node.class = node.nodeclass;
                node.rx = 5;
                node.ry = 5;
                switch (node.type) {
                    case 'component':
                        node.shape = 'ellipse';
                        break;
                    case 'provider':
                        node.shape = 'rect';
                        break;
                }
                g.setNode(node.id, node);
            });
            edges.forEach(edge => {
                const options = {
                    lineTension: 0.1,
                    lineInterpolate: "bundle" // bundle, basis, linear
                };
                g.setEdge(edge.source, edge.target, options);
            });
            const _render = new dagreD3.render();
            const svg = d3.select("#svg-canvas");
            const svgGroup = svg.append("g");
            _render(d3.select("#svg-canvas g"), g);
            const xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
            svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
            svg.attr("height", g.graph().height + 40);
            //  enable zoom and scrolling
            svgGroup.attr("transform", "translate(5, 5)");
            svg.call(d3.behavior.zoom().on("zoom", function redraw() {
                svgGroup.attr("transform",
                    "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
            }));
        }
        function populate(data, nodes, edges, modulesEdges) {
            populateNodes(data, nodes);
            populateEdges(data, edges);
        }
        function populateEdges(data, edges) {
            data.map(module => {
                populateEdgesWithMetadata(module.declarations, edges, module);
                populateEdgesWithMetadata(module.providers, edges, module);
                populateEdgesWithMetadata(module.imports, edges, module);
            });
        }
        function populateEdgesWithMetadata(deps, edges, parent) {
            deps.map((metadata) => {
                if (parent) {
                    const source = metadata.id;
                    const target = parent.id;
                    const id = metadata.id + '__' + parent.id;
                    edges.push({
                        source,
                        target,
                        id
                    });
                }
                if (metadata.declarations &&
                    Array.isArray(metadata.declarations) &&
                    metadata.declarations.length > 0) {
                    populateEdgesWithMetadata(metadata.declarations, edges, metadata);
                }
                if (metadata.providers &&
                    Array.isArray(metadata.providers) &&
                    metadata.providers.length > 0) {
                    populateEdgesWithMetadata(metadata.providers, edges, metadata);
                }
            });
        }
        function populateNodes(data, nodes) {
            data.map(module => {
                // providers on a module level
                populateNodesWithMetadata(module.providers, nodes);
                populateNodesWithMetadata(module.declarations, nodes);
                populateNodesWithMetadata(module.imports, nodes);
                populateNodesWithMetadata(module, nodes);
            });
        }
        function populateNodesWithMetadata(deps, nodes) {
            if (Array.isArray(deps)) {
                deps.map((metadata) => {
                    metadata.label = metadata.name;
                    metadata.nodeclass = 'label ' + metadata.type;
                    nodes.push(metadata);
                    if (metadata.declarations && Array.isArray(metadata.declarations) && metadata.declarations.length > 0) {
                        populateNodesWithMetadata(metadata.declarations, nodes);
                    }
                    if (metadata.providers && Array.isArray(metadata.providers) && metadata.providers.length > 0) {
                        // providers on a declaration level
                        populateNodesWithMetadata(metadata.providers, nodes);
                    }
                });
            } else {
                deps.label = deps.name;
                deps.nodeclass = 'label module';
                nodes.push(deps);
            }
        }
    </script>
    <script>
        window.__data = ${JSON.stringify(data)}
    </script>
    </body>
</html>
`;