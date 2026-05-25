(function (window) {
    window["env"] = window["env"] || {};

    // Overridden at deploy time by env.template.js substitution.
    // For local dev, change apiUrl here or set via env.template.js.
    window["env"]["apiUrl"] = "http://localhost:4000";
    window["env"]["debug"] = true;
})(this);