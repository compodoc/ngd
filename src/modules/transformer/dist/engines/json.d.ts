import { Transformer } from './engine';
export declare class JsonTransformer implements Transformer {
    type: string;
    transform(deps: any, options: any): Promise<{}>;
}
