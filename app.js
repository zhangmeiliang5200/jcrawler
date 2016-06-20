var Spider = require("./jcrawler");
var Site = require("./jcrawler/Site");

var crawler = Spider.Create("test", Site.Create(), "jcrawler", {}, {});
crawler.setThreadNum(2);
console.log(crawler.threadNum);