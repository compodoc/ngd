import { Transformer } from '../engine';
export declare class HtmlTransformer implements Transformer {
    type: string;
    transform(deps: any, options: any): Promise<string>;
}
