export const environment = {
    production: true,
    apiUrl: window["env"]["apiUrl"] || "http://localhost:4000",
    debug: window["env"]["debug"] || false
};
