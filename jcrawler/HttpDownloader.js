const http = require('http');
const https = require('https');

function HttpDownloader() {
    this.download = function (request, spider) {
        if (spider.site == null || spider.site == undefined) {
            return null;
        }

        var site = spider.site;

        var acceptStatCodes = site.acceptStatCode;

        try {
            // if (GeneratePostBody != null) {
            //     SingleExecutor.Execute(() => {
            //         GeneratePostBody(spider.Site, request);
            //     });
            //  }
            var options = this.generateHttpOptions(request, site);
            var client = null;
            if (request.url.subString(0, 6) == "https:") {
                client = https;
            } else {
                client = http;
            }
            client.request(options, (res) => {
                res.on('data', (d) => {
                    var page = this.handleResponse(request, res, d, site);
                    page.targetUrl = request.Url.ToString();
                    return page;
                });
            }).on('error', (e) => {
                throw "下载 {" + request.Url + "} 失败. Exception: {" + e + "}";
            });
        }
        catch (e) {
            var page = Page(request, site.contentType);
            throw e;
        }
    }
    this.handleResponse = function (request, res, response, site) {
        var page = Page(request, site.contentType);
        page.content = response;
        page.url = request.url;
        page.statusCode = 200;
        for (var header in res.headers) {
            page.request.putExtra(header.Key, header.Value);
        }

        return page;
    }
    this.generateHttpOptions = function (request, site) {
        var options = {};
        options.hostname = request.url;
        options.path = request.url;
        if (request.url.subString(0, 6) == "https:") {
            options.port = 443;
        } else {
            options.port = 80;
        }
        options.method = request.method;
        options.headers = {};
        if (site.headers["Content-Type"] != null && site.headers["Content-Type"] != "NULL") {
            options.headers["ContentType"] = "application /x-www-form-urlencoded; charset=UTF-8";
        }

        if (site.headers["UserAgent"] != null) {
            options.headers["UserAgent"] = site.headers["UserAgent"];
        }
        else {
            options.headers["User-Agent"] = (site.userAgent == null || site.userAgent == "") ? "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36" : site.userAgent;
        }

        if (request.referer != null && request.referer != "") {
            options.headers["Referer"] = request.referer;
        }

        //httpWebRequest.Headers.Add("Accept", site.Accept ?? "application/json, text/javascript, */*; q=0.01");
        // httpWebRequest.Headers.Add("Accept-Language", "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3");

        if (site.isUseGzip) {
            options.headers["Accept-Encoding"] = "gzip";
        }

        if (site.headers != null) {
            for (var header in site.headers) {
                options.headers[header.Key] = header.Value;
            }
        }
        options.headers["Cookie"] = site.cookie;

        if (options.method == "POST") {
            //var data = string.IsNullOrEmpty(site.EncodingName) ? Encoding.UTF8.GetBytes(request.PostBody) : site.Encoding.GetBytes(request.PostBody);
            //httpWebRequest.Content = new StreamContent(new MemoryStream(data));

            //if (site.Headers.ContainsKey("Content-Type")) {
            //    httpWebRequest.Content.Headers.Add("Content-Type", site.Headers["Content-Type"]);
            //}
        }

        return options;
    }
    return this;
}
exports.Create = HttpDownloader;