var request = require('request');
const url = require('url');

function HttpDownloader() {
    this.download = function (page, spider, sucessCallback, failedCallback) {
        if (spider.site == null || spider.site == undefined) {
            return null;
        }

        var site = spider.site;

        var acceptStatCodes = site.acceptStatCode;


        // if (GeneratePostBody != null) {
        //     SingleExecutor.Execute(() => {
        //         GeneratePostBody(spider.Site, request);
        //     });
        //  }
        var options = this.generateHttpOptions(page.request, site);

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                page.content = body;
                page.statusCode = 200;
                for (var header in response.headers) {
                    page.request.putExtra(header.Key, header.Value);
                }

                sucessCallback(page);
            } else {
                failedCallback(page.request, error);
            }
        });
    }

    this.generateHttpOptions = function (request, site) {
        var options = {};
        options.url = request.url;
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
    this.dispose = function () {

    }
    return this;
}
module.exports = HttpDownloader