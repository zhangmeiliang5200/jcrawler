var Site = require('./Site.js');
var Spider = require('./Spider.js');
var QueueDuplicateRemovedScheduler = require("./QueueDuplicateRemovedScheduler.js");
var EntityPipeline = require('./EntityPipeline.js');

function ChromeModeSpider(context) {
    if (context == null || context == undefined) {
        return;
    }
    this.spiderContext = context;
    this.name = context.name;
    if (context.downloader == null || context.downloader == undefined) {
        context.downloader = 'httpdownloader';
    }
    if (context.site == null || context.site == undefined) {
        context.site = new Site();
    }
    this.generatePipeline = function (option) {

    }
    this.run = function () {
        console.log("构建爬虫...");

        var processor = new EntityProcessor(this.spiderContext);
        for (var _a = 0; _a < this.spiderContext.targetUrlExtractInfos.length; ++_a) {
            processor.targetUrlExtractInfos.push(this.spiderContext.targetUrlExtractInfos[_a]);
        }
        for (var _a = 0; _a < this.spiderContext.entities.length; ++_a) {
            processor.addEntity(this.spiderContext.entities[_a]);
        }
        var spider = new Spider(this.name, this.spiderContext.Site, this.spiderContext.userId, processor, new QueueDuplicateRemovedScheduler());

        for (var _a = 0; _a < this.spiderContext.entities.length; ++_a) {
            var entity = this.spiderContext.entities[_a];
            var entiyName = entity.Name;

            var schema = entity.Schema;

            var pipelines = [];
            for (var _b = 0; _b < this.spiderContext.Pipelines.length; ++_b) {
                pipelines.push(this.generatePipeline(this.spiderContext.Pipelines[_a]));
                spider.addPipeline(new EntityPipeline(entiyName, pipelines));
            }
        }

        spider.setEmptySleepTime(this.spiderContext.emptySleepTime);
        spider.setThreadNum(this.spiderContext.threadNum);
        spider.deep = this.spiderContext.deep;
        spider.setDownloader(this.spiderContext.Downloader.GetDownloader());
        spider.skipWhenResultIsEmpty = this.spiderContext.skipWhenResultIsEmpty;

        spider.run();
    }
    return this;
}
module.exports = ChromeModeSpider