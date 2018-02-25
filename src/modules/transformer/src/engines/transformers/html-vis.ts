export const html = (data) => `
<!doctype html>
<html>
<head>
    <title>Angular Dependencies Graph</title>
    <style type="text/css">
        body {
            font: 10pt sans;
        }
        #mynetwork {
            width: 2000px;
            height: 1000px;
        }
    </style>
    <script type="text/javascript" src="http://visjs.org/dist/vis.js"></script>
    <link href="http://visjs.org/dist/vis-network.min.css" rel="stylesheet" type="text/css"/>
    <script type="text/javascript">
        var nodes = null;
        var edges = null;
        var network = null;
        function destroy() {
            if (network !== null) {
                network.destroy();
                network = null;
            }
        }
        function pushDeclaration(declaration) {
            nodes.push({
                id: declaration.__id,
                label: declaration.name+'('+declaration.selector+')',
                color: "pink",
                shape: 'box',
                font: {
                    face: 'monospace',
                    align: 'left'
                },
                level: declaration.__level
            });
        }
        function pushProvider(provider) {
            nodes.push({
                id: provider.__id,
                label: provider.name,
                color: "orange",
                font: {
                    face: 'monospace',
                    align: 'left'
                },
                level: provider.__level,
            });
        }
        function connectEdges(declarations) {
            declarations.map((from, arr, i) => {
                from.declarations.map(to => {
                    edges.push({
                        from: from.__id,
                        to: to.__id,
                        arrows: 'to',
                        'smooth': {
                            'type': 'cubicBezier'
                        }
                    });
                });
                // Pipes dont have providers!
                if (from.providers) {
                    from.providers.map(to => {
                        edges.push({
                            from: to.__id,
                            to: from.__id,
                            'smooth': {
                                'type': 'cubicBezier'
                            }
                        });
                    });
                }
            });
        }
        function draw() {
            destroy();
            nodes = [];
            edges = [];
            var connectionCount = [];
            window.__data.map(function(Module1){
                // push declarations
                for (var i = 0; i < Module1.declarations.length; i++) {
                    var declaration = Module1.declarations[i];
                    pushDeclaration(declaration);
                }
                // push providers (global and local)
                for (var i = 0; i < Module1.providers.length; i++) {
                    var provider = Module1.providers[i];
                    pushProvider(provider);
                }
                // Pipes dont have providers!
                if (Module1.declarations.providers) {
                    for (var i = 0; i < Module1.declarations.length; i++) {
                        var declaration = Module1.declarations[i];
                        for (var j = 0; j < declaration.providers.length; j++) {
                            var provider = declaration.providers[j];
                            pushProvider(provider);
                        }
                    }
                }
                connectEdges(Module1.declarations);
            });
            
            // create a network
            var container = document.getElementById('mynetwork');
            var data = {
                nodes: nodes,
                edges: edges
            };
            var options = {
                layout: {
                    hierarchical: {
                        direction: "UD",
                        sortMethod: "directed"
                    }
                },
                interaction: {dragNodes :false},
                physics: {
                    enabled: false
                },
                configure: {
                    filter: function (option, path) {
                        if (path.indexOf('hierarchical') !== -1) {
                            return true;
                        }
                        return false;
                    },
                    showButton:false
                }
            };
            network = new vis.Network(container, data, options);
            network.on('select', function(params) {
                console.log(params.nodes);
            });
        }
    </script>
    <script>
    window.__data = ${JSON.stringify(data)}
    </script>
    
</head>
<body onload="draw();">
<h2>Angular Dependencies Graph</h2>
<div id="mynetwork"></div>
</body>
</html>
`;