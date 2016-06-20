var JCrawler = require("./jcrawler/Spider.js");

var spider = JCrawler.Spider("test", JCrawler.Site(), "jcrawler", {}, JCrawler.QueueDuplicateRemovedScheduler());
spider.setDownloader();
spider.run();