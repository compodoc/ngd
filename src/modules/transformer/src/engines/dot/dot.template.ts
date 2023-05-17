export const LEGEND = `<
<table BORDER="0">
    <tr>
        <td colspan="5" align="center"><b>Legend</b></td>
    </tr>
    <tr>
        <td>
            <table BORDER="0">
                <tr>
                    <td bgcolor="#ffffb3" width="20"></td>
                    <td>  Declarations</td>
                </tr>
            </table>
        </td>
        <td>
            <table BORDER="0">
                <tr>
                    <td bgcolor="#8dd3c7" width="20"></td>
                    <td>  Module</td>
                </tr>
            </table>
        </td>
        <td>
            <table BORDER="0">
                <tr>
                    <td bgcolor="#80b1d3" width="20"></td>
                    <td>  Bootstrap</td>
                </tr>
            </table>
        </td>
        <td>
            <table BORDER="0">
                <tr>
                    <td bgcolor="#fdb462" width="20"></td>
                    <td>  Providers</td>
                </tr>
            </table>
        </td>
        <td>
            <table BORDER="0">
                <tr>
                    <td bgcolor="#fb8072" width="20"></td>
                    <td>  Exports</td>
                </tr>
            </table>
        </td>
    </tr>
</table>
>`;

const loopBlock = (symbols, attrs, edge = '') => {
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
    } else {
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
};

export const DOT_TEMPLATE = `
digraph dependencies {
  node [shape="rect", style="filled", colorscheme=###scheme###];
  ranksep=0.4;
  compound=false;
  remincross=true;
  splines=true;
  splines=ortho;

  rankdir=LR;
  rankdir=TB;
  rankdir=BT;

  label=###legend###;

  ratio=compress;
  fontname="Times-12";

  {{~it.modules :mod}}
  subgraph "cluster_{{=mod.name}}" {
    label="";
    style="dotted";
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

      ${loopBlock('imports', 'shape="folder"')}
    }

    ${loopBlock('imports', 'lhead="cluster_{{=mod.name}}", ltail="cluster_{{=mod.name}}_imports"', '->')}

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

      ${loopBlock('providers', 'shape="oval"')}
    }

    ${loopBlock('providers', 'lhead="cluster_{{=mod.name}}", ltail="cluster_{{=mod.name}}_providers"', '->')}

    /* providers:end */
  }
  {{~}}

  /* ${LEGEND} */
}
`;
