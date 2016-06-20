var Queue = require("./Queue.js");
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

function Logger() {
    this.info = function (msg) {
        console.log(msg);
    }
    return this;
}

function Site() {
    this.startRequests = [];
    this.contentType = ContentType.Html;
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
 
function ChromePluginDownloader() {

}

function Spider(name, site, userId, pageProcessor, scheduler) {
    printInfo();

    if (name == null || name == undefined || name == "" || name.trim() == "") {
        throw "name can't be null or empty.";
    }

    if (site == null || site == undefined) {
        site = Site.Create();
    }

    if (pageProcessor == null || pageProcessor == undefined) {
        throw "pageProcessor can't be null.";
    }

    if (scheduler == null || scheduler == undefined) {
        scheduler = QueueDuplicateRemovedScheduler();
    }

    this.name = name;
    this.userId = userId;
    this.pageProcessor = pageProcessor;
    this.scheduler = scheduler;
    this.logger = Logger();
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
    this.downloader = HttpDownloader();
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
            this.startRequests.push(Request(startUrls[_a], 1, {}));
        }

        return this;
    }

    this.addStartUrl = function (startUrl) {
        this.checkIfRunning();
        this.startRequests.push(Request(startUrl, 1, {}));
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
        this.downloader.threadNum = this.threadNum == 0 ? 1 : this.threadNum;
        return this;
    }

    this.initComponent = function () {
        if (this._init) {
            return;
        }

        this.scheduler.init(this);

        if (this.downloader == null || this.downloader == undefined) {
            downloader = HttpDownloader();
        }

        this.downloader.threadNum = this.threadNum;

        if (this.pipelines.length == 0) {
            //this.pipelines.push(ConsolePipeline());
        }

        if (this.startRequests != null) {
            if (this.startRequests.length > 0) {
                this.logger.info("添加网址到调度中心,数量: {" + this.startRequests.length + "}");

                for (var _a = 0; _a < this.startRequests.length; ++_a) {
                    this.scheduler.push(request, this);
                }
            }
            else {
                this.logger.info("不需要添加网址到调度中心.", true);
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

        var waitCount = 0;
        var firstTask = false;

        while (this.stat == Status.Running) {
            var request = this.scheduler.poll(this);

            if (request == null) {
                if (waitCount > _waitCountLimit && isExitWhenComplete) {
                    this.stat = Status.Finished;
                    break;
                }
                waitCount = this.waitNewUrl(waitCount);
            }
            else {
                this.logger.info("Left: {" + this.scheduler.getLeftRequestsCount(this) + "} Total: {" + this.scheduler.getTotalRequestsCount(this) + "} Thread: {" + this.threadNum + "}");

                waitCount = 0;

                try {
                    this.processRequest(request, downloader);
                    sleep(Site.SleepTime);
                    this.onSuccess(request);
                }
                catch (e) {
                    this.onError(request);
                    this.logger.error("采集失败: " + request.Url + ".", e);
                }
                finally {
                    //if (this.site.httpProxyPoolEnable && request.getExtra(Request.proxy) != null) {
                    //    this.site.returnHttpProxyToPool(request.getExtra(Request.proxy), request.getExtra(Request.statusCode));
                    //}

                    this.finishedPageCount++;
                }

                if (!firstTask) {
                    sleep(3000);
                    firstTask = true;
                }
            }
        }

        this.finishedTime = new Date();

        for (var _a = 0; _a < this.pipelines.length; ++_a) {
            this.pipelines[_a].dispose();
        }

        if (this.stat == Status.Finished) {
            this.onClose();

            this.logger.info("任务 {" + this.name + "} 结束.");
        }

        if (this.stat == Status.Stopped) {
            this.logger.info("任务 {" + this.name + "} 停止成功.");
        }

        for (var _a = 0; _a < this.closingCallBack.length; ++_a) {
            this.closingCallBack[_a]();
        }

        if (this.stat == Status.Exited) {
            this.logger.info("任务 {" + this.name + "} 退出成功.");
        }

        this.isExited = true;
    }

    this.processRequest = function (request, downloader) {
        var page = null;

        try {
            page = downloader.download(request, this);

            if (page.isSkip) {
                return;
            }

            if (this.pageHandlers != null) {
                for (var _a = 0; _a < this.pageHandlers.length; ++_a) {
                    page = this.pageHandlers[_a](page);
                }
            }

            this.pageProcessor.process(page);
        }

        catch (e) {
            if (this.site.cycleRetryTimes > 0) {
                page = this.addToCycleRetry(request, Site);
            }
            if (e.contains("下载失败:")) {
                this.logger.warn(de.Message);
            } else {
                this.logger.warn("解析页数数据失败: " + request.Url + ", 请检查您的数据抽取设置.");
            }
        }

        if (page == null) {
            this.onError(request);
            return;
        }

        if (page.isNeedCycleRetry) {
            this.extractAndAddRequests(page, true);
            return;
        }

        if (!page.missTargetUrls) {
            if (!(this.skipWhenResultIsEmpty && page.resultItems.isSkip)) {
                this.extractAndAddRequests(page, this.spawnUrl);
            }
        }

        if (!page.resultItems.isSkip) {
            for (var _a = 0; _a < this.pipelines.length; ++_a) {
                page = this.pipelines[_a].process(page.resultItems, this);
            }
        }
        else {
            var message = "页面 {" + request.Url + "} 解析结果为 0.";
            this.logger.warn(message);
        }
        this.logger.info("采集: {" + request.Url + "} 成功.");
    }

    this.waitNewUrl = function (waitCount) {
        sleep(this.waitInterval);
        return ++waitCount;
    }

    this.onClose = function () {
        this.scheduler.resetDuplicateCheck(this);
        this.scheduler.dispose();
        this.downloader.dispose();
        this.pageProcessor.dispose();
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
        while (!this.isExited) {
            sleep(500);
        }

        this.onClose();
    }

    this.exit = function () {
        this.stat = Status.Exited;
        for (var _a = 0; _a < this.closingCallBack.length; ++_a) {
            this.closingCallBack[_a]();
        }
        this.logger.warn("任务 {" + this.name + "} 退出成功.");
    }

    this.addToCycleRetry = function (request) {
        var page = Page(request, site.contentType);
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
    this._selectable = null;
    this._content = null;
    this.url = function () {
        return request.url;
    }
    this.targetUrl = null;
    this.title = null;
    this.contentType = contentType;
    this.request = request;
    this.isNeedCycleRetry = false;
    this.resultItems = ResultItems();
    this.resultItems.request = request;
    this.statusCode = null;
    this.padding = null;
    this.content = function () {
        return this._content;
    }
    this.setContent = function (content) {
        if (_content != content) {
            _content = content;
            _selectable = null;
        }
    }
    this.missTargetUrls = false;
    this.exception = null;
    this.targetRequests = [];
    this.addResultItem = function (key, value) {
        this.resultItems.addOrUpdateResultItem(key, value);
    }
    this.isSkip = function () {
        return this.resultItems.isSkip;
    }
    this.setIsSkip = function (isSkip) {
        this.resultItems.isSkip = isSkip;
    }
    this.selectable = function () {
        if (_selectable == null || _selectable == undefined) {
            _selectable = new Selectable(this._content, this.contentType == ContentType.Json ? this.padding : this.request.url, this.contentType);
        }
        return _selectable;
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
    this.addTargetRequests(requests)
    {
        for (var _a = 0; _a < requests.length; ++_a) {
            var s = requests[_a];
            if (s == null || s == undefined || s == "#" || s.startsWith("javascript:")) {
                continue;
            }
            this.targetRequests.push(requests[_a]);
        }
    }
    this.addTargetUrls(urls, priority)
    {
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
    this.addTargetUrl(url)
    {
        if (s == null || s == undefined || s == "#" || s.startsWith("javascript:")) {
            return;
        }

        this.targetRequests.push(Request(canonicalizeUrl(url, this.url), this.request.depth + 1, this.request.extras));
    }
    this.addTargetRequest(request)
    {
        this.targetRequests.push(request);
    }
    return this;
}

Page.images = "580c9065-0f44-47e9-94ea-b172d5a730c0";

function QueueDuplicateRemovedScheduler() {
    this.duplicateRemover = {};
    this._queue = Queue.Create();
    this.pushWhenNoDuplicate = function (request, spider) {
        _queue.enqueue(request);
    }
    this.resetDuplicateCheck = function (spider) {
        duplicateRemover = {};
    }
    this.push = function (request, spider) {
        if (duplicateRemover[request.identity] == null || this.shouldReserved(request)) {
            this.pushWhenNoDuplicate(request, spider);
        }
    }
    this.poll = function (spider) {
        return _queue.isEmpty() ? _queue.dequeue() : null;
    }

    this.shouldReserved = function (request) {
        var cycleTriedTimes = request.getExtra(Request.cycleTriedTimes);
        if (cycleTriedTimes == null) {
            return false;
        }
        else {
            return cycleTriedTimes > 0;
        }
    }
    this.dispose = function () {
        duplicateRemover = null;
    }
    this.getLeftRequestsCount = function (spider) {
        return _queue.getLength();
    }

    this.getTotalRequestsCount = function (spider) {
        return duplicateRemover.length;
    }
    this.init = function () {
    }
    return this;
}

function ResultItems() {
    this.fields = {};
    this.isSkip = false;
    this.request = null;
    this.getResultItem = function (key) {
        return fields[key];
    };
    this.addOrUpdateResultItem = function (key, value) {
        fields[key] = value;
        return this;
    }
    return this;
}

function sleep(d) {
    for (var t = Date.now(); Date.now() - t <= d;);
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
    console.log("");
}

sleep(5000);
exports.Spider = Spider;
exports.Site = Site;
exports.QueueDuplicateRemovedScheduler = QueueDuplicateRemovedScheduler;
exports.HttpDownloader = HttpDownloader;
exports.ChromePluginDownloader = ChromePluginDownloader;