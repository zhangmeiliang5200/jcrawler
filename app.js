var JCrawler = require("./jcrawler");

var spider = JCrawler.Spider("test", JCrawler.Site(), "jcrawler", {}, JCrawler.QueueDuplicateRemovedScheduler());
spider.addStartUrl("http://news.cnblogs.com/n/page/1/")
spider.addStartUrl("http://news.cnblogs.com/n/page/2/")
spider.run();