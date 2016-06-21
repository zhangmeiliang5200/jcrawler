var TestConsolePipeline = require("./TestConsolePipeline.js");
var QueueDuplicateRemovedScheduler = require("./QueueDuplicateRemovedScheduler.js");
var JCrawler = require(".");
var Site = require("./Site.js");
var SimplePageProcessor = require("./SimplePageProcessor.js");

var spider = JCrawler.Spider("test", new Site(), "jcrawler", new SimplePageProcessor(), new QueueDuplicateRemovedScheduler());
spider.addPipeline(new TestConsolePipeline());
spider.addStartUrl("http://news.cnblogs.com/n/page/1/")
spider.addStartUrl("http://news.cnblogs.com/n/page/2/")
spider.run();
