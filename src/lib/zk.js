var wraper = function () {
    /**
     * callback context
     */
    this.cbCtx = {};
};
var invoke = function (handler, ctx) {
    typeof handler === 'function' && handler.apply(ctx, Array.prototype.splice.call(arguments, 2, arguments.length - 2));
}
wraper.prototype = {
    isConnected() {
        return this.zk.state === ZooKeeper.State.SYNC_CONNECTED;
    },
    checkConnected(error) {
        if (!this.isConnected()) {
            invoke(error, this.cbCtx, "not connected");
            return false;
        }
        return true;
    },
    connect(url, success, error) {
        var that = this;
        this.zk = ZooKeeper.createClient(
            url// zk server的服务器地址和监听的端口号
        );
        this.zk.once('connected', function () {
            invoke(success, that.cbCtx);
        });
        this.zk.connect();
    },
    hello(success, error) {
        this.get("/com.ssuupper.exec/testzookeeper", success, error)
    },
    get(path, success, error) {
        var that = this;
        if (this.checkConnected(error)) {
            this.zk.getData(path,
                function (err, data, stat) {
                    if (err) {
                        invoke(error, that.cbCtx, err);
                    } else {
                        invoke(success, that.cbCtx, stat, data ? data.toString("utf8") : "");
                    }
                });
        }
    },
    set(path, value, success, error) {
        var that = this;
        if (this.checkConnected(error)) {
            this.zk.setData(path, value, -1,
                function (err, stat) {
                    if (err) {
                        invoke(error, that.cbCtx, err);
                    } else {
                        invoke(success, that.cbCtx, stat);
                    }
                });
        }
    },
    add(path, value, success, error) {
        var that = this;
        if (this.checkConnected(error)) {
            this.zk.create(path, value,
                function (err, path) {
                    if (err) {
                        invoke(error, that.cbCtx, err);
                    } else {
                        invoke(success, that.cbCtx, path);
                    }
                });
        }
    },
    del(path, success, error) {
        var that = this;
        if (this.checkConnected(error)) {
            this.zk.remove(path,
                function (err) {
                    if (err) {
                        invoke(error, that.cbCtx, err);
                    } else {
                        invoke(success, that.cbCtx);
                    }
                });
        }
    },
    list(path, success, error) {
        var that = this;
        if (this.checkConnected(error)) {
            this.zk.getChildren(path,
                function (err, children, stat) {
                    if (err) {
                        invoke(error, that.cbCtx, err);
                    } else {
                        invoke(success, that.cbCtx, stat, children);
                    }
                });
        }
    },
    close() {
        this.zk.close();
        console.log('closed');
    }
}
export default wraper;