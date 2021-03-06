/**
 * Temporary service until Angular's default $http service can be used in FirefoxOS
 * The problem is that a property called mozSystem set to true needs to be added to the
 * XMLHttpRequest.
 **/
angular.module('TinyRSS')
.factory("http", function(){

  return {
    post: function (url, options, successCallback, errorCallback) {
      var xhr = new XMLHttpRequest({mozSystem: true});

      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          if(xhr.status == 200) {
            successCallback(xhr);
          } else {
            errorCallback(xhr);
          }
        }
      };
      xhr.open("POST", url, true);
      xhr.send(JSON.stringify(options));
    }
  }
});
