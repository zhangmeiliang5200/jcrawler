function EntityPipeline(entityName, pipelines) {
    this.entityName = entityName;
    this.pipelines = pipelines;
    for (var _a = 0; _a < this.pipelines.length; ++_a) {
        this.pipelines[_a].initialize();
    }
    this.process = function (resultItems, spider) {
        if (resultItems == null || resultItems == undefined) {
            return;
        }

        var list = [];

        var data = resultItems.getResultItem(this.entityName);

        if (data != null) {
            if (data instanceof Array) {
                for (var _a = 0; _a < data.length; ++_a) {
                    list.push(data[_a]);
                }
            }
            else {
                list.push(data);
            }
        }

        for (var _a = 0; _a < this.pipelines.length; ++_a) {
            this.pipelines[_a].process(list, spider);
        }
    }
}
module.exports = EntityPipeline