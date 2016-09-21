export const DOT_TEMPLATE = `
digraph dependencies {
  node[shape="rect", style="filled", colorscheme=###scheme###];
	splines=true;
	ratio=fill;
	rankdir=LR;

  {{~it.modules :mod}}
  subgraph "{{=mod.name}}" {
    label="{{=mod.name}}";
		node [shape="folder", fillcolor=3];

    /* declarations:start */

		subgraph cluster_declarations {
			label="Declarations";
			node [style=filled, shape="rect", fillcolor=2];

	    {{~mod.declarations :declaration}}
				node [fillcolor=2];
	      "{{=declaration.name}}";
	    {{~}}

		}

    {{~mod.declarations :declaration}}
      label="{{=declaration.name}}";
      "{{=declaration.name}}" -> "{{=mod.name}}";

      subgraph cluster_declarations_providers {
        label="Component Providers";
        {{~declaration.providers :prov}}
          label="{{=prov.name}}"
          node [fillcolor=10, shape="rect"];
          "{{=prov.name}}" -> "{{=declaration.name}}";
        {{~}}
      }

    {{~}}

    /* declarations:end */

    /* imports:start */

    subgraph cluster_imports {
      label="Imports";
      node [style=filled, fillcolor=3, shape="rect"];
      {{~mod.imports :imp}}
        "{{=imp.name}}" [label="{{=imp.name}}", shape="folder"]
      {{~}}
    }

    {{~mod.imports :imp}}
      "{{=imp.name}}" -> "{{=mod.name}}";
    {{~}}

    /* imports:end */

    /* exports:start */

		subgraph cluster_exports {
			label="Exports";
			node [style=filled, fillcolor=4, shape="rect"];
			{{~mod.exports :exp}}
				"{{=exp.name}} " [label="{{=exp.name}} ", shape="rect"]
			{{~}}
		}

    {{~mod.exports :exp}}
      "{{=mod.name}}" -> "{{=exp.name}} " [style="dashed"];
    {{~}}

    /* exports:end */

    /* bootstrap:start */

    subgraph cluster_bootstrap {
      label="Bootstrap";
      node [style=filled, fillcolor=5, shape="rect"];
      {{~mod.bootstrap :bts}}
        "{{=bts.name}} " [label="{{=bts.name}} ", shape="rect"]
      {{~}}
    }

    {{~mod.bootstrap :bts}}
      "{{=mod.name}}" -> "{{=bts.name}} " [style="dotted"];
    {{~}}

    /* bootstrap:end */

    /* providers:start */

    subgraph cluster_providers {
      label="Module Providers";
      node [style=filled, fillcolor=7, shape="rect"];
      {{~mod.providers :provider}}
        "{{=provider.name}}" [label="{{=provider.name}}", shape="rect"]
      {{~}}
    }

    {{~mod.providers :provider}}
      "{{=provider.name}}" -> "{{=mod.name}}";
    {{~}}

    /* providers:end */
  }
  {{~}}

}
`;




let xxx = `
digraph dependencies {
  node[shape="rect", style="filled", colorscheme=###scheme###];
	splines=true;
	ratio=fill;

	/* Graph orientation */
	rankdir=LR;

  {{~it.modules :mod}}
  subgraph "{{=mod.name}}" {
    label="{{=mod.name}}";
		node [shape="folder"];
		color=1;

    /* declarations:start */

		subgraph cluster_declarations {
			label="declarations";
			node [style=filled, shape="rect"];
			color=2;

	    {{~mod.declarations :declaration}}
	      label="{{=declaration.name}}";
				node [fillcolor=2];
	      "{{=declaration.name}}" -> "{{=mod.name}}";

				{{~declaration.providers :prov}}
					label="{{=prov.name}}"
					node [fillcolor=10];
					"{{=prov.name}}" -> "{{=declaration.name}}";
				{{~}}

	    {{~}}

		}

    /* declarations:end */

    /* imports:start */

		subgraph cluster_imports {
			label="imports";
			node [style=filled, shape="rect"];
			color=3;
			{{~mod.imports :imp}}
				"{{=imp.name}}" [label="{{=imp.name}}", shape="folder"]
				"{{=imp.name}}" -> "{{=mod.name}}";
			{{~}}
		}

    /* imports:end */

    /* exports:start */

		subgraph cluster_exports {
			label="exports";
			node [style=filled, shape="rect"];
			color=4;
			{{~mod.exports :exp}}
				"{{=exp.name}}" [label="{{=exp.name}}", shape="folder"]
				"{{=exp.name}}" -> "{{=mod.name}}";
			{{~}}
		}

    /* exports:end */

    /* bootstrap:start */

		subgraph cluster_bootstrap {
			label="bootstrap";
			node [style=filled, shape="rect"];
			color=4;
			{{~mod.bootstrap :bts}}
				"{{=bts.name}}" [label="{{=bts.name}}", shape="folder"]
				"{{=bts.name}}" -> "{{=mod.name}}";
			{{~}}
		}

    /* bootstrap:end */

    /* providers:start */

		subgraph cluster_providers {
			label="providers";
			node [style=filled, shape="rect"];
			color=6;

	    {{~mod.providers :provider}}
	      label="{{=provider.name}}";
				node [fillcolor=6];
	      "{{=provider.name}}" -> "{{=mod.name}}";
	    {{~}}

		}

    /* providers:end */

  }
  {{~}}

}
`;
