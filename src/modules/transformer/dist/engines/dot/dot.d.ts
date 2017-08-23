export interface IOptions {
    name?: string;
    output?: string;
    displayLegend?: boolean;
    outputFormats?: string;
    silent?: boolean;
    dot?: {
        shapeModules: string;
        shapeProviders: string;
        shapeDirectives: string;
        colorScheme: string;
    };
}
export declare class DotEngine {
    template: string;
    cwd: string;
    files: {
        component: any;
    };
    paths: {
        dot: any;
        json: any;
        png: any;
        svg: any;
        html: any;
    };
    options: IOptions;
    constructor(options: IOptions);
    updateOutput(output: string): void;
    generateGraph(deps: any): Promise<any[]>;
    private cleanGeneratedFiles();
    private preprocessTemplates(options?);
    private generateJSON(deps);
    private escape(deps);
    private generateDot(template, deps);
    private generateSVG();
    private generateHTML();
    private generatePNG();
}
