var Request = require("./Request.js");
require("./Status.js");
var HttpDownlader = require("./HttpDownloader.js");
var Log = require("./Log.js");
var Site = require("./Site.js");

String.prototype.Trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

function Spider(name, site, userId, pageProcessor, scheduler) {
    if (name == null || name == undefined || name == '' || name.tr) {
        throw "name can't be null or empty.";
    }

    if (site == null || site == undefined) {
        site = Site.Create();
    }

    if (pageProcessor == null || pageProcessor == undefined) {
        throw "pageProcessor can't be null.";
    }

    if (scheduler == null || scheduler == undefined) {
        scheduler = new QueueScheduler();
    }

    this.name = name;
    this.userId = userId;
    this.pageProcessor = pageProcessor;
    this.scheduler = scheduler;
    this.logger = Log.Logger();
    this.site = site;
    this.pageProcessor.site = site;
    this.startRequests = site.startRequests;
    this.scheduler = scheduler;
    this._errorRequestsFile = "./" + name + "_errorRequest.txt";
    this.stat = Status.Init;
    this.threadNum = 1;
    this.deep = 65535;
    this.finishedCount = 0;
    this.spawnUrl = true;
    this.skipWhenResultIsEmpty = false;
    this.saveStatus = true;
    this.pipelines = [];
    this.downloader = HttpDownlader.Create();
    this.requestSuccessCallback = [];
    this.requestFailedCallback = [];
    this.closingCallBack = [];
    this.settings = {};
    this.isExited = false;
    this.startRequests = [];
    this.waitInterval = 8;
    this._waitCountLimit = 20;
    this._waitCount;
    this._init = false;

    this.setThreadNum = function (number) {
        this.checkIfRunning();
        if (this.threadNum <= 0) {
            throw "ThreadNum should be more than 1.";
        }
        this.threadNum = number;
        if (this.downloader != null && this.downloader != undefined) {
            this.downloader.threadNum = threadNum;
        }
        return this;
    }

    this.setEmptySleepTime = function (emptySleepTime) {
        if (this.emptySleepTime >= 1000) {
            this._waitCountLimit = this.emptySleepTime / this.waitInterval;
        }
        else {
            throw "Sleep time should be large than 1000.";
        }
    }

    this.addStartUrls = function (startUrls) {
        CheckIfRunning();
        for (var _a; _a < startUrls.length; ++_a) {
            this.startRequests.push(Request.Create(startUrls[_a], 1));
        }

        return this;
    }

    this.checkIfRunning = function () {
        if (this.stat == Status.Running) {
            throw "Spider is already running!";
        }
    }

    this.setRequestSuccessCallback = function (event) {
        this.requestSuccessCallback.push(event);
    }

    this.setRequestFailedCallback = function (event) {
        this.requestFailedCallback.push(event);
    }

    return this;
}
exports.Create = Spider;