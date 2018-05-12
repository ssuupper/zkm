<template>
    <div :style="{'padding-left':'5px'}">
        <label class="icon" v-if="!node.loaded" @click="load()">*</label>
        <label class="icon" v-else-if="node.children && expanded" @click="expanded=false">-</label>
        <label class="icon" v-else-if="node.children && !expanded" @click="expanded=true">+</label>
        <label class="icon" v-else>○</label>
        <label class="kv" v-text="keyValue" @click="nodeClicked()" @dblclick="nodeDbClicked()" locked=true></label>
        <div v-if="node.children" v-show="expanded">
            <tree v-for="(child,index) in node.children" ref="childTrees" :key="child.key" :path="nodePath(node)" :node="child" :index="index" :zk-get="zkGet"></tree>
        </div>
    </div>
</template>
<script>
var expamle_node = {
  key: "",
  loaded: false,
  children: [
    {
      key: "node 1",
      value: "value"
    },
    {
      key: "node 2",
      children: [
        {
          key: "node 2.1",
          value: "value 2.1"
        },
        {
          key: "node 2.2",
          children: [
            {
              key: "node 2.2.1",
              value: "value 2.2.1"
            }
          ]
        }
      ]
    }
  ]
};
export default {
  name: "tree",
  props: {
    index: { type: Number, default: 0 },
    node: {
      type: Object,
      default: function() {
        return expamle_node;
      }
    },
    path: { type: String, default: "" },
    zkGet: { type: Function, required: true }
  },
  computed: {
    keyValue: function() {
      return (
        (this.node.key || "/") + (this.node.value ? ":" + this.node.value : "")
      );
    }
  },
  data() {
    return {
      expanded: false
    };
  },
  methods: {
    load() {
      var nodePath = this.path + "/" + this.node.key;
      console.log("load :" + nodePath);
      var that = this;
      this.zkGet(
        nodePath,
        function(stat, data) {
          that.$set(that.node, "value", data && data != "null" ? data : "");
          that.$set(that.node, "loaded", true);
          that.expanded = true;
          if (stat.numChildren > 0) {
            this.zk.list(nodePath, function(stat, data) {
              var children = data.map(function(item) {
                return { key: item, loaded: false };
              });
              that.$set(that.node, "children", children);
              console.log(data);
            });
          }
        },
        function(err) {
          console.log(err);
        }
      );
    },
    nodePath() {
      return this.node.key == "" ? this.path : this.path + "/" + this.node.key;
    },
    nodeClicked() {
      this.onTreeNodeClicked(this);
    },
    nodeDbClicked() {
      if (!this.node.loaded) this.load();
      else this.expanded = !this.expanded;
    },
    onTreeNodeClicked(who) {
      this.$parent.onTreeNodeClicked(who);
    }
  }
};
</script>
<style scoped>
label {
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
label.kv {
  font-family: "Courier New", Courier, monospace;
}
label.icon {
  width: 10px;
  display: inline-block;
  text-align: center;
}

label:hover {
  background-color: #ffaa99;
}
</style>
