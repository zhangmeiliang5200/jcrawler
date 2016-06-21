function Site() {
    this.startRequests = [];
    this.contentType = 0;
    this.domain = null;
    this._encodingName = null;
    this.headers = {};
    this.arguments = {};
    this.userAgent = null;
    this.accept = null;
    this.timeout = 5000;
    this.acceptStatCode = [200];
    this.maxSleepTime = 1000;
    this.minSleepTime = 100;
    this.retryTimes = 5;
    this.cycleRetryTimes = 5;
    this.cookie = null;
    this.proxy = null;
    this.isUseGzip = false;
    this.clearStartRequests = function () {
        this.startRequests = [];
    }
    this.addStartUrl = function (startUrl) {
        this.addStartUrlRequest(Request(startUrl, 1, {}));
        return this;
    }
    this.addStartUrl = function (startUrl, extras) {
        this.addStartUrlRequest(Request(startUrl, 1, extras));
        return this;
    }
    this.addStartUrls = function (startUrls) {
        for (var _a = 0; _a < startUrls.length; ++_a) {
            this.addStartUrlRequest(Request(startUrls[_a], 1, extras));
        }
        return this;
    }
    this.addStartUrlRequest = function (request) {
        this.startRequests.push(requst);
        if (this.domain == null) {
            this.domain = startRequest.url.host;
        }
        return this;
    }
    this.addHeader = function (key, value) {
        this.headers[key] = value;
        return this;
    }
    return this;
}
module.exports =  Site;