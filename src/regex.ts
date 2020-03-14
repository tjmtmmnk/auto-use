export class AutoUseRegex {
    // e.g) @EXPORT = qw(hoge fuga);
    static readonly EXPORT = /@EXPORT(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g;

    // e.g) @EXPORT_OK = qw(hoge fuga);
    static readonly EXPORT_OK = /@EXPORT_OK(\s*=\s*)qw(\/|\()(\s*\w+\s*)*(\/|\));/g;

    // e.g) package Hoge::Fuga;
    static readonly PACKAGE = /package [A-Za-z0-9:]+;/;

    // e.g) use Hoge::Fuga;
    static readonly USE = /use [A-Za-z0-9:]+;/g;

    // e.g) use Hoge::Fuga qw(bar);
    static readonly USE_SUB = /use [A-Za-z0-9:]+ qw(\/|\()(\s*\w+\s*)*(\/|\));/g;

    // e.g) Hoge::Fuga->bar;
    static readonly METHOD_MODULE = /([A-Z][a-z0-9]*(::)?)+->/;
    
    // e.g) Hoge::Fuga->bar();
    static readonly SUB_MODULE = /(([A-Z][a-z0-9]*(::)?)+)([a-z0-9_]+)(\(|;)/;
}