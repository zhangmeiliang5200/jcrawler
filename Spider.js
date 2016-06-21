var HttpDownloader = require("./HttpDownloader.js");
var Site = require("./Site.js");
var QueueDuplicateRemovedScheduler = require("./QueueDuplicateRemovedScheduler.js");
var ConsolePipeline = require("./ConsolePipeline.js");
var $=require('jquery');

String.prototype.contains = function (text) {
    if (text == '') return true;
    else if (text == null) return false;
    else return this.indexOf(text) !== -1;
}

// ( 2 ) String.count()
String.prototype.count = function (text) {
    if (this.contains(text))
        return this.split(text).length - 1;
    else
        return 0;
}

// ( 3 ) String.capitalize()
String.prototype.capitalize = function () {
    if (this == '') return this;
    else return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

// ( 4 ) String.trim()
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
}

// ( 5 ) String.leftTrim()
String.prototype.leftTrim = function () {
    return this.replace(/^\s+/, '');
}

// ( 6 ) String.rightTrim()
String.prototype.rightTrim = function () {
    return this.replace(/\s+$/, '');
}

// ( 7 ) String.clear()
String.prototype.clear = function () {
    return this.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
}

// ( 8 ) String.startsWith()
String.prototype.startsWith = function (start) {
    if (start == '') return true;
    else if (start == null || start.length > this.length) return false;
    else return this.substring(0, start.length) == start;
}

// ( 9 ) String.endsWith()
String.prototype.endsWith = function (end) {
    if (end == '') return true;
    else if (end == null || end.length > this.length) return false;
    else return this.indexOf(end, this.length - end.length) !== -1;
}

var Status = { Init: 0, Running: 1, Stopped: 2, Finished: 4, Exited: 8 }

var ContentType = { Html: 0, Json: 1 }

function Request(url, grade, extras) {
    this.url = url;
    this.referer = null;
    this.origin = null;
    this.priority = 0;
    this.extras = {};
    this.method = "GET";
    this.postBody = null;
    if (extras != null && extras != undefined) {
        for (var p in extras) {
            this.putExtra(p, extras[p]);
        }
    }
    this.depth = grade;
    this.putExtra = function (key, value) {
        if (key == null || key == undefined) {
            return;
        }
        if (extras == null || extras == undefined) {
            extras = {};
        }
        extras[key] = value;
        return this;
    }
    this.getExtra = function (key) {
        if (extras == null || extras == undefined) {
            return null;
        }
        return extras[key];
    }
    this.existExtra = function (key) {
        if (extras == null || extras == undefined) {
            return false;
        }
        return extras[key] != null;
    }
    this.identity = function () {
        return md5(this.url + this.postBody);
    }
    return this;
}

Request.cycleTriedTimes = "983009ae-baee-467b-92cd-44188da2b021";
Request.statusCode = "02d71099-b897-49dd-a180-55345fe9abfc";
Request.proxy = "6f09c4d6-167a-4272-8208-8a59bebdfe33";

function Spider(name, site, userId, pageProcessor, scheduler) {
    printInfo();

    if (name == null || name == undefined || name == "" || name.trim() == "") {
        throw "name can't be null or empty.";
    }

    if (site == null || site == undefined) {
        site = new Site();
    }

    if (pageProcessor == null || pageProcessor == undefined) {
        throw "pageProcessor can't be null.";
    }

    if (scheduler == null || scheduler == undefined) {
        scheduler = new QueueDuplicateRemovedScheduler();
    }

    this.name = name;
    this.userId = userId;
    this.site = site;
    this.pageProcessor = pageProcessor;
    this.pageProcessor["site"] = site;
    this.scheduler = scheduler;
    this.startRequests = site.startRequests;
    this.scheduler = scheduler;
    this._errorRequestsFile = "./" + name + "_errorRequest.txt";
    this.stat = Status.Init;
    //由于JS的异步特性，因此定义threadnum为每秒中运行的URL数量
    this.threadNum = 1;
    this.deep = 65535;
    this.finishedCount = 0;
    this.spawnUrl = true;
    this.skipWhenResultIsEmpty = false;
    this.saveStatus = true;
    this.pipelines = [];
    this.downloader = new HttpDownloader();
    this.requestSuccessCallback = [];
    this.requestFailedCallback = [];
    this.closingCallBack = [];
    this.settings = {};
    this.isExited = false;
    this.startRequests = [];
    this.waitInterval = 500;
    this._waitCountLimit = 15000 / this.waitInterval;
    this._waitCount = 0;
    this._init = false;
    this.isExitWhenComplete = true;

    this.setThreadNum = function (number) {
        this.checkIfRunning();
        if (this.threadNum <= 0) {
            throw "ThreadNum should be more than 1.";
        }
        this.threadNum = number;
        var emptySleepTime = this._waitCountLimit * this.waitInterval;
        this.waitInterval = 1000 / number;
        this._waitCountLimit = emptySleepTime / this.waitInterval;
        return this;
    }

    this.setEmptySleepTime = function (emptySleepTime) {
        if (emptySleepTime >= 1000) {
            this._waitCountLimit = emptySleepTime / this.waitInterval;
        }
        else {
            throw "Sleep time should be large than 1000.";
        }
    }

    this.addStartUrlRequests = function (startUrlRequests) {
        this.checkIfRunning();
        for (var _a; _a < startUrlRequests.length; ++_a) {
            this.startRequests.push(startUrlRequests[_a]);
        }

        return this;
    }

    this.addStartUrlRequest = function (startUrlRequest) {
        this.checkIfRunning();
        this.startRequests.push(startUrlRequest);
        return this;
    }

    this.addStartUrls = function (startUrls) {
        this.checkIfRunning();
        for (var _a; _a < startUrls.length; ++_a) {
            this.startRequests.push(new Request(startUrls[_a], 1, {}));
        }

        return this;
    }

    this.addStartUrl = function (startUrl) {
        this.checkIfRunning();
        this.startRequests.push(new Request(startUrl, 1, {}));
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

    this.addPipeline = function (pipeline) {
        this.checkIfRunning();
        this.pipelines.push(pipeline);
        return this;
    }

    this.clearPipeline = function (pipeline) {
        this.checkIfRunning();
        this.pipelines = [];
        return this;
    }

    this.setDownloader = function (downloader) {
        this.checkIfRunning();
        this.downloader = downloader;
        return this;
    }

    this.initComponent = function () {
        if (this._init) {
            return;
        }

        this.scheduler.init(this);

        if (this.downloader == null || this.downloader == undefined) {
            downloader = new HttpDownloader();
        }

        //this.downloader.threadNum = this.threadNum;

        if (this.pipelines.length == 0) {
            throw "Please set at least one pipeline.";
        }

        if (this.startRequests != null) {
            if (this.startRequests.length > 0) {

                this.info("添加网址到调度中心,数量: " + this.startRequests.length);

                for (var _a = 0; _a < this.startRequests.length; ++_a) {
                    this.scheduler.push(this.startRequests[_a], this);
                }
            }
            else {
                this.info("不需要添加网址到调度中心.");
            }
        }

        _init = true;
    }

    this.run = function () {
        this.checkIfRunning();

        this.stat = Status.Running;
        this.isExited = false;
        this.initComponent();

        if (this.startTime == null || this.startTime == undefined) {
            this.startTime = new Date();
        }

        setInterval(this.processRequest, this.waitInterval, this);
    }

    this.processRequest = function (spider) {
        var request = spider.scheduler.poll(spider);
        if (request == null) {
            if (spider._waitCount > spider._waitCountLimit && spider.isExitWhenComplete) {
                spider.stat = Status.Finished;
                if (!spider.isExited) {
                    spider.finishedTime = new Date();

                    for (var _a = 0; _a < spider.pipelines.length; ++_a) {
                        spider.pipelines[_a].dispose();
                    }

                    if (spider.stat == Status.Finished) {
                        spider.onClose();

                        spider.info("任务 " + spider.name + " 结束.");
                    }

                    if (spider.stat == Status.Stopped) {
                        spider.info("任务 " + spider.name + " 停止成功.");
                    }

                    for (var _a = 0; _a < spider.closingCallBack.length; ++_a) {
                        spider.closingCallBack[_a]();
                    }

                    if (spider.stat == Status.Exited) {
                        spider.info("任务 " + spider.name + " 退出成功.");
                    }

                    spider.isExited = true;
                    spider.processRequest = null;
                }
                return;
            }
            ++spider._waitCount;
        }
        else {
            spider.info("Left: " + spider.scheduler.getLeftRequestsCount(spider) + " Total: " + spider.scheduler.getTotalRequestsCount(spider) + " Thread: " + spider.threadNum);

            spider._waitCount = 0;

            try {
                var page = new Page(request, spider.site.contentType);

                spider.downloader.download(page, spider, function (p) {
                    if (p.resultItems.isSkip) {
                        return;
                    }

                    if (spider.pageHandlers != null) {
                        for (var _a = 0; _a < spider.pageHandlers.length; ++_a) {
                            p = spider.pageHandlers[_a](p);
                        }
                    }

                    spider.pageProcessor.process(p);

                    if (p == null) {
                        spider.onError(request);
                        return;
                    }

                    if (p.isNeedCycleRetry) {
                        spider.extractAndAddRequests(p, true);
                        return;
                    }

                    if (!p.missTargetUrls) {
                        if (!(spider.skipWhenResultIsEmpty && p.resultItems.isSkip)) {
                            spider.extractAndAddRequests(p, spider.spawnUrl);
                        }
                    }

                    if (!p.resultItems.isSkip) {
                        for (var _a = 0; _a < spider.pipelines.length; ++_a) {
                            spider.pipelines[_a].process(p.resultItems, spider);
                        }
                    }
                    else {
                        var message = "页面 " + request.url + " 解析结果为 0.";
                        spider.warn(message);
                    }
                    spider.onSuccess(p.request);
                    spider.info("采集: " + p.request.url + " 成功.");
                }, function (p) {
                    if (spider.site.cycleRetryTimes > 0) {
                        p = spider.addToCycleRetry(request, spider.site);
                    }
                    if (e.contains("下载失败:")) {
                        spider.warn(de.Message);
                    } else {
                        spider.warn("解析页数数据失败: " + request.Url + ", 请检查您的数据抽取设置.");
                    }
                });

            }
            catch (e) {
                spider.error("采集失败: " + request.Url + ".", e);
            }
            finally {
                //if (this.site.httpProxyPoolEnable && request.getExtra(Request.proxy) != null) {
                //    this.site.returnHttpProxyToPool(request.getExtra(Request.proxy), request.getExtra(Request.statusCode));
                //}

                spider.finishedPageCount++;
            }
        }
    }

    this.onClose = function () {
        this.scheduler.resetDuplicateCheck(this);
        this.scheduler.dispose();
        this.downloader.dispose();
        this.pageProcessor.dispose();
    }

    this.info = function (msg) {
        var m = "[INFO] [" + new Date() + "] " + msg;
        console.info(m);
    }

    this.warn = function (msg) {
        var m = "[WARN] [" + new Date() + "] " + msg;
        console.warn(m);
    }

    this.error = function (msg) {
        var m = "[ERROR] [" + new Date() + "] " + msg;
        console.error(m);
    }

    this.onError = function (request) {
        for (var _a = 0; _a < this.requestFailedCallback.length; ++_a) {
            this.requestFailedCallback[_a](request);
        }
    }

    this.onSuccess = function (request) {
        for (var _a = 0; _a < this.requestSuccessCallback.length; ++_a) {
            this.requestSuccessCallback[_a](request);
        }
    }

    this.dispose = function () {
        // while (!this.isExited) {
        //     sleep(500);
        // }

        this.onClose();
    }

    this.exit = function () {
        this.stat = Status.Exited;
        for (var _a = 0; _a < this.closingCallBack.length; ++_a) {
            this.closingCallBack[_a]();
        }
        this.warn("任务 " + this.name + " 退出成功.");
    }

    this.addToCycleRetry = function (request) {
        var page = new Page(request, site.contentType);
        var cycleTriedTimesObject = request.getExtra(Request.cycleTriedTimes);
        if (cycleTriedTimesObject == null) {
            request.priority = 0;
            page.addTargetRequest(request.PutExtra(Request.cycleTriedTimes, 1));
        }
        else {
            var cycleTriedTimes = cycleTriedTimesObject;
            cycleTriedTimes++;
            if (cycleTriedTimes >= site.cycleRetryTimes) {
                return null;
            }
            request.Priority = 0;
            page.addTargetRequest(request.putExtra(Request.cycleTriedTimes, cycleTriedTimes));
        }
        page.isNeedCycleRetry = true;
        return page;
    }
    this.extractAndAddRequests = function (page, spawnUrl) {
        if (spawnUrl && (page.request.depth + 1) < this.deep && page.targetRequests != null && page.targetRequests.length > 0) {
            for (var _a = 0; _a < page.targetRequests.length; ++_a) {
                this.scheduler.push(page.targetRequests[_a], this);
            }
        }
    }
    this.clearStartRequests = function () {
        this.startRequests = [];
    }
    return this;
}

function Page(request, contentType) {
    this.content = null;
    this.targetUrl = null;
    this.title = null;
    this.contentType = contentType;
    this.request = request;
    this.isNeedCycleRetry = false;
    this.resultItems = ResultItems();
    this.resultItems.request = request;
    this.statusCode = null;
    this.padding = null;
    this.missTargetUrls = false;
    this.exception = null;
    this.targetRequests = [];
    this.addResultItem = function (key, value) {
        this.resultItems.addOrUpdateResultItem(key, value);
    }
    this.addTargetRequests = function (urls) {
        for (var _a = 0; _a < urls.length; ++_a) {
            var s = urls[_a];
            if (s == null || s == undefined || s == "#" || s.startsWith("javascript:")) {
                continue;
            }
            this.targetRequests.push(Request(canonicalizeUrl(s, this.url), this.request.depth + 1, this.request.extras));
        }
    }
    this.addTargetRequests = function (requests) {
        for (var _a = 0; _a < requests.length; ++_a) {
            var s = requests[_a];
            if (s == null || s == undefined || s == "#" || s.startsWith("javascript:")) {
                continue;
            }
            this.targetRequests.push(requests[_a]);
        }
    }
    this.addTargetUrls = function (urls, priority) {
        for (var _a = 0; _a < urls.length; ++_a) {
            var s = urls[_a];
            if (s == null || s == undefined || s == "#" || s.startsWith("javascript:")) {
                continue;
            }
            var request = Request(canonicalizeUrl(s, this.url), this.request.depth + 1, this.request.extras);
            request.priority = priority;
            this.targetRequests.push(request);
        }
    }
    this.addTargetUrl = function (url) {
        if (s == null || s == undefined || s == "#" || s.startsWith("javascript:")) {
            return;
        }

        this.targetRequests.push(Request(canonicalizeUrl(url, this.url), this.request.depth + 1, this.request.extras));
    }
    this.addTargetRequest = function (request) {
        this.targetRequests.push(request);
    }
    return this;
}

Page.images = "580c9065-0f44-47e9-94ea-b172d5a730c0";

function ResultItems() {
    this.fields = {};
    this.isSkip = false;
    this.request = null;
    this.getResultItem = function (key) {
        return this.fields[key];
    };
    this.addOrUpdateResultItem = function (key, value) {
        this.fields[key] = value;
        return this;
    }
    return this;
}



function canonicalizeUrl(url, refer) {
    // 实现对相对路径的补充
    return url;
}

function printInfo() {
    console.log("=============================================================");
    console.log("== JCrawler is an open source js/nodejs spider              ==");
    console.log("== It's a light, stable, high performce spider             ==");
    console.log("== Support multi thread, ajax page, http                   ==");
    console.log("== Support save data to file, mysql, mssql, mongodb etc    ==");
    console.log("== License: LGPL3.0                                        ==");
    console.log("== Version: 0.9.10                                         ==");
    console.log("== Author: zlzforever@163.com                              ==");
    console.log("=============================================================");
}

exports.Spider = Spider;