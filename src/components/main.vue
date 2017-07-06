<template>
    <div>
        <input type="button" value="Reload" @click='reload()'>
        <br>
        <label>Zookeeper URL:</label>
        <template v-if='state==0'>
            <input type="text" v-model='zkURL'></input>
            <input type="button" value="CONNECT" @click='connect()'></input>
        </template>
        <template v-else>
            <input type="text" v-model='path'></input>
            <input type="button" value="GET" @click='get()'></input>
            <br>
            <br>
            <label class='w100'>Node Path:</label>
            <label v-text="nodePath"></label>
            <br>
            <label class='w100'>Node Key:</label>
            <input type="text" v-model='nodeKey'></input>
            <br>
            <label class='w100'>Node Value:</label>
            <input type="text" v-model='nodeValue'></input>
            <input type="button" value="SET" @click='set()'></input>
            <input type="button" value="ADD" @click='add()'></input>
            <input type="button" value="ADD_DIR" @click='addDir()'></input>
            <input type="button" value="DEL" @click='del()'></input>
            <br>
            <label v-if="error != ''" v-text="'ERROR:'+error"></label>
            <br>
            <tree :zk-get="zkGet" ref=tree></tree>
        </template>
    </div>
</template>
<script>
import zk from '../lib/zk'
import tree from './tree.vue'
export default {
    data: function () {
        return {
            greet: 'hello wxorl!!!',
            state: 0,
            zkURL: "10.11.70.119:4180",
            zk: {},
            path: "",
            nodePath: "",
            nodeKey: "",
            nodeValue: "",
            error: ''
        }
    },
    components: { tree },
    methods: {
        connect() {
            this.zk = new zk();
            this.zk.cbCtx = this;
            this.zk.connect(this.zkURL, function () {
                this.state = 1;
            });
            this.zk.hello(function () {
                console.log('success');
            });
        },
        get() {
            this.path = this.path.trim();
            var path = this.path;
            if (path != "" && (path.lastIndexOf("/") + 1 == path.length)) {
                path = path.substr(0, path.length - 1);
            }
            var n, p;
            if (path == "") {
                n = {
                    key: ""
                };
                p = "";
            } else {
                var index = path.lastIndexOf("/");
                if (index == -1) {
                    n = {
                        key: path
                    };
                    p = "";
                } else {
                    n = {
                        key: path.substring(index + 1, path.length)
                    };
                    p = path.substr(0, index);
                }
            }
            console.log("key:", n.key, "p:", p);
            n.loaded = false;
            this.$refs.tree.node = n;
            this.$refs.tree.path = p;
            this.$refs.tree.expanded = false;
        },
        zkGet(path, success, error) {
            var main = this;
            while (main && !main.zk) {
                main = main.$parent;
            }
            if (main) {
                main.zk.get && main.zk.get(path, success, error);
            }
        },
        set() {
            if (this.nodeKey == this.editNode.node.key) {
                if (this.editNode.node.children || !this.editNode.node.loaded) return;
                this.zk.set(this.editNodeFullPath(), this.nodeValue, function () {
                    this.editNode.node.value = this.nodeValue;
                    this.error = '';
                }, function (rc, error) {
                    this.error = error;
                });
            } else {
                this.add();
            }
        },
        add() {
            if (this.nodeKey == this.editNode.node.key) {
                this.set();
            } else {
                this.zk.add(this.editNodeFullPath(), this.nodeValue, function () {
                    this.error = '';
                    if (this.editNode == this.$refs.tree) {
                        return;
                    }
                    this.editNode.$parent.node.children.push({
                        key: this.nodeKey,
                        loaded: true,
                        value: this.nodeValue
                    });
                }, function (rc, error) {
                    this.error = error;
                });
            }
        },
        addDir() {
            if (this.nodeKey != this.editNode.node.key) {
                this.zk.add(this.editNodeFullPath(), "", function () {
                    this.error = '';

                    this.zk.add(this.editNodeFullPath() + "/foo", "bar", function () {
                        this.error = '';
                        if (this.editNode == this.$refs.tree) {
                            return;
                        }
                        this.editNode.$parent.node.children.push({
                            key: this.nodeKey,
                            loaded: true,
                            value: this.nodeValue,
                            children: [{
                                key: "foo",
                                loaded: true,
                                value: "bar"
                            }]
                        });
                    }, function (rc, error) {
                        this.error = error;
                    });
                }, function (rc, error) {
                    this.error = error;
                });
            }
        },
        del() {
            this.zk.del(this.editNodeFullPath(), function () {
                this.error = '';
                if (this.editNode == this.$refs.tree) {
                    return;
                }
                this.editNode.$parent.node.children.splice(this.editNode.index, 1);
                this.nodePath = "";
                this.nodeValue = "";
                this.nodeKey = "";
            }, function (rc, error) {
                this.error = error;

            });
        },
        editNodeFullPath() {
            return this.nodePath + "/" + this.nodeKey;
        },
        onTreeNodeClicked(who) {
            this.nodePath = who.path;
            this.nodeKey = who.node.key;
            this.nodeValue = who.node.value;
            this.editNode = who;
        },
        close() {
            this.zk.close && this.zk.close();
            this.state = 0;
        },
        reload() {
            this.close();
            window.location.reload();
        }
    }
}
</script>
<style scoped>
.w100 {
    width: 100px
}
</style>
