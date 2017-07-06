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
    connect(url, success, error) {
        var that = this;
        this.zk = new ZooKeeper({
            connect: url// zk server的服务器地址和监听的端口号
            , timeout: 200000 // 以毫秒为单位
            , debug_level: ZooKeeper.ZOO_LOG_LEVEL_WARN
            , host_order_deterministic: false
        });
        this.zk.connect(function (err) {
            if (err) {
                invoke(error, that.cbCtx, err)
            } else {
                invoke(success, that.cbCtx, 'success')
            }
        });
    },
    hello(success, error) {
        this.get("/com.ssuupper.exec/testzookeeper", success, error)
    },
    get(path, success, error) {
        var that = this;
        if (this.zk.state != 3) { invoke(error, this.cbCtx, "not connect"); return; }
        this.zk.a_get(path, false, function (rc, error, stat, data) {
            if (rc == 0) {
                invoke(success, that.cbCtx, stat, new String(data).toString())
            } else {
                invoke(error, that.cbCtx, rc, error)
            }
        });
    },
    set(path, value, success, error) {
        var that = this;
        if (this.zk.state != 3) { invoke(error, this.cbCtx, "not connect"); return; }
        this.zk.a_set(path, value, 0, function (rc, error, stat) {
            if (rc == 0) {
                invoke(success, that.cbCtx, stat);
            } else {
                invoke(error, that.cbCtx, rc, error)
            }
        });
    },
    add(path, value, success, error) {
        var that = this;
        if (this.zk.state != 3) { invoke(error, this.cbCtx, "not connect"); return; }
        this.zk.a_create(path, value, "", function (rc, error, path) {
            if (rc == 0) {
                invoke(success, that.cbCtx, path);
            } else {
                invoke(error, that.cbCtx, rc, error)
            }
        });
    },
    del(path, success, error) {
        var that = this;
        if (this.zk.state != 3) { invoke(error, this.cbCtx, "not connect"); return; }
        this.zk.a_delete_(path, 0, function (rc, error) {
            if (rc == 0) {
                invoke(success, that.cbCtx);
            } else {
                invoke(error, that.cbCtx, rc, error)
            }
        });

    },
    list(path, success, error) {
        var that = this;
        if (this.zk.state != 3) { invoke(error, this.cbCtx, "not connect"); return; }
        this.zk.a_get_children2(path, false, function (rc, error, data, stat) {
            if (rc == 0) {
                invoke(success, that.cbCtx, stat, data)
            } else {
                invoke(error, that.cbCtx, rc, error)
            }
        });
    },
    close() {
        if (this.zk.state == 3) {
            this.zk.close();
            console.log('closed');
        }
    }
}
export default wraper;