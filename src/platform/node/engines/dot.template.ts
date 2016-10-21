const LEGEND = `
subgraph cluster_legend {
  label="Legend";
  "_MainModule_" [shape="folder", fillcolor=1];
  "_SubModule_" [shape="folder", fillcolor=1];
  "_Declarations_" [shape="rect", fillcolor=2];
  "_Exports_" [shape="rect", fillcolor=4];
  "_Bootstrap_" [shape="rect", fillcolor=5];
  "_Providers_" [shape="rect", fillcolor=6];

  "_MainModule_" -> "_Exports_" [style="dashed"];
  "_MainModule_" -> "_Bootstrap_" [style="dotted"];
  "_Providers_" -> "_MainModule_" [style="solid"];
  "_Declarations_" -> "_MainModule_" [style="solid"];
  "_SubModule_" -> "_MainModule_" [style="solid"];
}
`;

const loopBlock = (symbols, attrs, edge='') => {
  let str = '';

  if (edge === '->') {
    str = `
    {{~mod.${symbols} :_symbol}}

      {{?_symbol.alias}}
        "{{=_symbol.alias}}" -> "{{=mod.name}}" [${attrs}];
        {{??_symbol.name}}
        "{{=_symbol.name}}" -> "{{=mod.name}}" [${attrs}];
      {{?}}

    {{~}}
    `;
  }
  else {
    str = `
    {{~mod.${symbols} :_symbol}}

      {{?_symbol.alias}}
        "{{=_symbol.alias}}" [label="{{=_symbol.alias}}", ${attrs}];
      {{??_symbol.name}}
        "{{=_symbol.name}}" [label="{{=_symbol.name}}", ${attrs}];
      {{?}}

    {{~}}`;
  }

  return str;
}

export const DOT_TEMPLATE = `
digraph dependencies {
  node [shape="rect", style="filled", colorscheme=###scheme###];
  ranksep=0.1;
  compound=false;
  remincross=true;
  splines=true;
  splines=ortho;

  rankdir=LR;
  rankdir=TB;
  rankdir=BT;

  label=<
    <table BORDER="0">
        <tr>
            <td colspan="2"><b>Legend</b></td>
        </tr>
        <tr>
            <td>
                <table BORDER="0">
                    <tr>
                        <td bgcolor="#ffffb3" width="20"></td>
                    </tr>
                </table>
            </td>
            <td align="left">Declarations</td>
        </tr>
        <tr>
            <td>
                <table BORDER="0">
                    <tr>
                        <td bgcolor="#8dd3c7"></td>
                    </tr>
                </table>
            </td>
            <td align="left">Module</td>
        </tr>
        <tr>
            <td>
                <table BORDER="0">
                    <tr>
                        <td bgcolor="#80b1d3"></td>
                    </tr>
                </table>
            </td>
            <td align="left">Bootstrap</td>
        </tr>
        <tr>
            <td>
                <table BORDER="0">
                    <tr>
                        <td bgcolor="#fdb462"></td>
                    </tr>
                </table>
            </td>
            <td align="left">Providers</td>
        </tr>
        <tr>
            <td>
                <table BORDER="0">
                    <tr>
                        <td bgcolor="#fb8072"></td>
                    </tr>
                </table>
            </td>
            <td align="left">Exports</td>
        </tr>
    </table>>;

  ratio=compress;
  fontname="sans-serif";

  {{~it.modules :mod}}
  subgraph "cluster_{{=mod.name}}" {
    label="";
		node [shape="folder", fillcolor=1];

    /* declarations:start */

		subgraph cluster_{{=mod.name}}_declarations {
      style="solid";
			node [style="filled", shape="rect"];

	    {{~mod.declarations :declaration}}
				node [fillcolor=2];
	      "{{=declaration.name}}";
	    {{~}}

		}

    {{~mod.declarations :declaration}}
      "{{=declaration.name}}" -> "{{=mod.name}}" [style="solid", lhead="cluster_{{=mod.name}}" ltail="cluster_{{=mod.name}}_declarations"];

      subgraph "cluster_{{=mod.name}}_{{=declaration.name}}_providers" {
        style="solid";
        {{~declaration.providers :prov}}
          node [fillcolor=6, shape="oval", style="filled"];
          "{{=prov.name}}" -> "{{=declaration.name}}" [lhead="cluster_{{=mod.name}}_declarations" ltail="cluster_{{=mod.name}}_{{=declaration.name}}_providers"];
        {{~}}
      }

    {{~}}

    /* declarations:end */

    /* imports:start */

    subgraph cluster_{{=mod.name}}_imports {
      style="solid";
      node [style="filled", fillcolor=1, shape="rect"];

      ${
        loopBlock(
          'imports',
          'shape="folder"'
        )
      }
    }

    ${
      loopBlock(
        'imports',
        'lhead="cluster_{{=mod.name}}", ltail="cluster_{{=mod.name}}_imports"',
        '->'
      )
    }

    /* imports:end */

    /* exports:start */

		subgraph cluster_{{=mod.name}}_exports {
      style="solid";
			node [style="filled", fillcolor=4, shape="rect"];
			{{~mod.exports :exp}}
				"{{=exp.name}} " [label="{{=exp.name}} ", shape="rect"]
			{{~}}
		}

    {{~mod.exports :exp}}
      "{{=mod.name}}" -> "{{=exp.name}} " [style="dashed", ltail="cluster_{{=mod.name}}" lhead="cluster_{{=mod.name}}_exports"];
    {{~}}

    /* exports:end */

    /* bootstrap:start */

    subgraph cluster_{{=mod.name}}_bootstrap {
      style="solid";
      node [style="filled", fillcolor=5, shape="rect"];
      {{~mod.bootstrap :bts}}
        "{{=bts.name}} " [label="{{=bts.name}} ", shape="rect"]
      {{~}}
    }

    {{~mod.bootstrap :bts}}
      "{{=mod.name}}" -> "{{=bts.name}} " [style="dotted", lhead="cluster_{{=mod.name}}_bootstrap" ltail="cluster_{{=mod.name}}"];
    {{~}}

    /* bootstrap:end */

    /* providers:start */

    subgraph cluster_{{=mod.name}}_providers {
      style="solid";
      node [style="filled", fillcolor=6, shape="rect"];

      ${
        loopBlock(
          'providers',
          'shape="oval"'
        )
      }
    }

    ${
      loopBlock(
        'providers',
        'lhead="cluster_{{=mod.name}}", ltail="cluster_{{=mod.name}}_providers"',
        '->'
      )
    }

    /* providers:end */
  }
  {{~}}

  /* ${LEGEND} */
}
`;
