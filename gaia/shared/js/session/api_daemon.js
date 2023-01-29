!(function (exports) {
  "use strict";

  const ApiDaemon = {
    port: 8081,

    init: function () {
      this.loadService("shared", "core");
      this.loadService("shared", "session");
    },

    loadService: function (service, script = "service") {
      var script = document.createElement("script");
      script.src = `http://127.0.0.1:${this.port}/api/v1/${service}/${script}.js`;
      document.body.appendChild(script);
    },
  };

  exports.ApiDaemon = ApiDaemon;
})(window);
