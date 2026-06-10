package io.retrofitui.autoconfigure.spec;

public record EndpointDirective(String method, String url) {
    public static EndpointDirective get(String url)    { return new EndpointDirective("GET",    url); }
    public static EndpointDirective post(String url)   { return new EndpointDirective("POST",   url); }
    public static EndpointDirective put(String url)    { return new EndpointDirective("PUT",    url); }
    public static EndpointDirective delete(String url) { return new EndpointDirective("DELETE", url); }
}
